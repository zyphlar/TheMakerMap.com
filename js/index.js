/**
 * Application logic.
 *
 * @package themakermap
 */

(function($){
    /**
     * Configuration
     */
    var dataProvider = '1tteiG-HYAlsmh3ef5U-XVDEWu5QXqDxqWwDx-pc';

    /**
     * Storage objects
     */
    var map, layer;

    /**
     * Generates a search query.
     *
     * @param {String} Search term
     *
     * @return {String}
     */
    function generateSearchQuery (term) {
        var q = term.replace(/^\s+|\s+$/g, "").replace(/'/g, '\\\'').toLowerCase();
            qp = "'Resource Name' CONTAINS IGNORING CASE '",
            qs = "'";

        if (q === '') return '';
        return qp + q + qs;
    }

    /**
     * Generates a filter query.
     *
     * @return {String}
     */
    function generateFilterQuery () {
        var q  = "",
            qp = "'Business Type' IN (",
            qs = ")";

        $('#filter').find('input[type="checkbox"]:checked').each(function () {
            q += "'" + $(this).attr('value') + "', ";
        });

        q = q.slice(0, q.length - 2);
        if (q === '') return '';

        return qp + q + qs;
    }

    /**
     * Generates query object for the Google Fusion Tables API.
     *
     * @return {Object}
     */
    function generateQuery () {
        var search  = generateSearchQuery($('#search').find('input').val()),
            filter  = generateFilterQuery(),
            and     = (search !== '' && filter !== '') ? ' AND ' : '';

        return {
            select: 'Location',
            from:   dataProvider,
            where:  search + and + filter
        };
    }

    /**
     * Google Maps
     */
    function initMaps () {
        map = new google.maps.Map(document.getElementById('map-canvas'), {
            center: new google.maps.LatLng(37.65, -122.25),
            zoom: 10,
            disableDefaultUI: true,
            zoomControl: true,
            streetViewControl: true
        });

        var style = [
            {
                elementType: 'geometry',
                stylers: [
                    { saturation: -100 },
                    { weight: 0.4 }
                ]
            },
            {
                featureType: 'poi',
                stylers: [
                    { visibility: "off" }
                ]
            },
            {
                featureType: 'administrative.land_parcel',
                elementType: 'all',
                stylers: [
                    { visibility: 'off' }
                ]
            }
        ];

        var styledMapType = new google.maps.StyledMapType(style, {
            map: map,
            name: 'Styled Map'
        });

        map.mapTypes.set('map-style', styledMapType);
        map.setMapTypeId('map-style');

        layer = new google.maps.FusionTablesLayer({
            query:  generateQuery(),
            map:    map
        });
    }

    function updateAnyCheckbox (e) {
        var $target = $(e.target);
        var $boxen = $('#filter').find('input[type="checkbox"]').not('[value="any"]');
        var $any   = $('#filter').find('input[value="any"]');

        if ($target.val() == 'any') {
            // update other checkboxes based on "any" state
            if ($any.is(':checked')) {
                $boxen.prop('checked', 'checked');
            } else {
                $boxen.removeAttr('checked');
            }
        } else {
            // update "any" checkbox based on others' state
            if ($boxen.not(':checked').length) {
                $any.removeAttr('checked');
            } else {
                $any.prop('checked', 'checked');
            }
        }
    }

    /**
     * UI events
     */
    function initEventListeners () {
        // Selectors
        var $search = $('#search');
        var $filter = $('#filter');

        // Search
        $search.submit(function () {
            return false;
        });

        $search.find('input').keyup(function () {
            layer.setQuery(generateQuery());
        });

        // Filter
        $filter.find('input').click(function (e) {
            updateAnyCheckbox(e);
            layer.setQuery(generateQuery());
        });
    }

    /**
     * On load, init maps & start listening for UI events
     */
    initMaps();
    initEventListeners();

})(jQuery);
