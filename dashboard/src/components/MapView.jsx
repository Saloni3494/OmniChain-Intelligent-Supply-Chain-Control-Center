import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, useLoadScript, Polyline, Marker, InfoWindow } from '@react-google-maps/api';

const RISK_COLORS = { HIGH: '#ff3366', MEDIUM: '#ffc107', LOW: '#00ff88', UNKNOWN: '#00d4ff' };

const CITY_COORDINATES = {
  'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
  'New York, NY': { lat: 40.7128, lng: -74.0060 },
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'Houston, TX': { lat: 29.7604, lng: -95.3698 },
  'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
  'Philadelphia, PA': { lat: 39.9526, lng: -75.1652 },
  'San Antonio, TX': { lat: 29.4241, lng: -98.4936 },
  'San Diego, CA': { lat: 32.7157, lng: -117.1611 },
  'Dallas, TX': { lat: 32.7767, lng: -96.7970 },
  'San Jose, CA': { lat: 37.3382, lng: -121.8863 },
  'Seattle, WA': { lat: 47.6062, lng: -122.3321 },
  'Denver, CO': { lat: 39.7392, lng: -104.9903 },
  'Miami, FL': { lat: 25.7617, lng: -80.1918 },
  'Atlanta, GA': { lat: 33.7490, lng: -84.3880 },
  'Boston, MA': { lat: 42.3601, lng: -71.0589 },
};

function getCoords(city) {
  return CITY_COORDINATES[city] || { lat: 39.8283, lng: -98.5795 };
}

const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#050a0f" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#050a0f" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#3a6a8a" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#3a6a8a" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#0a1520" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a3a54" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#3a6a8a" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#0a1520" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1a3a54" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#1a3a54" }] },
];

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 39.8283, lng: -98.5795 };

// Isolated component to prevent MapView from re-rendering every 100ms
const AnimatedDot = ({ start, end, offset, color }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame(f => f + 1), 100);
    return () => clearInterval(id);
  }, []);

  const t = ((frame + offset * 17) % 60) / 60;
  const dotPos = {
    lat: (1 - t) * start.lat + t * end.lat,
    lng: (1 - t) * start.lng + t * end.lng
  };

  return (
    <Marker
      position={dotPos}
      icon={{
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 3,
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 0,
      }}
      clickable={false}
    />
  );
};

// Component to memoize path array reference and prevent Polyline crash
const ShipmentRoute = React.memo(({ shipment, isSel, isHovered, onSelect, onHover, offset }) => {
  const o = useMemo(() => getCoords(shipment.current_location), [shipment.current_location]);
  const d = useMemo(() => getCoords(shipment.destination), [shipment.destination]);
  const path = useMemo(() => [o, d], [o, d]);
  const color = RISK_COLORS[shipment.risk_level] || '#00d4ff';

  return (
    <React.Fragment>
      <Polyline
        path={path}
        options={{
          strokeColor: color,
          strokeOpacity: isSel || isHovered ? 0.6 : 0.2,
          strokeWeight: isSel || isHovered ? 2 : 1,
          geodesic: true,
        }}
      />
      <AnimatedDot start={o} end={d} offset={offset} color={color} />
      <Marker
        position={o}
        onClick={() => onSelect(shipment)}
        onMouseOver={() => onHover(shipment)}
        icon={{
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isSel ? 8 : 5,
          fillColor: color,
          fillOpacity: isSel ? 1 : 0.8,
          strokeColor: '#050a0f',
          strokeWeight: 2,
        }}
      />
      <Marker
        position={d}
        icon={{
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 4,
          fillColor: '#ffffff',
          fillOpacity: 0.5,
          strokeColor: '#050a0f',
          strokeWeight: 1,
        }}
        clickable={false}
      />
    </React.Fragment>
  );
});

export default function MapView({ shipments, selected, onSelect }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [tooltipShipment, setTooltipShipment] = useState(null);

  if (!isLoaded) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#050a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff' }}>
        INITIALIZING SATELLITE UPLINK...
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#050a0f' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={4.5}
        center={defaultCenter}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          backgroundColor: '#050a0f'
        }}
        onClick={() => {
          onSelect(null);
          setTooltipShipment(null);
        }}
      >
        {shipments.map((s, idx) => (
          <ShipmentRoute
            key={s.shipment_id}
            shipment={s}
            isSel={selected?.shipment_id === s.shipment_id}
            isHovered={tooltipShipment?.shipment_id === s.shipment_id}
            onSelect={(ship) => {
              onSelect(ship);
              setTooltipShipment(ship);
            }}
            onHover={(ship) => setTooltipShipment(ship)}
            offset={idx}
          />
        ))}

        {(selected || tooltipShipment) && (
          <InfoWindow
            position={getCoords((selected || tooltipShipment).current_location)}
            onCloseClick={() => {
              if (tooltipShipment && !selected) setTooltipShipment(null);
              else {
                onSelect(null);
                setTooltipShipment(null);
              }
            }}
            options={{
              pixelOffset: new window.google.maps.Size(0, -10),
              disableAutoPan: true
            }}
          >
            <div style={{
              background: 'rgba(10,21,32,0.95)',
              padding: '10px 14px',
              color: '#e2f3ff',
              borderRadius: '6px',
              fontFamily: 'Inter, sans-serif',
              minWidth: '200px'
            }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#00d4ff', marginBottom: 4, fontSize: '13px' }}>
                {(selected || tooltipShipment).shipment_id}
              </div>
              <div style={{ color: '#a0b8cc', fontSize: '12px', marginBottom: 6 }}>
                <strong>{(selected || tooltipShipment).current_location?.split(',')[0]}</strong> → <strong>{(selected || tooltipShipment).destination?.split(',')[0]}</strong>
              </div>
              <div style={{ fontSize: '12px' }}>
                Risk: <span style={{ color: RISK_COLORS[(selected || tooltipShipment).risk_level], fontWeight: 700 }}>
                  {(selected || tooltipShipment).risk_level || 'UNKNOWN'}
                </span>
                <br />
                Status: <span style={{ color: '#ffc107' }}>{(selected || tooltipShipment).status}</span>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <div className="map-overlay">
        {Object.entries(RISK_COLORS).filter(([k]) => k !== 'UNKNOWN').map(([k, c]) => (
          <div key={k} className="legend-item">
            <div className="legend-dot" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
            <span style={{ color: c, fontSize: 10, fontWeight: 600 }}>{k}</span>
          </div>
        ))}
        <div className="legend-item" style={{ borderLeft: '1px solid #1a3a54', paddingLeft: 10 }}>
          <span style={{ color: '#3a6a8a', fontSize: 10 }}>{shipments.length} tracked</span>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, color: '#3a6a8a', fontFamily: 'monospace', textAlign: 'right', background: 'rgba(5,10,15,0.7)', padding: '4px 8px', borderRadius: 4, border: '1px solid #1a3a54', zIndex: 10 }}>
        OMNICHAIN RADAR · SATELLITE FEED
      </div>
      
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none',
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
        backgroundSize: '100% 4px, 3px 100%',
        zIndex: 5,
        opacity: 0.5
      }} />
    </div>
  );
}
