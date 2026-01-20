<template>
  <div class="mapDiv">
    <tdt-map :center="state.center" :zoom="state.zoom" @init="initMap" >
    </tdt-map>
  </div>
</template>
<script setup>
import { reactive } from "vue";
import CreateLineOverlay from "./tdt-line-geojson";
const state = reactive({
  center: [78.61958333333296,31.19166666666617],
  projection: 'EPSG:4326',
  zoom: 9
});
const LineGeoJson = {
  "type":"FeatureCollection",
  "features":[
    {
      "type":"Feature",
      "geometry":{
        "type":"LineString",
        "coordinates":[
          [78.62791666666628,31.19583333333283],
          [78.62374999999962,31.19583333333283],
          [78.61958333333296,31.19166666666617],
          [78.6154166666663,31.19166666666617],
          [78.61124999999964,31.18749999999951]
        ]
      },
      "properties":{
        "OBJECTID":301,
        "HYRIV_ID":40641827,
        "NEXT_DOWN":40642155,
        "MAIN_RIV":41067217,
        "LENGTH_KM":4.82,
        "DIST_DN_KM":2798.1,
        "DIST_UP_KM":37.1,
        "CATCH_SKM":18.76,
        "UPLAND_SKM":421.3,
        "ENDORHEIC":0,
        "DIS_AV_CMS":7.125,
        "ORD_STRA":3,
        "ORD_CLAS":2,
        "ORD_FLOW":6,
        "HYBAS_L12":4120731890,
        "Shape_Leng":0.0478923451678,
        "color":"#1E90FF",    // 补充：蓝色（河流常用色）
        "width":4,            // 补充：线宽4px
        "opacity":0.8         // 补充：透明度80%
      }
    },
    {
      "type":"Feature",
      "geometry":{
        "type":"LineString",
        "coordinates":[
          [78.35624999999968,31.118749999999515],
          [78.35208333333302,31.11458333333285],
          [78.34791666666636,31.11458333333285],
          [78.3437499999997,31.11041666666619],
          [78.33958333333304,31.11041666666619],
          [78.33541666666638,31.106249999999525]
        ]
      },
      "properties":{
        "OBJECTID":315,
        "HYRIV_ID":40642155,
        "NEXT_DOWN":40642483,
        "MAIN_RIV":41067217,
        "LENGTH_KM":5.97,
        "DIST_DN_KM":2792.1,
        "DIST_UP_KM":43.1,
        "CATCH_SKM":22.89,
        "UPLAND_SKM":456.8,
        "ENDORHEIC":0,
        "DIS_AV_CMS":8.472,
        "ORD_STRA":4,
        "ORD_CLAS":2,
        "ORD_FLOW":7,
        "HYBAS_L12":4120732110,
        "Shape_Leng":0.0592345678912,
        "color":"#00BFFF",    // 补充：浅蓝
        "width":5,            // 补充：线宽5px（更长的河流更粗）
        "opacity":0.85        // 补充：透明度85%
      }
    },
    {
      "type":"Feature",
      "geometry":{
        "type":"LineString",
        "coordinates":[
          [78.33541666666638,31.106249999999525],
          [78.33124999999972,31.10208333333286],
          [78.32708333333306,31.10208333333286],
          [78.3229166666664,31.0979166666662],
          [78.31874999999974,31.0979166666662]
        ]
      },
      "properties":{
        "OBJECTID":328,
        "HYRIV_ID":40642483,
        "NEXT_DOWN":40642791,
        "MAIN_RIV":41067217,
        "LENGTH_KM":4.25,
        "DIST_DN_KM":2786.9,
        "DIST_UP_KM":47.3,
        "CATCH_SKM":16.43,
        "UPLAND_SKM":489.2,
        "ENDORHEIC":0,
        "DIS_AV_CMS":9.015,
        "ORD_STRA":4,
        "ORD_CLAS":2,
        "ORD_FLOW":7,
        "HYBAS_L12":4120732110,
        "Shape_Leng":0.0421876543219,
        "color":"#87CEEB",    // 补充：天蓝色
        "width":3,            // 补充：线宽3px
        "opacity":0.9         // 补充：透明度90%
      }
    },
    {
      "type":"Feature",
      "geometry":{
        "type":"LineString",
        "coordinates":[
          [78.31874999999974,31.0979166666662],
          [78.31458333333308,31.09374999999954],
          [78.31041666666642,31.09374999999954],
          [78.30624999999976,31.089583333332875],
          [78.3020833333331,31.089583333332875],
          [78.29791666666644,31.085416666666215]
        ]
      },
      "properties":{
        "OBJECTID":342,
        "HYRIV_ID":40642791,
        "NEXT_DOWN":40643109,
        "MAIN_RIV":41067217,
        "LENGTH_KM":6.78,
        "DIST_DN_KM":2780.1,
        "DIST_UP_KM":54.1,
        "CATCH_SKM":28.97,
        "UPLAND_SKM":521.5,
        "ENDORHEIC":0,
        "DIS_AV_CMS":10.348,
        "ORD_STRA":4,
        "ORD_CLAS":2,
        "ORD_FLOW":7,
        "HYBAS_L12":4120732330,
        "Shape_Leng":0.0675432198765,
        "color":"#008080",    // 补充：青绿色
        "width":6,            // 补充：线宽6px（最长的河流最粗）
        "opacity":0.95        // 补充：透明度95%
      }
    }
  ]
}
function initMap(map) {
  const LineGeoJsonOverlay = CreateLineOverlay();
  const lineOverlay = new LineGeoJsonOverlay(LineGeoJson);
  map.addOverLay(lineOverlay);
  lineOverlay.bindClickEvent((event,data) => {
    console.log(event,data);
  });
}


</script>

<style scoped>
.mapDiv {
  width: 100vw;
  height: 100vh;
}
</style>
