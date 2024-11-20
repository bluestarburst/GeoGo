import React, { useEffect, useState, useCallback, FormEvent } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Input } from '@nextui-org/react';

interface Props {
    onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
    setPredictionResults: (results: Array<google.maps.places.AutocompletePrediction>) => void;
    selectedPlaceId?: string | null;
    setCurrentLocation: (place: google.maps.places.PlaceResult | null) => void;
}

// This is a custom built autocomplete component using the "Autocomplete Service" for predictions
// and the "Places Service" for place details
export const AutocompleteCustom = ({ onPlaceSelect, setPredictionResults, selectedPlaceId, setCurrentLocation }: Props) => {
    const map = useMap();
    const places = useMapsLibrary('places');

    // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompleteSessionToken
    const [sessionToken, setSessionToken] =
        useState<google.maps.places.AutocompleteSessionToken>();

    // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service
    const [autocompleteService, setAutocompleteService] =
        useState<google.maps.places.AutocompleteService | null>(null);

    // https://developers.google.com/maps/documentation/javascript/reference/places-service
    const [placesService, setPlacesService] =
        useState<google.maps.places.PlacesService | null>(null);

    

    const [inputValue, setInputValue] = useState<string>('');

    useEffect(() => {

        console.log('places', places, 'map', map);

        if (!places || !map) return;

        setAutocompleteService(new places.AutocompleteService());
        setPlacesService(new places.PlacesService(map));
        setSessionToken(new places.AutocompleteSessionToken());

        return () => setAutocompleteService(null);
    }, [map, places]);

    const fetchPredictions = useCallback(
        async (inputValue: string) => {
            console.log('fetchPredictions', inputValue);

            console.log('autocompleteService', autocompleteService);

            if (!autocompleteService || !inputValue) {
                setPredictionResults([]);
                return;
            }

            const request = { input: inputValue, sessionToken };

            console.log('fetchPredictions request', request, autocompleteService.getPlacePredictions);

            const response = await autocompleteService.getPlacePredictions(request);

            console.log('fetchPredictions response', response);

            setPredictionResults(response.predictions);
        },
        [autocompleteService, sessionToken]
    );

    const onInputChange = useCallback(
        (event: FormEvent<HTMLInputElement>) => {
            const value = (event.target as HTMLInputElement)?.value;

            setInputValue(value);
            fetchPredictions(value);
        },
        [fetchPredictions]
    );

    const handleSuggestionClick = useCallback(
        (placeId: string) => {
            if (!places) return;

            const detailRequestOptions = {
                placeId,
                fields: ['geometry', 'name', 'formatted_address'],
                sessionToken
            };

            const detailsRequestCallback = (
                placeDetails: google.maps.places.PlaceResult | null
            ) => {
                onPlaceSelect(placeDetails);
                setPredictionResults([]);
                setInputValue(placeDetails?.formatted_address ?? '');
                setSessionToken(new places.AutocompleteSessionToken());
                console.log('placeDetails', placeDetails);
                setCurrentLocation(placeDetails);
            };

            placesService?.getDetails(detailRequestOptions, detailsRequestCallback);
        },
        [onPlaceSelect, places, placesService, sessionToken]
    );

    useEffect(() => {
        if (!selectedPlaceId) return;

        handleSuggestionClick(selectedPlaceId);
    }, [selectedPlaceId]);

    return (
        <div className="autocomplete-container">
            <Input
                value={inputValue}
                onInput={(event: FormEvent<HTMLInputElement>) => onInputChange(event)}
                placeholder="Search for a place"
            />
        </div>
    );
};
