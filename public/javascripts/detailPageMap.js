mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v12', // style URL
center: hotel.geometry.coordinates, // starting position [lng, lat]
zoom: 12, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

new mapboxgl.Marker({color:'red'})
    .setLngLat(hotel.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML(
            `<h6>${hotel.name}</h6><p>${hotel.location}</p>`
        )
    )
    .addTo(map)
    


