export const MAPBOX_TOKEN: string = import.meta.env.VITE_MAPBOX_TOKEN || '';

export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Prayer': return '#3b82f6'; // Blue
        case 'Listen': return '#10b981'; // Green
        case 'Eat': return '#f97316'; // Orange
        case 'Serve': return '#ef4444'; // Red
        case 'Story': return '#eab308'; // Gold (Yellow)
        default: return '#6b7280'; // Gray
    }
};

export const reverseGeocode = async (lng: number, lat: number): Promise<string> => {
    if (MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE' || !MAPBOX_TOKEN) {
        return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    }

    try {
        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
            return data.features[0].place_name;
        }
    } catch (error) {
        console.error('Geocoding error:', error);
    }
    return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
};
