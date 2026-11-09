import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ResolvedLocation, Station, TripOption } from '../../types/api';
import { getStations } from '../../services/api';
import { MapPin, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

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

    // OpenStreetMap Tiles with matte dark styling and attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      className: 'map-tiles-dark',
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
        <div style="background-color: #18181b; color: #fafafa; padding: 3px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1px solid #3f3f46; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #10b981;"></span>
          <span>Start (A)</span>
        </div>
      `,
      iconSize: [66, 24],
      iconAnchor: [33, 12],
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
        <div style="background-color: #18181b; color: #fafafa; padding: 3px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1px solid #3f3f46; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #f43f5e;"></span>
          <span>End (B)</span>
        </div>
      `,
      iconSize: [66, 24],
      iconAnchor: [33, 12],
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
        color: '#71717a',
        weight: 2,
        dashArray: '5, 8',
        opacity: 0.9,
      }
    ).addTo(map);
    guideLine.bindPopup('<strong>Approximate direct guide line</strong><br/>(Turn-by-turn route geometry is not provided by the API)');

    // Add stations to map with text labels and minimal dot indicator (never color alone)
    stations.forEach((st) => {
      bounds.extend([st.lat, st.lon]);

      const isLow = st.bikes_available <= 3;
      const isEmpty = st.bikes_available === 0;
      const dotColor = isEmpty ? '#f43f5e' : isLow ? '#f59e0b' : '#10b981';
      const textLabel = isEmpty
        ? '0 bikes'
        : isLow
        ? `${st.bikes_available} low`
        : `${st.bikes_available} bikes`;

      const stationIcon = L.divIcon({
        className: 'custom-station-marker',
        html: `
          <div style="background-color: #18181b; color: #e4e4e7; padding: 3px 6px; border-radius: 6px; font-size: 10px; font-weight: 600; white-space: nowrap; border: 1px solid #3f3f46; box-shadow: 0 2px 4px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 4px;">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${dotColor};"></span>
            <span>${textLabel}</span>
          </div>
        `,
        iconSize: [75, 22],
        iconAnchor: [37, 11],
      });

      const stationMarker = L.marker([st.lat, st.lon], { icon: stationIcon }).addTo(map);
      stationMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #18181b;">
          <h4 style="margin: 0 0 4px 0; font-weight: bold;">${st.name}</h4>
          <p style="margin: 2px 0;"><strong>Bikes available:</strong> ${st.bikes_available}</p>
          <p style="margin: 2px 0;"><strong>E-bikes available:</strong> ${st.ebikes_available}</p>
          <p style="margin: 2px 0;"><strong>Open docks:</strong> ${st.docks_available} / ${st.capacity}</p>
          <p style="margin: 2px 0; font-size: 10px; color: #52525b;">Renting: ${st.is_renting ? 'Active' : 'Closed'}</p>
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
    <Card className="border-zinc-800 bg-zinc-900/90 shadow-sm overflow-hidden">
      {/* Map Header / Legend */}
      <CardHeader className="p-4 border-b border-zinc-800 flex flex-wrap flex-row items-center justify-between gap-3 text-xs">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-zinc-300" />
            <span>Interactive Map & Live Stations</span>
          </CardTitle>
          <p className="text-zinc-500 mt-0.5 text-xs">
            Dashed line represents approximate corridor. Turn-by-turn geometries are omitted by contract.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400" aria-label="Map legend">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Origin (A)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Destination (B)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Live Bikes</span>
          </span>
        </div>
      </CardHeader>

      {/* Map Container */}
      <CardContent className="p-0 relative">
        <div
          ref={mapContainerRef}
          className="w-full h-[450px] sm:h-[520px] z-10"
          tabIndex={0}
          aria-label="Map displaying origin, destination, and nearby bike-share stations"
        />

        {/* Guide Notice Overlay */}
        <div className="absolute bottom-2 left-2 z-20 bg-zinc-950/90 backdrop-blur px-3 py-1.5 rounded-md border border-zinc-800 text-[11px] text-zinc-400 shadow-sm flex items-center gap-1.5 font-mono">
          <Info className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
          <span>Approximate straight line; routing geometry not returned by API.</span>
        </div>
      </CardContent>
    </Card>
  );
};
