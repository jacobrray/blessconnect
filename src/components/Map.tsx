import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Resident } from '../models';
import { MAPBOX_TOKEN, getStatusColor } from '../utils/mapbox';
import { Plus, Crosshair, Locate, LocateFixed, Navigation, Layers } from 'lucide-react';

mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapProps {
    residents: Resident[];
    onAddResident: (coordinate: [number, number]) => void;
    onSelectResident: (resident: Resident) => void;
}

export const Map: React.FC<MapProps> = ({ residents, onAddResident, onSelectResident }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapCallback = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
    const [showCrosshair, setShowCrosshair] = useState(false);
    const [trackingMode, setTrackingMode] = useState<'none' | 'locate' | 'compass'>('none');
    const [isSatellite, setIsSatellite] = useState(false);
    const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null);

    useEffect(() => {
        if (mapCallback.current || !mapContainer.current) return;

        if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE') {
            console.warn('Mapbox token is missing or invalid');
        }

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-98.5795, 39.8283],
            zoom: 3,
            attributionControl: false, // Clean look
        });

        // Add proper zoom and compass controls
        const navControl = new mapboxgl.NavigationControl({ showCompass: true, visualizePitch: true, showZoom: true });
        map.addControl(navControl, 'bottom-right');

        // Add geolocate control (hidden, triggered by custom button)
        const geolocateControl = new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true,
            fitBoundsOptions: {
                zoom: 19.5, // Closer to 50ft scale (Zoom 19 is ~1ft/px, Zoom 20 is very close)
                maxZoom: 20
            }
        });

        map.addControl(geolocateControl, 'top-right');
        geolocateControlRef.current = geolocateControl;

        // Hide the standard button via DOM manipulation after it's added
        map.on('load', () => {
            const geolocateBtn = document.querySelector('.mapboxgl-ctrl-geolocate') as HTMLElement;
            if (geolocateBtn) geolocateBtn.style.display = 'none';
        });

        // Listen for geolocate events to update our custom button state
        geolocateControl.on('trackuserlocationstart', () => {
            // When tracking starts, we are at least in 'locate' mode
            setTrackingMode(prev => prev === 'compass' ? 'compass' : 'locate');
        });

        geolocateControl.on('trackuserlocationend', () => {
            // Only reset if we are not manually transitioning
            setTrackingMode('none');
        });
        // Note: Mapbox doesn't have a built-in "compass mode" event that distinguishes perfectly,
        // but we can manage it via our click handler.

        // Add scale control (zoom legend)
        map.addControl(new mapboxgl.ScaleControl({ maxWidth: 80, unit: 'imperial' }), 'bottom-left');

        mapCallback.current = map;

        // Initial location check
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    map.flyTo({
                        center: [position.coords.longitude, position.coords.latitude],
                        zoom: 14,
                        essential: true
                    });
                },
                (error) => console.error('Error getting location:', error)
            );
        }

        map.on('contextmenu', (e) => {
            onAddResident([e.lngLat.lng, e.lngLat.lat]);
        });

        let touchTimeout: ReturnType<typeof setTimeout>;
        map.on('touchstart', (e) => {
            touchTimeout = setTimeout(() => {
                onAddResident([e.lngLat.lng, e.lngLat.lat]);
            }, 800);
        });
        map.on('touchend', () => clearTimeout(touchTimeout));
        map.on('touchmove', () => clearTimeout(touchTimeout));

        return () => {
            map.remove();
            mapCallback.current = null;
        };
    }, []);

    // Update markers
    useEffect(() => {
        if (!mapCallback.current) return;

        const map = mapCallback.current;
        const currentResidentIds = new Set(residents.map(r => r.id));

        // Cleanup old markers
        Object.keys(markersRef.current).forEach(id => {
            if (!currentResidentIds.has(id)) {
                markersRef.current[id].remove();
                delete markersRef.current[id];
            }
        });

        // Add/Update markers
        residents.forEach(resident => {
            const color = getStatusColor(resident.currentBlessStatus);

            if (markersRef.current[resident.id]) {
                // For custom markers, updating color is tricky without checking equality.
                // We'll just recreate if needed or assume simple updates.
                // Since our custom marker uses inline styles for color, we can try to update it.
                const marker = markersRef.current[resident.id];
                const el = marker.getElement();
                const pin = el.querySelector('.pin-body') as HTMLElement;
                if (pin) pin.style.backgroundColor = color;

                // Update position if needed (though residents usually don't move)
                marker.setLngLat(resident.coordinate);
            } else {
                // Create custom DOM element for marker
                const el = document.createElement('div');
                el.className = 'custom-marker group cursor-pointer';
                el.innerHTML = `
                    <div class="relative flex flex-col items-center">
                        <div class="pin-body w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transform transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-1" style="background-color: ${color}">
                            <div class="w-2.5 h-2.5 bg-white rounded-full opacity-80"></div>
                        </div>
                        <div class="w-1 h-3 bg-gray-400/50 rounded-full mt-1 blur-[1px] group-hover:w-2 group-hover:h-1 group-hover:mt-3 transition-all"></div>
                        
                        <!-- Tooltip -->
                        <div class="absolute bottom-full mb-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                            ${resident.residentName}
                        </div>
                    </div>
                `;

                const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
                    .setLngLat(resident.coordinate)
                    .addTo(map);

                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    onSelectResident(resident);

                    map.flyTo({
                        center: resident.coordinate,
                        zoom: 16,
                        speed: 1.2,
                        essential: true
                    });
                });

                markersRef.current[resident.id] = marker;
            }
        });

    }, [residents, onSelectResident]);


    const handleAddCenter = () => {
        if (!mapCallback.current) return;
        const center = mapCallback.current.getCenter();
        onAddResident([center.lng, center.lat]);
    };

    return (
        <div className="relative w-full h-full">
            <div id="mapbox-container" ref={mapContainer} className="w-full h-full" />

            {/* Crosshair Overlay */}
            {showCrosshair && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <svg width="40" height="40" viewBox="0 0 40 40" className="text-gray-900 drop-shadow-md opacity-75">
                        <line x1="20" y1="0" x2="20" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="20" y1="25" x2="20" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="0" y1="20" x2="15" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="25" y1="20" x2="40" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="20" cy="20" r="1.5" fill="currentColor" />
                    </svg>
                </div>
            )}

            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
                <button
                    onClick={handleAddCenter}
                    className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    title="Add Resident at Center"
                >
                    <Plus className="w-6 h-6" />
                </button>

                <button
                    onClick={() => setShowCrosshair(!showCrosshair)}
                    className={`p-3 rounded-2xl premium-glass active:scale-95 transition-all flex items-center justify-center cursor-pointer hover:bg-white/80 ${showCrosshair ? 'text-indigo-600' : 'text-gray-700'}`}
                    title="Toggle Precision Crosshair"
                >
                    <Crosshair className="w-6 h-6" />
                </button>

                <button
                    onClick={() => {
                        const geolocate = geolocateControlRef.current;
                        if (!geolocate) return;

                        if (trackingMode === 'none') {
                            geolocate.trigger();
                            setTrackingMode('locate');
                        } else if (trackingMode === 'locate') {
                            setTrackingMode('compass');
                            if (mapCallback.current) {
                                mapCallback.current.easeTo({
                                    pitch: 60,
                                    zoom: 19.5,
                                    bearing: mapCallback.current.getBearing()
                                }, { duration: 1000 });
                            }
                        } else {
                            setTrackingMode('none');
                            if (mapCallback.current) {
                                mapCallback.current.easeTo({ pitch: 0 }, { duration: 1000 });
                            }
                        }
                    }}
                    className={`p-3 rounded-2xl premium-glass active:scale-95 transition-all flex items-center justify-center cursor-pointer hover:bg-white/80 ${trackingMode !== 'none' ? 'text-blue-600' : 'text-gray-700'
                        }`}
                    title={trackingMode === 'compass' ? "Compass Mode" : trackingMode === 'locate' ? "Tracking Location" : "Locate Me"}
                >
                    {trackingMode === 'compass' ? (
                        <Navigation className="w-6 h-6 fill-current" />
                    ) : trackingMode === 'locate' ? (
                        <LocateFixed className="w-6 h-6" />
                    ) : (
                        <Locate className="w-6 h-6" />
                    )}
                </button>
                <button
                    onClick={() => {
                        const newIsSatellite = !isSatellite;
                        setIsSatellite(newIsSatellite);
                        if (mapCallback.current) {
                            mapCallback.current.setStyle(
                                newIsSatellite
                                    ? 'mapbox://styles/mapbox/satellite-streets-v12'
                                    : 'mapbox://styles/mapbox/streets-v12'
                            );
                        }
                    }}
                    className={`p-3 rounded-2xl premium-glass active:scale-95 transition-all flex items-center justify-center cursor-pointer hover:bg-white/80 ${isSatellite ? 'text-green-600' : 'text-gray-700'}`}
                    title="Toggle Satellite View"
                >
                    <Layers className="w-6 h-6" />
                </button>
            </div>

            {/* Hint overlay */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-white/50 text-xs font-medium text-gray-500 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500 z-10">
                Right-click to add • Tap pin to view
            </div>
        </div>
    );
};
