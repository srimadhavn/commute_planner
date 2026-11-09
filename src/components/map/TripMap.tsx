import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ResolvedLocation, Station, TripOption } from '../../types/api';
import { getStations } from '../../services/api';
import { MapPin, Info } from 'lucide-react';

interface TripMapProps {
  origin: ResolvedLocation;
  destination: ResolvedLocation;
  options?: TripOption[];
}

export const TripMap: React.FC<TripMapProps> = ({ origin, destination }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [stations, setStations] = useState<Station[]>([]);

  // Determine center coordinates
  const originLat = origin.lat ?? 40.758;
  const originLon = origin.lon ?? -73.9855;
  const destLat = destination.lat ?? 40.7527;
  const destLon = destination.lon ?? -73.9772;

  // Fetch nearby stations
  useEffect(() => {
    let isMounted = true;

    // Query stations near midpoint or origin
    const midLat = (originLat + destLat) / 2;
    const midLon = (originLon + destLon) / 2;

    getStations({ lat: midLat, lon: midLon, radius_km: 2.0, limit: 20 })
      .then((res) => {
        if (isMounted) {
          setStations(res.stations || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Failed to load nearby stations for map', err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [originLat, originLon, destLat, destLon]);

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Remove existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // OpenStreetMap Tiles with required attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const bounds = L.latLngBounds([
      [originLat, originLon],
      [destLat, destLon],
    ]);

    // Origin Marker (A)
    const originIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="background-color: #059669; color: white; padding: 4px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);">
          <span>A</span>
          <span>Start</span>
        </div>
      `,
      iconSize: [60, 26],
      iconAnchor: [30, 13],
    });

    const originMarker = L.marker([originLat, originLon], {
      icon: originIcon,
      title: `Origin: ${origin.label}`,
    }).addTo(map);
    originMarker.bindPopup(`<strong>Origin (Start):</strong><br/>${origin.label}`);

    // Destination Marker (B)
    const destIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="background-color: #e11d48; color: white; padding: 4px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);">
          <span>B</span>
          <span>End</span>
        </div>
      `,
      iconSize: [60, 26],
      iconAnchor: [30, 13],
    });

    const destMarker = L.marker([destLat, destLon], {
      icon: destIcon,
      title: `Destination: ${destination.label}`,
    }).addTo(map);
    destMarker.bindPopup(`<strong>Destination (End):</strong><br/>${destination.label}`);

    // Dashed approximate guide line (NEVER invented turn-by-turn routes!)
    const guideLine = L.polyline(
      [
        [originLat, originLon],
        [destLat, destLon],
      ],
      {
        color: '#64748b',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.8,
      }
    ).addTo(map);
    guideLine.bindPopup('<strong>Approximate direct guide line</strong><br/>(Turn-by-turn route geometry is not provided by the API)');

    // Add stations to map with text labels and color coding (never color alone)
    stations.forEach((st) => {
      bounds.extend([st.lat, st.lon]);

      const isLow = st.bikes_available <= 3;
      const isEmpty = st.bikes_available === 0;
      const bgColor = isEmpty ? '#e11d48' : isLow ? '#d97706' : '#0d9488';
      const textLabel = isEmpty
        ? '0 bikes (empty)'
        : isLow
        ? `${st.bikes_available} low`
        : `${st.bikes_available} bikes`;

      const stationIcon = L.divIcon({
        className: 'custom-station-marker',
        html: `
          <div style="background-color: ${bgColor}; color: white; padding: 3px 6px; border-radius: 6px; font-size: 10px; font-weight: 700; white-space: nowrap; border: 1.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 3px;">
            <span>🚲</span>
            <span>${textLabel}</span>
          </div>
        `,
        iconSize: [85, 22],
        iconAnchor: [42, 11],
      });

      const stationMarker = L.marker([st.lat, st.lon], { icon: stationIcon }).addTo(map);
      stationMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px;">
          <h4 style="margin: 0 0 4px 0; font-weight: bold;">${st.name}</h4>
          <p style="margin: 2px 0;"><strong>Bikes available:</strong> ${st.bikes_available}</p>
          <p style="margin: 2px 0;"><strong>E-bikes available:</strong> ${st.ebikes_available}</p>
          <p style="margin: 2px 0;"><strong>Open docks:</strong> ${st.docks_available} / ${st.capacity}</p>
          <p style="margin: 2px 0; font-size: 10px; color: #64748b;">Renting: ${st.is_renting ? 'Active' : 'Closed'}</p>
        </div>
      `);
    });

    map.fitBounds(bounds, { padding: [50, 50] });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [originLat, originLon, destLat, destLon, origin.label, destination.label, stations]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Map Header / Legend */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary-600" />
            <span>Interactive Map & Live Stations</span>
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            Dashed line represents approximate corridor. Turn-by-turn geometries are omitted by contract.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5" aria-label="Map legend">
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Origin (A)</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>Destination (B)</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            <span>Live Citi Bikes</span>
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapContainerRef}
          className="w-full h-[450px] sm:h-[520px] z-10"
          tabIndex={0}
          aria-label="Map displaying origin, destination, and nearby bike-share stations"
        />

        {/* Guide Notice Overlay */}
        <div className="absolute bottom-2 left-2 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-primary-600 shrink-0" />
          <span>Approximate straight line; routing geometry not returned by API.</span>
        </div>
      </div>
    </div>
  );
};
