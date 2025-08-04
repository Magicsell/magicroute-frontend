import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert, 
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent
} from '@mui/material';

// Mapbox access token from environment variable
  const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// Real Mapbox token for MagicSell
  const REAL_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// Helper function to get API URL
const getApiUrl = () => {
  const isIPhone = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isIPhone && !isLocalhost) {
    // iPhone accessing via IP address
    const currentHost = window.location.hostname;
    return `http://${currentHost}:5000`;
  } else {
                return process.env.NODE_ENV === 'production' 
        ? 'https://api.magicroute.co.uk' // Yeni API subdomain
        : 'http://localhost:5001';
  }
};

const MapComponent = ({ orders, optimizedRoute, onRouteOptimized }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [routeLines, setRouteLines] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [routeStats, setRouteStats] = useState({
    totalDistance: 0,
    totalTime: 0,
    totalFuel: 0,
    orderCount: 0
  });

  useEffect(() => {
    if (map.current) return; // Map already initialized

    try {
      // Use real Mapbox token
      const tokenToUse = REAL_TOKEN;
      
      if (!tokenToUse) {
        setError('Mapbox token gerekli. Lütfen .env dosyasına REACT_APP_MAPBOX_TOKEN ekleyin.');
        return;
      }

      mapboxgl.accessToken = tokenToUse;

      // Wait for container to be ready
      if (!mapContainer.current) {
        console.log('Map container not ready');
        return;
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-1.8976, 50.7428], // Bournemouth center (better for UK South Coast)
        zoom: 8, // Slightly more zoomed out for better overview
        minZoom: 6, // Allow more zoom out
        maxZoom: 16 // Allow more zoom in
      });

      // Wait for map to load
      map.current.on('load', () => {
        console.log('Map loaded successfully');
        
        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Add fullscreen control
        map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

        // Add depot marker
        new mapboxgl.Marker({ color: '#FF6B6B', scale: 1.2 })
          .setLngLat([-1.9876, 50.7128])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #FF6B6B;">🏢 Poole Depot</h3>
              <p style="margin: 4px 0;"><strong>📍 Address:</strong> BH13 7EX</p>
              <p style="margin: 4px 0;"><strong>🚚 Starting Point</strong></p>
            </div>
          `))
          .addTo(map.current);

        setMapInitialized(true);
      });

    } catch (err) {
      setError('Harita yüklenirken hata oluştu. Lütfen Mapbox token\'ını kontrol edin.');
      console.error('Mapbox error:', err);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add markers when orders change or map is initialized
  useEffect(() => {
    if (mapInitialized && orders.length > 0) {
      addOrderMarkers();
    }
  }, [orders, optimizedRoute, mapInitialized, statusFilter]);

  const clearMarkers = () => {
    markers.forEach(marker => {
      marker.remove();
      // Also remove the label marker if it exists
      if (marker.labelMarker) {
        marker.labelMarker.remove();
      }
    });
    setMarkers([]);
  };

  const clearRouteLines = () => {
    if (!map.current) return;
    
    // First, remove all layers that use these sources
    routeLines.forEach(line => {
      try {
        // Remove the main route layer
        if (map.current.getLayer(line.id)) {
          map.current.removeLayer(line.id);
        }
        // Remove arrow layer if it exists
        if (map.current.getLayer(line.id + '-arrows')) {
          map.current.removeLayer(line.id + '-arrows');
        }
      } catch (error) {
        console.log('Error removing route layer:', line.id, error);
      }
    });
    
    // Then, remove all sources
    routeLines.forEach(line => {
      try {
        if (map.current.getSource(line.id)) {
          map.current.removeSource(line.id);
        }
      } catch (error) {
        console.log('Error removing route source:', line.id, error);
      }
    });
    
    setRouteLines([]);
  };

  const addOrderMarkers = async () => {
    // Filter orders by status
    const filteredOrders = statusFilter === 'all' 
      ? orders 
      : orders.filter(order => order.status === statusFilter);
    
    // Use optimized route if available, otherwise use filtered orders
    const ordersToDisplay = optimizedRoute.length > 0 ? optimizedRoute : filteredOrders;
    
    if (!map.current || !ordersToDisplay.length || !mapInitialized) {
      console.log('Map not ready:', { 
        mapExists: !!map.current, 
        ordersLength: ordersToDisplay.length, 
        mapInitialized,
        usingOptimizedRoute: optimizedRoute.length > 0 
      });
      return;
    }

    clearMarkers();
    clearRouteLines();
    
    const newMarkers = [];
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([-1.9876, 50.7128]); // Depot

    const coordinates = [];
    coordinates.push([-1.9876, 50.7128]); // Depot

    // Track used coordinates to avoid duplicates
    const usedCoordinates = new Set();

    // Known postcode coordinates for better accuracy
    const knownPostcodes = {
      'BH10 6LF': [-1.8976, 50.7428], // Bournemouth
      'W1W 7LT': [-0.1386, 51.5200],  // London
      'BH23 3TQ': [-1.7766, 50.7338], // Christchurch
      'SO14 7FN': [-1.4044, 50.9094], // Southampton
      'BH22 9HT': [-1.8996, 50.7994], // Ferndown
      'BH22 8EB': [-1.8875, 50.8002], // West Parley, Ferndown (Barber 77)
      'BH22 8EH': [-1.8875, 50.8002], // West Parley, Ferndown (Barber 77)
      'PO16 9UZ': [-1.1791, 50.8516], // Fareham (Portchester)
      'BH8 8SN': [-1.8476, 50.7208],  // Boscombe (UK King Barbering)
      'BH13 7EX': [-1.9876, 50.7128]  // Poole Depot
    };

    for (let i = 0; i < ordersToDisplay.length; i++) {
      const order = ordersToDisplay[i];
      if (!order.customerPostcode) continue;

      try {
        let [lng, lat] = [0, 0];
        
        // First check if we have known coordinates for this postcode
        if (knownPostcodes[order.customerPostcode]) {
          [lng, lat] = knownPostcodes[order.customerPostcode];
          console.log(`Using known coordinates for ${order.customerPostcode}:`, [lng, lat]);
        } else {
          // Geocode postcode to coordinates with better parameters
        const tokenToUse = REAL_TOKEN;
          const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(order.customerPostcode)}.json?access_token=${tokenToUse}&country=GB&types=postcode&limit=1`;

          console.log(`Geocoding postcode: ${order.customerPostcode}`);
        const response = await fetch(geocodingUrl);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            [lng, lat] = data.features[0].center;
            console.log(`Geocoded ${order.customerPostcode} to:`, [lng, lat]);
          } else {
            console.warn(`No coordinates found for postcode: ${order.customerPostcode}`);
            // Skip this order if we can't find coordinates
            continue;
          }
        }

          // Check if map is still available
          if (!map.current) {
            console.log('Map was removed during geocoding');
            return;
          }

        // Check for duplicate coordinates to avoid overlapping markers
        const coordKey = `${lng.toFixed(4)},${lat.toFixed(4)}`;
        if (usedCoordinates.has(coordKey)) {
          console.log(`Skipping duplicate coordinates for Order #${order.basketNo} (${order.customerPostcode}): ${coordKey}`);
          continue;
        }
        usedCoordinates.add(coordKey);

          // Create marker with route order number
          const routeOrderNumber = optimizedRoute.length > 0 ? i + 1 : order.basketNo;
        const markerColor = getMarkerColor(order.status, optimizedRoute.length > 0);
          
        // Create unique popup ID using basketNo instead of id to avoid duplicates
        const popupId = `popup-${order.basketNo}-${routeOrderNumber}`;
          
          const marker = new mapboxgl.Marker({ 
            color: markerColor,
          scale: 0.8,
          draggable: true // Sürüklenebilir marker
          })
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup({ 
                closeButton: true,
                closeOnClick: false,
                maxWidth: '300px',
                offset: 25
              }).setHTML(`
                <div id="${popupId}" style="min-width: 200px;">
                  <h4 style="margin: 0 0 8px 0; color: #1976d2;">📦 Order #${order.basketNo}</h4>
                  <p style="margin: 4px 0;"><strong>🚚 Route Order:</strong> #${routeOrderNumber}</p>
                  <p style="margin: 4px 0;"><strong>👤 Customer:</strong> ${order.customerName}</p>
                  <p style="margin: 4px 0;"><strong>📍 Address:</strong> ${order.customerAddress}</p>
                  <p style="margin: 4px 0;"><strong>📮 Postcode:</strong> ${order.customerPostcode}</p>
                  <p style="margin: 4px 0;"><strong>💰 Amount:</strong> £${order.totalAmount}</p>
                  <p style="margin: 4px 0;"><strong>🚚 Delivery:</strong> ${order.deliveryNo}</p>
                <p style="margin: 4px 0;"><strong>📊 Status:</strong> 
                  <span style="color: ${getStatusColor(order.status)};">${order.status}</span>
                </p>
                  ${order.routeDistance ? `<p style="margin: 4px 0;"><strong>📏 Distance:</strong> ${order.routeDistance.toFixed(2)} km</p>` : ''}
                <p style="margin: 4px 0; font-size: 11px; color: #666;">
                  <strong>📍 Coordinates:</strong> ${lng.toFixed(4)}, ${lat.toFixed(4)}
                </p>
                </div>
              `)
            )
            .addTo(map.current);

        // Sürükleme sonrası yeni konumu yakala
        marker.on('dragend', async () => {
          const newLngLat = marker.getLngLat();
          console.log(`Order #${order.basketNo} yeni konum:`, newLngLat);
          
          // Update label marker position to match the main marker
          if (marker.labelMarker) {
            marker.labelMarker.setLngLat(newLngLat);
          }
          
          // Reverse geocode to get new address from coordinates
          try {
            const tokenToUse = REAL_TOKEN;
            const reverseGeocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${newLngLat.lng},${newLngLat.lat}.json?access_token=${tokenToUse}&country=GB&types=address&limit=1`;
            
            console.log(`Reverse geocoding for new location:`, reverseGeocodingUrl);
            const response = await fetch(reverseGeocodingUrl);
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
              const newAddress = data.features[0];
              const newPostcode = newAddress.context?.find(ctx => ctx.id.startsWith('postcode'))?.text || 'Unknown';
              const newAddressText = newAddress.place_name || 'Unknown Address';
              
              console.log(`New address for Order #${order.basketNo}:`, {
                address: newAddressText,
                postcode: newPostcode,
                coordinates: [newLngLat.lng, newLngLat.lat]
              });
              
              // Update popup with new address information
              const popupId = `popup-${order.id}-${routeOrderNumber}`;
              const popupElement = document.getElementById(popupId);
              if (popupElement) {
                const addressElement = popupElement.querySelector('p:nth-child(4)'); // Address line
                const postcodeElement = popupElement.querySelector('p:nth-child(5)'); // Postcode line
                const coordinatesElement = popupElement.querySelector('p:last-child'); // Coordinates line
                
                if (addressElement) {
                  addressElement.innerHTML = `<strong>📍 Address:</strong> ${newAddressText}`;
                }
                if (postcodeElement) {
                  postcodeElement.innerHTML = `<strong>📮 Postcode:</strong> ${newPostcode}`;
                }
                if (coordinatesElement) {
                  coordinatesElement.innerHTML = `<strong>📍 Coordinates:</strong> ${newLngLat.lng.toFixed(4)}, ${newLngLat.lat.toFixed(4)}`;
                }
              }
              
              // Update order data with new address (you can send this to backend)
              const updatedOrder = {
                ...order,
                customerAddress: newAddressText,
                customerPostcode: newPostcode,
                newCoordinates: [newLngLat.lng, newLngLat.lat]
              };
              
              console.log(`Updated order data:`, updatedOrder);
              
              // Here you can send the updated order to backend
              // await updateOrderInBackend(updatedOrder);
              
            } else {
              console.warn(`No address found for new coordinates:`, newLngLat);
            }
          } catch (error) {
            console.error('Error reverse geocoding new location:', error);
          }
          
          // Burada istersen backend'e güncelleme isteği gönderebilirsin
        });

          // Add click event to marker
          marker.getElement().addEventListener('click', () => {
          console.log(`Marker clicked for Order ${order.basketNo} (Route Order ${routeOrderNumber}) at ${order.customerPostcode}`);
          });

          newMarkers.push(marker);
          bounds.extend([lng, lat]);

          // Add route order number label
          const el = document.createElement('div');
          el.className = 'order-label';
          const labelColor = optimizedRoute.length > 0 ? '#FF9800' : '#1976d2';
          el.innerHTML = `<span style="background: ${labelColor}; color: white; padding: 2px 6px; border-radius: 50%; font-size: 10px; font-weight: bold;">${routeOrderNumber}</span>`;
          
          const labelMarker = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .setOffset([0, -20])
            .addTo(map.current);
            
          newMarkers.push(labelMarker);
        
        // Store reference to label marker for drag synchronization
        marker.labelMarker = labelMarker;
        
        coordinates.push([lng, lat]);
      } catch (err) {
        console.error('Geocoding error for order:', order.id, order.customerPostcode, err);
      }
    }

    setMarkers(newMarkers);

    // Draw route lines if we have coordinates (with delay to ensure markers are added)
    if (coordinates.length > 1) {
      setTimeout(async () => {
        await drawRouteLines(coordinates);
        await calculateRouteStats(coordinates);
      }, 200);
    }

    // Fit map to show all markers
    if (newMarkers.length > 0 && map.current) {
      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  const getMarkerColor = (status, isOptimized) => {
    if (isOptimized) return '#FF9800'; // Orange for optimized route
    
    switch (status) {
      case 'Delivered':
        return '#4CAF50'; // Green
      case 'In Progress':
        return '#FF9800'; // Orange
      case 'Pending':
        return '#2196F3'; // Blue
      default:
        return '#9E9E9E'; // Grey
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#4CAF50';
      case 'In Progress':
        return '#FF9800';
      case 'Pending':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const drawRouteLines = async (coordinates) => {
    if (!map.current || coordinates.length < 2) return;

    // Use timestamp to make unique IDs
    const timestamp = Date.now();
    const routeId = `optimized-route-${timestamp}`;
    const arrowId = `${routeId}-arrows`;
    
    // Clear any existing routes first
    clearRouteLines();
    
    // Wait a bit for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      try {
        // Get real road route using Mapbox Directions API
        const tokenToUse = REAL_TOKEN;
        let routeCoordinates = [];
        
        // Build waypoints for the route
        const waypoints = coordinates.map(coord => coord.join(','));
        const profile = 'driving'; // Use driving profile for car routes
        
        // Create route request URL
        const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${waypoints.join(';')}?geometries=geojson&overview=full&access_token=${tokenToUse}`;
        
        console.log('Requesting route:', directionsUrl);
        
        const response = await fetch(directionsUrl);
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          // Use the actual road route coordinates
          routeCoordinates = data.routes[0].geometry.coordinates;
          console.log('Route coordinates received:', routeCoordinates.length, 'points');
        } else {
          // Fallback to straight lines if API fails
          console.log('Directions API failed, using straight lines');
          routeCoordinates = coordinates;
        }

        // Add route source
        map.current.addSource(routeId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates
            }
          }
        });

        // Add route layer with road-like styling
        map.current.addLayer({
          id: routeId,
          type: 'line',
          source: routeId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#FF6B6B',
            'line-width': 6,
            'line-opacity': 0.8,
            'line-dasharray': [2, 2] // Dashed line for better visibility
          }
        });

        // Add arrow layer for direction
        map.current.addLayer({
          id: arrowId,
          type: 'symbol',
          source: routeId,
          layout: {
            'symbol-placement': 'line',
            'text-field': '▶',
            'text-size': 14,
            'text-allow-overlap': true
          },
          paint: {
            'text-color': '#FF6B6B'
          }
        });

        setRouteLines([{ id: routeId }, { id: arrowId }]);
      } catch (error) {
        console.error('Error adding route layers:', error);
        // Fallback to straight lines
        try {
          map.current.addSource(routeId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: coordinates
              }
            }
          });

          map.current.addLayer({
            id: routeId,
            type: 'line',
            source: routeId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#FF6B6B',
              'line-width': 4,
              'line-opacity': 0.8
            }
          });

          setRouteLines([{ id: routeId }]);
        } catch (fallbackError) {
          console.error('Fallback route drawing failed:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Error drawing route lines:', error);
    }
  };

  const calculateRouteStats = async (coordinates) => {
    let totalDistance = 0;
    let totalTime = 0;
    
    try {
      // Get real route distance and time using Mapbox Directions API
      const tokenToUse = REAL_TOKEN;
      const waypoints = coordinates.map(coord => coord.join(','));
      const profile = 'driving';
      
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${waypoints.join(';')}?overview=false&access_token=${tokenToUse}`;
      
      const response = await fetch(directionsUrl);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        // Use actual route distance and duration
        totalDistance = data.routes[0].distance / 1000; // Convert meters to kilometers
        totalTime = data.routes[0].duration / 60; // Convert seconds to minutes
        console.log('Real route stats:', { distance: totalDistance, time: totalTime });
      } else {
        // Fallback to Haversine calculation
        console.log('Using fallback distance calculation');
        for (let i = 1; i < coordinates.length; i++) {
          const [lng1, lat1] = coordinates[i - 1];
          const [lng2, lat2] = coordinates[i];
          
          // Calculate distance using Haversine formula
          const R = 6371; // Earth's radius in km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLng = (lng2 - lng1) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          totalDistance += distance;
        }
        totalTime = totalDistance * 2; // 2 minutes per km average
      }
    } catch (error) {
      console.error('Error calculating route stats:', error);
      // Fallback to simple calculation
      for (let i = 1; i < coordinates.length; i++) {
        const [lng1, lat1] = coordinates[i - 1];
        const [lng2, lat2] = coordinates[i];
        
        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        totalDistance += distance;
      }
      totalTime = totalDistance * 2; // 2 minutes per km average
    }

    const totalFuel = totalDistance * 0.2; // 0.2L per km average

    setRouteStats({
      totalDistance: totalDistance,
      totalTime: totalTime,
      totalFuel: totalFuel,
      orderCount: coordinates.length - 1 // Exclude depot
    });
  };

  const optimizeRoute = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = getApiUrl();
      console.log('Optimizing route with API URL:', apiUrl);
      
      // Filter active orders
      const activeOrders = orders.filter(order => 
        order.status === 'Pending' || order.status === 'In Process'
      );
      
      if (activeOrders.length === 0) {
        setError('No active orders to optimize!');
        return;
      }
      
      console.log('Active orders for optimization:', activeOrders);
      
      const response = await fetch(`${apiUrl}/api/optimize-route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startPostcode: 'BH13 7EX',
          orders: activeOrders
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Route optimization failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Optimization response:', data);
      
      if (onRouteOptimized) {
        onRouteOptimized(data);
      }

      // Clear existing markers and add optimized route markers
      clearMarkers();
      clearRouteLines();
      
      // Wait a bit for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Add markers for optimized route
      await addOrderMarkers();

    } catch (err) {
      setError(`Route optimizasyonu sırasında hata oluştu: ${err.message}`);
      console.error('Route optimization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearRoute = () => {
    clearMarkers();
    clearRouteLines();
    setRouteStats({
      totalDistance: 0,
      totalTime: 0,
      totalFuel: 0,
      orderCount: 0
    });
  };

  // Function to add a new marker at a specific location
  const addNewMarker = async (order, coordinates) => {
    if (!map.current) return;

    const [lng, lat] = coordinates;
    const routeOrderNumber = order.basketNo;
    const markerColor = getMarkerColor(order.status, false);
    
    // Create unique popup ID using basketNo instead of id to avoid duplicates
    const popupId = `popup-${order.basketNo}-${routeOrderNumber}`;
    
    const marker = new mapboxgl.Marker({ 
      color: markerColor,
      scale: 0.8,
      draggable: true
    })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({ 
          closeButton: true,
          closeOnClick: false,
          maxWidth: '300px',
          offset: 25
        }).setHTML(`
          <div id="${popupId}" style="min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #1976d2;">📦 Order #${order.basketNo}</h4>
            <p style="margin: 4px 0;"><strong>🚚 Route Order:</strong> #${routeOrderNumber}</p>
            <p style="margin: 4px 0;"><strong>👤 Customer:</strong> ${order.customerName}</p>
            <p style="margin: 4px 0;"><strong>📍 Address:</strong> ${order.customerAddress}</p>
            <p style="margin: 4px 0;"><strong>📮 Postcode:</strong> ${order.customerPostcode}</p>
            <p style="margin: 4px 0;"><strong>💰 Amount:</strong> £${order.totalAmount}</p>
            <p style="margin: 4px 0;"><strong>🚚 Delivery:</strong> ${order.deliveryNo}</p>
            <p style="margin: 4px 0;"><strong>📊 Status:</strong> 
              <span style="color: ${getStatusColor(order.status)};">${order.status}</span>
            </p>
            ${order.routeDistance ? `<p style="margin: 4px 0;"><strong>📏 Distance:</strong> ${order.routeDistance.toFixed(2)} km</p>` : ''}
            <p style="margin: 4px 0; font-size: 11px; color: #666;">
              <strong>📍 Coordinates:</strong> ${lng.toFixed(4)}, ${lat.toFixed(4)}
            </p>
          </div>
        `)
      )
      .addTo(map.current);

    // Add dragend event
    marker.on('dragend', async () => {
      const newLngLat = marker.getLngLat();
      console.log(`Order #${order.basketNo} yeni konum:`, newLngLat);
      
      // Update label marker position
      if (marker.labelMarker) {
        marker.labelMarker.setLngLat(newLngLat);
      }
      
      // Reverse geocode to get new address
      try {
        const tokenToUse = REAL_TOKEN;
        const reverseGeocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${newLngLat.lng},${newLngLat.lat}.json?access_token=${tokenToUse}&country=GB&types=address&limit=1`;
        
        const response = await fetch(reverseGeocodingUrl);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const newAddress = data.features[0];
          const newPostcode = newAddress.context?.find(ctx => ctx.id.startsWith('postcode'))?.text || 'Unknown';
          const newAddressText = newAddress.place_name || 'Unknown Address';
          
          console.log(`New address for Order #${order.basketNo}:`, {
            address: newAddressText,
            postcode: newPostcode,
            coordinates: [newLngLat.lng, newLngLat.lat]
          });
          
          // Update popup with new address
          const popupElement = document.getElementById(popupId);
          if (popupElement) {
            const addressElement = popupElement.querySelector('p:nth-child(4)');
            const postcodeElement = popupElement.querySelector('p:nth-child(5)');
            const coordinatesElement = popupElement.querySelector('p:last-child');
            
            if (addressElement) {
              addressElement.innerHTML = `<strong>📍 Address:</strong> ${newAddressText}`;
            }
            if (postcodeElement) {
              postcodeElement.innerHTML = `<strong>📮 Postcode:</strong> ${newPostcode}`;
            }
            if (coordinatesElement) {
              coordinatesElement.innerHTML = `<strong>📍 Coordinates:</strong> ${newLngLat.lng.toFixed(4)}, ${newLngLat.lat.toFixed(4)}`;
            }
          }
          
          // Update order data
          const updatedOrder = {
            ...order,
            customerAddress: newAddressText,
            customerPostcode: newPostcode,
            newCoordinates: [newLngLat.lng, newLngLat.lat]
          };
          
          console.log(`Updated order data:`, updatedOrder);
        }
      } catch (error) {
        console.error('Error reverse geocoding new location:', error);
      }
    });

    // Add click event
    marker.getElement().addEventListener('click', () => {
      console.log(`Marker clicked for Order ${order.basketNo} at new location`);
    });

    // Add label marker
    const el = document.createElement('div');
    el.className = 'order-label';
    const labelColor = '#1976d2';
    el.innerHTML = `<span style="background: ${labelColor}; color: white; padding: 2px 6px; border-radius: 50%; font-size: 10px; font-weight: bold;">${routeOrderNumber}</span>`;
    
    const labelMarker = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .setOffset([0, -20])
      .addTo(map.current);
      
    marker.labelMarker = labelMarker;
    
    return marker;
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '700px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2" sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          🗺️ Delivery Route Map
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status Filter"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            >
              <MenuItem value="all">All Orders</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={clearRoute}
            size="small"
            sx={{
              borderColor: '#FF6B6B',
              color: '#FF6B6B',
              '&:hover': {
                borderColor: '#FF5252',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
              },
              transition: 'all 0.3s ease',
              fontWeight: 'bold'
            }}
          >
            🗑️ Clear
          </Button>
        <Button
          variant="contained"
          onClick={optimizeRoute}
          disabled={isLoading || !orders.length || !mapInitialized}
          sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              '&:hover': { 
                background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
              },
              '&:disabled': {
                background: 'linear-gradient(45deg, #ccc 0%, #999 100%)',
                transform: 'none',
                boxShadow: 'none'
              },
              transition: 'all 0.3s ease',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {isLoading ? 'Optimizing...' : '🚀 Optimize Route'}
        </Button>
        </Box>
      </Box>

      {/* Route Statistics */}
      {routeStats.orderCount > 0 && (
        <Card sx={{ 
          mb: 2, 
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 3 }}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 1,
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                  border: '1px solid rgba(33, 150, 243, 0.2)'
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    📏 Total Distance
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    {routeStats.totalDistance.toFixed(1)} km
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 1,
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                  border: '1px solid rgba(255, 152, 0, 0.2)'
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    ⏱️ Estimated Time
                  </Typography>
                  <Typography variant="h6" color="warning.main" sx={{ fontWeight: 'bold' }}>
                    {Math.round(routeStats.totalTime)} min
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 1,
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
                  border: '1px solid rgba(244, 67, 54, 0.2)'
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    ⛽ Fuel Usage
                  </Typography>
                  <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
                    {routeStats.totalFuel.toFixed(1)} L
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 1,
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
                  border: '1px solid rgba(76, 175, 80, 0.2)'
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    📦 Orders
                  </Typography>
                  <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {routeStats.orderCount}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Chip 
          label="🏢 Depot" 
          sx={{ 
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #FF5252 0%, #FF7A7A 100%)',
              boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease'
          }} 
          size="small" 
        />
        <Chip 
          label="📦 Pending" 
          sx={{ 
            background: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease'
          }} 
          size="small" 
        />
        <Chip 
          label="🚚 In Progress" 
          sx={{ 
            background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #F57C00 0%, #FF9800 100%)',
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease'
          }} 
          size="small" 
        />
        <Chip 
          label="✅ Delivered" 
          sx={{ 
            background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #388E3C 0%, #4CAF50 100%)',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease'
          }} 
          size="small" 
        />
        <Chip 
          label="🛣️ Optimized Route" 
          sx={{ 
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #FF5252 0%, #FF7A7A 100%)',
              boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease'
          }} 
          size="small" 
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!mapInitialized && !error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Harita yükleniyor... Mapbox token gerekli.
        </Alert>
      )}

      <Box
        ref={mapContainer}
        sx={{
          width: '100%',
          height: 'calc(100% - 150px)', // Daha fazla alan map için
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: '#f5f5f5',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)'
          }
        }}
      />
    </Paper>
  );
};

export default MapComponent; 