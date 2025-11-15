/// <reference types="@types/google.maps" />
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useDebouncedCallback } from '@tanstack/react-pacer';
import { Map, Marker, useMapsLibrary, type MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

export default function SupermarketMap() {
  const [bounds, setBounds] = useState<google.maps.LatLngBoundsLiteral>({
    east: 24.66150174841922,
    north: 60.16890028219774,
    south: 60.1470112745917,
    west: 24.605110986090118,
  });
  const [places, setPlaces] = useState<google.maps.places.Place[] | null>(null);
  const loadPlaces = useDebouncedCallback(
    async (
      boundsRaw: google.maps.LatLngBoundsLiteral,
      geometryLib: google.maps.GeometryLibrary | null,
      placesLib: google.maps.PlacesLibrary | null,
    ) => {
      if (!geometryLib || !placesLib) return;

      const bounds = new google.maps.LatLngBounds(boundsRaw);
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const diameter = geometryLib.spherical.computeDistanceBetween(ne, sw);
      const radius = Math.min(diameter / 2, 50000);
      const request = {
        fields: ['displayName', 'location', 'formattedAddress', 'googleMapsURI'],
        locationRestriction: { center: bounds.getCenter(), radius },
        includedPrimaryTypes: ['grocery_store'],
        maxResultCount: 20,
        rankPreference: placesLib.SearchNearbyRankPreference.DISTANCE,
      };
      const { places } = await placesLib.Place.searchNearby(request);
      setPlaces(places);
    },
    { wait: 500 },
  );

  const geometryLib = useMapsLibrary('geometry');
  const placesLib = useMapsLibrary('places');
  useEffect(() => loadPlaces(bounds, geometryLib, placesLib), [geometryLib, placesLib]);

  return (
    <div className="flex-1 min-h-[80svh] max-h-[80svh] items-stretch flex flex-row">
      <div className="w-1/3 max-w-96 border-r">
        {places?.length ? (
          <ul className="overflow-y-auto h-full">
            {places.map((place) => (
              <li
                key={place.id}
                className="p-4 border-b">
                <h3 className="text-lg font-semibold">{place.displayName}</h3>
                <p>{place.formattedAddress}</p>
                {place.googleMapsURI && (
                  <a
                    href={place.googleMapsURI}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500">
                    View on Google Maps
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col justify-center items-center h-full">
            {places ? (
              <Empty className="align">
                <EmptyHeader>
                  <EmptyTitle>No supermarkets found</EmptyTitle>
                  <EmptyDescription>Try zooming out to see more results</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Spinner />
            )}
          </div>
        )}
      </div>
      <Map
        className="flex-1"
        defaultBounds={bounds}
        minZoom={12}
        onCameraChanged={(ev: MapCameraChangedEvent) => {
          setBounds(ev.detail.bounds);
          loadPlaces(ev.detail.bounds, geometryLib, placesLib);
        }}
        styles={[
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }],
          },
        ]}>
        {places &&
          places.map((place) => (
            <Marker
              key={place.id}
              position={place.location!}
              title={place.displayName}
            />
          ))}
      </Map>
    </div>
  );
}
