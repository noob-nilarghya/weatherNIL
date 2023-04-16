console.log("Here");

const secMap= document.querySelector('.section-map');

if(secMap){
    const coords= JSON.parse(secMap.dataset.coords);
    const lat= coords.lat; const lon= coords.lon; const city= coords.CITY;

    const mapID = document.getElementById('map');

    const interSectionMap = function (entries, observer) {
        const entry = entries[0];

        if (entry.isIntersecting == true) {
            console.log("Intersected");

            // Actual Map Integration
            //console.log(locations);
            /*
            [
              {
                coordinates: [-80.128473, 25.781842],
                day: 1,
                description: "Lummus Park Beach",
                ....
              },
              {} ....
            ]
            */

            const locations = [
                {
                    coordinates: [lon-1, lat-1],
                    description: city
                },
                {
                    coordinates: [lon, lat],
                    description: city
                },
                {
                    coordinates: [lon+1, lat+1],
                    description: city
                }
            ];

            console.log(locations);

            var map = new maplibregl.Map({
                container: 'map', // that id in which map will be placed
                style: 'https://api.maptiler.com/maps/streets/style.json?key=k9IFWLIKRlgFFrLE2I20', // style of map
                scrollZoom: true // scroll to zoom set to false


                // OTHER OPTIONS
                // zoom: 10
                // center: [-118.113491, 34.111745],
                // interactive: false
            });

            const bounds = new maplibregl.LngLatBounds();

            let idx=0;
            locations.forEach(loc => {
                if(idx==1){
                    // Create marker
                    const el = document.createElement('div'); // create div
                    el.className = 'marker';   // apply pre defined style class named 'marker'

                    // Add marker
                    new maplibregl.Marker({
                        element: el,
                        anchor: 'bottom' // point will be at the bottom of pin (image in 'marker')
                    })
                        .setLngLat(loc.coordinates)
                        .addTo(map);

                    // Add popup
                    new maplibregl.Popup({
                        offset: 30
                    })
                        .setLngLat(loc.coordinates)
                        .setHTML(`<p>${loc.description}</p>`) // what will be written on each of the marker
                        .addTo(map);
                }
                // Extend map bounds to include current location. [OR adjust map zoom to accomodate all location]
                bounds.extend(loc.coordinates);
                idx++;
            });

            map.fitBounds(bounds, {
                // Manual padding (not mandatory, but useful if your map is not completely visible due to styling of your webpage)
                padding: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100
                }
            });

            observer.unobserve(entry.target);
        }
    };

    const sectionObserverMap = new IntersectionObserver(interSectionMap, {
        root: null,
        threshold: 0.1, // 0.1 means 10% errorMargin
    });

    sectionObserverMap.observe(mapID);
}