var ward_signups = {}

var ward_map;

$(document).ready(function(){
  if ($('html.lt-ie9').length != 0){ 
    // for IE8 and below, don't bother with the map
    $("#ward-map-container").remove();
    $("#main-body-copy").removeClass("span6").addClass("span12");
  } else {
    // draw_simple_map();
    // draw_map_with_styles();
    // draw_heat_map();
    draw_tooltip_map();
  }
});


// dummy data, key is ward number, value is the value
// var ward_data = {1:5,2:5,3:1,4:2,5:3,6:1,7:2,8:1,9:1,10:0,11:4,12:1,13:0,14:0,15:0,16:0,17:1,18:0,19:0,20:0,21:1,22:0,23:0,24:0,25:3,26:3,27:5,28:1,29:2,30:4,31:0,32:6,33:4,34:0,35:6,36:0,37:0,38:1,39:4,40:5,41:4,42:3,43:6,44:5,45:15,46:5,47:10,48:1,49:3,50:1};
var ward_data = {"39":12,"1":40,"2":30,"47":26,"32":39,"27":18,"36":9,"48":30,"46":22,"42":40,"16":10,"35":27,"34":23,"38":10,"49":21,"26":40,"21":15,"43":26,"14":3,"44":36,"40":18,"33":15,"8":12,"3":21,"13":12,"7":21,"24":18,"4":23,"9":8,"37":13,"22":14,"18":10,"17":8,"5":16,"19":13,"20":16,"29":9,"50":15,"10":9,"23":5,"6":15,"28":8,"12":5,"25":20,"11":10,"30":8,"15":4,"31":4,"41":7,"45":9,"BARRINGTON TWP":0,"BLOOM TWP":0};


function draw_tooltip_map(){
  // instantiate the map object
  var tooltip_ward_map = $K.map('#tooltip-map');
  
  // load the SVG file
  tooltip_ward_map.loadMap('img/combined.svg', function(){

    // add the map layer
    tooltip_ward_map.addLayer('chicago');

    layer = tooltip_ward_map.getLayer('chicago');

    // for each ward, attach the ward data to the
    // DOM object for the ward's path. This data
    // is used to create the content for the tooltips
    for(ward in ward_data){
      var path = layer.getPaths({ward: ward});
      var node = path[0].svgPath.node;
      jQuery.data(node,"signups", ward_data[path[0].data.ward]);
      jQuery.data(node,"ward", path[0].data.ward);
      jQuery.data(node,"displaynam", path[0].data.displaynam);    
    }

    // same code as the heat map
    tooltip_ward_map.getLayer('chicago').style({
      fill: function(d){ 
        if(ward_data[d.ward] == 0){
            return "#fff";
          } else {
            return color_for_value(ward_data[d.ward], ward_data);
          }
        }
    });

    // when the user hovers over a ward, the fill
    // of the ward is set to hover_color
    var hover_color = "#ccc";
    $("#tooltip-map path.chicago").each(function(idx, obj){
      // for each ward, setup the hover actions
      $(obj).bind("mouseenter", function(){ 
        // store the color of the ward pre-hover, so we
        // can reset the color when the user hovers
        // over another ward.
        $(obj).data('previous-fill-color', $(obj).attr('fill')); 
        $(obj).attr("fill", hover_color); 
      });
      
      $(obj).bind("mouseleave", function(){
        $(obj).attr("fill", $(obj).data('previous-fill-color'));
      });

      var number_of_signups = $.data(obj,'signups');
      $(obj).tooltip({
        container: 'body', 
        animation: false, 
        placement: 'left', 
        title:     "Ward " + $.data(obj,'ward') + ": " +  
                   (number_of_signups || '0') + " tester" + 
                   (number_of_signups == 1 ? '' : 's') 
      });
    });      
  });        
}

// Given a value, val, find the appropriate color for it, 
// given the range of data points in all_values
function color_for_value(val, all_values){

  // colors for map, in increasing darkness
  var color_range = ["#CCFFFF", "#99CCCC", 
                    "#669999", "#336666", "#003333"];

  // find all uniq values in all_values, return them sorted
  var counts = _.sortBy(_.uniq(_.values(all_values)), 
    function(a){ return a; } 
  );

  // pop zeros, will plot as blank regions
  if(counts[0] == 0 ){ counts.shift() }

  // find the index of the given value in 
  // the sorted collection of all values
  index_of_val = _.indexOf(counts, val);  

  // use the index of the value to calculate 
  // the index of the corresponding color
  color_index = Math.floor(
    (index_of_val / counts.length) * color_range.length
  );

  return color_range[color_index];
}
