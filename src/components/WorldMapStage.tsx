import React, { useEffect, useMemo, useRef, useState } from 'react';
import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import landAtlas from 'world-atlas/land-110m.json';
import { Award, Check, Play, RotateCcw } from 'lucide-react';
import { ExpeditionStation } from '../data/expeditions';

interface WorldMapStageProps {
  stations: ExpeditionStation[];
  selectedStationId: 1 | 2 | 3 | null;
  activeRouteStationId: 1 | 2 | 3;
  onSelectStation: (id: 1 | 2 | 3) => void;
  stationProgress: Record<1 | 2 | 3, { answered: number; correct: number }>;
  animationNonce: number;
  isPlayingAll: boolean;
  onTogglePlayAll: () => void;
  onReplayCurrent: () => void;
  totalAnswered: number;
  onOpenSummary: () => void;
}

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 520;

interface ShipTransform {
  x: number;
  y: number;
  facingLeft: boolean;
  progress: number;
}

export const WorldMapStage: React.FC<WorldMapStageProps> = ({
  stations,
  selectedStationId,
  activeRouteStationId,
  onSelectStation,
  stationProgress,
  animationNonce,
  isPlayingAll,
  onTogglePlayAll,
  onReplayCurrent,
  totalAnswered,
  onOpenSummary,
}) => {
  const {
    landPath,
    graticulePath,
    spherePath,
    projectedMarkers,
    routePaths,
    portPositions,
    continentLabels,
  } = useMemo(() => {
    const projection = geoNaturalEarth1().fitExtent(
      [
        [10, 10],
        [MAP_WIDTH - 10, MAP_HEIGHT - 10],
      ],
      { type: 'Sphere' }
    );

    const pathGen = geoPath(projection);
    const atlas = landAtlas as unknown as Parameters<typeof feature>[0] & {
      objects: { land: Parameters<typeof feature>[1] };
    };
    const landGeo = feature(atlas, atlas.objects.land);

    const lPath = pathGen(landGeo) ?? '';
    const gPath = pathGen(geoGraticule10()) ?? '';
    const sPath = pathGen({ type: 'Sphere' }) ?? '';

    const markers = stations.map((st) => {
      const coords = projection(st.markerCoords) ?? [0, 0];
      return {
        id: st.id,
        x: coords[0],
        y: coords[1],
        station: st,
      };
    });

    const rPaths: Record<1 | 2 | 3, string> = {
      1: '',
      2: '',
      3: '',
    };
    for (const st of stations) {
      rPaths[st.id] =
        pathGen({
          type: 'LineString',
          coordinates: st.routeWaypoints,
        }) ?? '';
    }

    const lisbon = projection([-9.14, 38.72]) ?? [470, 150];
    const palos = projection([-6.89, 37.23]) ?? [476, 154];

    const labels = [
      { text: 'EURÓPA', coords: projection([15, 51]) ?? [530, 115], ocean: false },
      { text: 'AFRIKA', coords: projection([21, 7]) ?? [545, 250], ocean: false },
      { text: 'ÉSZAK-AMERIKA', coords: projection([-100, 44]) ?? [220, 145], ocean: false },
      { text: 'DÉL-AMERIKA', coords: projection([-60, -15]) ?? [325, 315], ocean: false },
      { text: 'ÁZSIA', coords: projection([88, 46]) ?? [735, 130], ocean: false },
      { text: 'AUSZTRÁLIA', coords: projection([134, -25]) ?? [835, 345], ocean: false },
      { text: 'Atlanti-óceán', coords: projection([-38, 12]) ?? [385, 235], ocean: true },
      { text: 'Indiai-óceán', coords: projection([73, -16]) ?? [685, 315], ocean: true },
      { text: 'Csendes-óceán', coords: projection([-142, -5]) ?? [135, 275], ocean: true },
    ];

    return {
      landPath: lPath,
      graticulePath: gPath,
      spherePath: sPath,
      projectedMarkers: markers,
      routePaths: rPaths,
      portPositions: { lisbon, palos },
      continentLabels: labels,
    };
  }, [stations]);

  const activePathRef = useRef<SVGPathElement | null>(null);
  const [pathLength, setPathLength] = useState<number>(0);
  const [ship, setShip] = useState<ShipTransform | null>(null);

  useEffect(() => {
    const pathEl = activePathRef.current;
    if (!pathEl) return;

    const totalLen = pathEl.getTotalLength();
    setPathLength(totalLen);

    if (totalLen <= 0) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      const endPt = pathEl.getPointAtLength(totalLen);
      const prevPt = pathEl.getPointAtLength(Math.max(0, totalLen - 4));
      setShip({
        x: endPt.x,
        y: endPt.y,
        facingLeft: endPt.x < prevPt.x,
        progress: 1,
      });
      return;
    }

    let rafId = 0;
    const duration = activeRouteStationId === 3 ? 2100 : 1650;
    let startTime: number | null = null;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const raw = Math.min(1, (now - startTime) / duration);
      const eased =
        raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;

      const currentLen = eased * totalLen;
      const pt = pathEl.getPointAtLength(currentLen);
      const prevPt = pathEl.getPointAtLength(Math.max(0, currentLen - 4));
      const nextPt = pathEl.getPointAtLength(Math.min(totalLen, currentLen + 4));

      const dx = currentLen > 4 ? pt.x - prevPt.x : nextPt.x - pt.x;

      setShip({
        x: pt.x,
        y: pt.y,
        facingLeft: dx < -0.05,
        progress: eased,
      });

      if (raw < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [activeRouteStationId, animationNonce]);

  const activeStation =
    stations.find((s) => s.id === activeRouteStationId) ?? stations[0];

  const dashOffset = pathLength * (1 - (ship?.progress ?? 0));

  return (
    <section
      aria-label="Felfedezések interaktív világtérképe"
      className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
    >
      {/* Map stage header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-200 bg-slate-50/80">
        <div className="flex items-center gap-2.5 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">
            {selectedStationId
              ? `${activeStation.id}. állomás: ${activeStation.regionName}`
              : 'Kattints a térképen az 1-es, 2-es vagy 3-as számra a kérdések megnyitásához!'}
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span className="text-slate-600 font-mono text-xs tabular-nums">
            {activeStation.explorer} ({activeStation.year})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onReplayCurrent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Újrahajózás
          </button>
          <button
            type="button"
            onClick={onTogglePlayAll}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
              isPlayingAll
                ? 'bg-sky-800 text-white border-sky-800'
                : 'bg-white text-sky-900 border-sky-200 hover:bg-sky-50'
            }`}
          >
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            {isPlayingAll ? 'Bemutató folyamatban…' : 'Mindhárom út animálása'}
          </button>
          {totalAnswered > 0 && (
            <button
              type="button"
              onClick={onOpenSummary}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                totalAnswered === 9
                  ? 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" aria-hidden="true" />
              Kiértékelés ({totalAnswered}/9)
            </button>
          )}
        </div>
      </div>

      {/* Responsive map viewport with darker blue oceans & yellow continents */}
      <div className="relative w-full aspect-[1000/520] bg-[#0e2d4a] select-none overflow-hidden">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="w-full h-full block"
          role="img"
          aria-label="Világtérkép sötétkék óceánokkal, sárga kontinensekkel és a felfedezők útvonalaival"
        >
          <defs>
            <radialGradient id="deepOceanGlow" cx="50%" cy="46%" r="62%">
              <stop offset="0%" stopColor="#1e5382" />
              <stop offset="65%" stopColor="#153e63" />
              <stop offset="100%" stopColor="#0f2c48" />
            </radialGradient>
            <clipPath id="sphereClip">
              <path d={spherePath} />
            </clipPath>
          </defs>

          {/* Globe sphere dark maritime blue ocean */}
          <path
            d={spherePath}
            fill="url(#deepOceanGlow)"
            stroke="#60a5fa"
            strokeOpacity={0.35}
            strokeWidth={1.4}
          />

          <g clipPath="url(#sphereClip)">
            {/* Subtle coordinate graticules */}
            <path
              d={graticulePath}
              fill="none"
              stroke="#7dd3fc"
              strokeOpacity={0.18}
              strokeWidth={0.6}
              strokeDasharray="2 3"
            />

            {/* Yellow Continents */}
            <path
              d={landPath}
              fill="#f3ca52"
              stroke="#854d0e"
              strokeWidth={0.9}
              strokeLinejoin="round"
            />

            {/* Continent and Ocean Labels */}
            {continentLabels.map((lbl) => (
              <text
                key={lbl.text}
                x={lbl.coords[0]}
                y={lbl.coords[1]}
                textAnchor="middle"
                className={
                  lbl.ocean
                    ? 'fill-sky-100/80 italic text-[10.5px] font-medium tracking-wider'
                    : 'fill-[#451a03]/85 text-[9.5px] font-bold tracking-[0.14em]'
                }
              >
                {lbl.text}
              </text>
            ))}

            {/* Background dashed guide routes for all 3 expeditions */}
            {stations.map((st) => {
              const isCompleted = stationProgress[st.id].answered === 3;
              const isSelected = st.id === activeRouteStationId;
              return (
                <path
                  key={`bg-route-${st.id}`}
                  d={routePaths[st.id]}
                  fill="none"
                  stroke={
                    isSelected
                      ? '#fef08a'
                      : isCompleted
                        ? '#6ee7b7'
                        : '#bae6fd'
                  }
                  strokeOpacity={isSelected ? 0.5 : 0.35}
                  strokeWidth={isSelected ? 3 : 1.7}
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Active animated maritime route with dark casing + bright ivory-gold stroke */}
            <path
              d={routePaths[activeRouteStationId]}
              fill="none"
              stroke="#091d32"
              strokeOpacity={0.55}
              strokeWidth={5.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={pathLength || 1}
              strokeDashoffset={dashOffset}
            />
            <path
              ref={activePathRef}
              d={routePaths[activeRouteStationId]}
              fill="none"
              stroke="#fef9c3"
              strokeWidth={3.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={pathLength || 1}
              strokeDashoffset={dashOffset}
            />

            {/* Departure anchor dots in Iberian Peninsula */}
            <g>
              <circle
                cx={portPositions.lisbon[0]}
                cy={portPositions.lisbon[1]}
                r={4}
                fill="#b91c1c"
                stroke="#ffffff"
                strokeWidth={1.4}
              />
              <circle
                cx={portPositions.palos[0]}
                cy={portPositions.palos[1]}
                r={3.4}
                fill="#dc2626"
                stroke="#ffffff"
                strokeWidth={1.2}
              />
              <text
                x={portPositions.lisbon[0] - 10}
                y={portPositions.lisbon[1] - 10}
                textAnchor="end"
                className="fill-white text-[9.5px] font-semibold drop-shadow-xs"
              >
                Portugália / Spanyolország
              </text>
            </g>

            {/* Larger, Ornate Animated Caravel Ship */}
            {ship && (
              <g
                transform={`translate(${ship.x}, ${ship.y})`}
                aria-hidden="true"
              >
                {/* Arrival water ripple */}
                {ship.progress > 0.96 && (
                  <circle
                    cx={0}
                    cy={6}
                    r={22}
                    fill="none"
                    stroke="#fef08a"
                    strokeOpacity={0.6}
                    strokeWidth={2}
                  />
                )}
                <g
                  transform={`scale(${ship.facingLeft ? -1.9 : 1.9}, 1.9) translate(-16, -24)`}
                >
                  <g className="caravel-bob">
                    {/* Bright foamy ocean wake lines */}
                    <path
                      d="M -7 23 Q -2 21 3 23 M -10 25.5 Q -3 23.5 4 25.5"
                      fill="none"
                      stroke="#e0f2fe"
                      strokeOpacity={0.85}
                      strokeWidth={1.2}
                      strokeLinecap="round"
                    />
                    {/* Masts */}
                    <line x1="10.5" y1="5.5" x2="10.5" y2="20" stroke="#451a03" strokeWidth="1.2" />
                    <line x1="17" y1="2" x2="17" y2="20" stroke="#451a03" strokeWidth="1.5" />
                    <line x1="23.5" y1="7.5" x2="23.5" y2="20" stroke="#451a03" strokeWidth="1.1" />
                    {/* Fluttering crimson pennant at top of main mast */}
                    <path
                      d="M 17 2 L 22.5 3.6 L 17 5 Z"
                      fill="#dc2626"
                      stroke="#7f1d1d"
                      strokeWidth="0.4"
                    />
                    {/* Fore sail */}
                    <path
                      d="M 10.5 6.5 Q 14.8 11 10.5 17.5 L 6.2 16 Q 8.5 11 10.5 6.5 Z"
                      fill="#fef3c7"
                      stroke="#78350f"
                      strokeWidth="0.85"
                    />
                    {/* Main billowing sail */}
                    <path
                      d="M 17 4.2 Q 23.8 10.5 17 18.2 L 11.8 17 Q 15.2 11 17 4.2 Z"
                      fill="#ffffff"
                      stroke="#78350f"
                      strokeWidth="0.95"
                    />
                    {/* Maritime cross emblem on main sail */}
                    <path
                      d="M 16.4 9.3 L 16.4 13.7 M 14.3 11.5 L 18.5 11.5"
                      stroke="#b91c1c"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />
                    {/* Lateen mizzen sail */}
                    <path
                      d="M 23.5 8.5 L 27.8 16.2 L 21.5 17.2 Z"
                      fill="#fde68a"
                      stroke="#78350f"
                      strokeWidth="0.85"
                    />
                    {/* Wooden caravel hull with high stern castle */}
                    <path
                      d="M 3.5 18.5 L 27.5 17.2 L 25.5 23.6 Q 15.5 25.2 6.5 23.2 Z"
                      fill="#78350f"
                      stroke="#290f02"
                      strokeWidth="0.9"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 5 20.4 L 26.2 19.6"
                      stroke="#f59e0b"
                      strokeWidth="1"
                      strokeOpacity={0.8}
                    />
                  </g>
                </g>
              </g>
            )}

            {/* Ornate Compass Rose in bottom-left Pacific Ocean */}
            <g transform="translate(70, 428)" aria-hidden="true">
              <circle
                cx={0}
                cy={0}
                r={24}
                fill="#0f2c48"
                fillOpacity={0.8}
                stroke="#f3ca52"
                strokeOpacity={0.75}
                strokeWidth={1.1}
              />
              <circle
                cx={0}
                cy={0}
                r={19}
                fill="none"
                stroke="#f3ca52"
                strokeOpacity={0.35}
                strokeWidth={0.7}
              />
              <path
                d="M 0 -17 L 3.8 -3.8 L 17 0 L 3.8 3.8 L 0 17 L -3.8 3.8 L -17 0 L -3.8 -3.8 Z"
                fill="#fef3c7"
                stroke="#854d0e"
                strokeWidth={0.8}
              />
              <path d="M 0 -17 L 3.8 -3.8 L 0 0 Z" fill="#dc2626" />
              <path d="M 0 -17 L -3.8 -3.8 L 0 0 Z" fill="#991b1b" />
              <text x="0" y="-27" textAnchor="middle" className="fill-amber-200 text-[8.5px] font-bold">
                É
              </text>
              <text x="0" y="34" textAnchor="middle" className="fill-sky-100/80 text-[8px] font-semibold">
                D
              </text>
              <text x="31" y="3" textAnchor="middle" className="fill-sky-100/80 text-[8px] font-semibold">
                K
              </text>
              <text x="-32" y="3" textAnchor="middle" className="fill-sky-100/80 text-[8px] font-semibold">
                Ny
              </text>
            </g>
          </g>
        </svg>

        {/* Accessible HTML Numbered Hotspots (1, 2, 3) */}
        {projectedMarkers.map(({ id, x, y, station }) => {
          const isSelected = selectedStationId === id;
          const prog = stationProgress[id];
          const isCompleted = prog.answered === 3;

          const markerBg = isSelected
            ? '#b91c1c'
            : isCompleted
              ? '#047857'
              : '#0f2942';

          return (
            <div
              key={id}
              style={{
                left: `${(x / MAP_WIDTH) * 100}%`,
                top: `${(y / MAP_HEIGHT) * 100}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => onSelectStation(id)}
                aria-label={`${id}. állomás: ${station.regionName} (${prog.answered}/3 megválaszolva)`}
                aria-pressed={isSelected}
                style={{ backgroundColor: markerBg, color: '#ffffff' }}
                className={`group relative flex items-center justify-center w-12 h-12 rounded-full font-mono text-lg font-bold transition-transform duration-200 cursor-pointer shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
                  isSelected
                    ? 'ring-4 ring-amber-300 scale-110'
                    : isCompleted
                      ? 'ring-2 ring-amber-200 hover:scale-105'
                      : 'ring-2 ring-amber-300 hover:scale-108'
                }`}
              >
                <span className="tabular-nums text-white leading-none">
                  {station.numberLabel}
                </span>

                {isCompleted && (
                  <span
                    className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-white text-emerald-700 border border-emerald-300 shadow-xs"
                    aria-hidden="true"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </button>

              {/* High-contrast region caption directly under the numbered pin */}
              <button
                type="button"
                onClick={() => onSelectStation(id)}
                tabIndex={-1}
                className={`mt-1.5 px-2.5 py-0.5 rounded text-[11.5px] font-semibold tracking-tight whitespace-nowrap shadow-md border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-300 text-slate-950 border-amber-500'
                    : 'bg-[#0f2942]/95 text-amber-50 border-amber-300/60 hover:bg-[#163b5e]'
                }`}
              >
                {station.regionName}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom map legend & station quick-launch strip */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-700">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <span className="inline-flex items-center gap-2">
            <span className="w-5 h-1 bg-amber-400 border border-slate-700 inline-block rounded-full" aria-hidden="true" />
            <span>Kiválasztott hajózási útvonal</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#f3ca52] border border-amber-800 inline-block" aria-hidden="true" />
            <span>Kontinensek</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#16426b] inline-block" aria-hidden="true" />
            <span>Tengerek és óceánok</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono tabular-nums text-slate-700">
          {stations.map((s) => {
            const prog = stationProgress[s.id];
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectStation(s.id)}
                className={`inline-flex items-center gap-1.5 hover:text-sky-800 transition-colors cursor-pointer ${
                  selectedStationId === s.id ? 'font-bold text-sky-900 underline underline-offset-4' : ''
                }`}
              >
                <span>
                  {s.id}. {s.regionName}
                </span>
                <span className="text-slate-500">({prog.answered}/3)</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
