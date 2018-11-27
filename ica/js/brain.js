var camera, controls, scene, renderer, drawline, d, v, f, geometry, material, mesh, colormap, conns, str, option, str2, cortex

init();
render();


function init () {
    container = document.getElementById('canvas');
    document.body.appendChild(container);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(800, 600);
    renderer.setClearColor( 0xeeeeee, 1);
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
    35,             // Field of view
    800 / 600,      // Aspect ratio
    0.1,            // Near plane
    10000           // Far plane
);

camera.position.set( 0, 0, 250 );
camera.lookAt( scene.position );


controls = new THREE.OrbitControls( camera , container );
controls.damping = 0.2;
controls.addEventListener( 'change', render );


     // load in brain using new vtk method - cheers kevo!
    loadCortex("data/cortex",0,0,0);

     // // Read in faces associated with brain
     // $.get( "data/brain_face.dat", function( data ) {
     //      parseData(data,proc_faces);
     //    });

     // // Read in vertices of brain
     // $.get( "data/brain_vert.dat", function( data ) {
     //      parseData(data,proc_vertices);
     //    });

    // Read in colormap
     $.get( "data/colourmap.dat", function( data ) {
          parseData(data,generate_colormap);
        });

    // Read in node locations
     $.get( "data/aal_points.dat", function( data ) {
          parseData(data,proc_rois);
        });

    str = "data/connections_";
  option = $( "#sel1" ).val();
  str2 = str.concat(option.toString(),".dat");

    // Read in connections
     $.get( str2, function( data ) {
          parseData(data,pause);
        });

    controls.update();
}

function animate(results) {
            requestAnimationFrame(animate);
            controls.update();
        }



function vertex(points) {
  geometry.vertices.push(new THREE.Vector3(points[0],points[2],points[1]));
};

function face(points){
	geometry.faces.push(new THREE.Face3(points[0],points[2],points[1]));
}

function parseData(data,varout) {
    Papa.parse(data, {
        header: false,
        delimiter: ",",
        newline: "↵",
        fastMode: "true",
        complete: varout,
    });
}

function proc_vertices(results) {

        v = results.data;
        v.splice(-1);
        for (i = 0, len = Object.keys(v).length ; i < len; i++) {
        // document.write(""+d[i]+"\n")
        vertex(v[i]);
    }

    geometry.computeBoundingSphere();

    material = new THREE.MeshLambertMaterial({
        emissive: 0x000103,
        wireframe: false,
        transparent: true
    });

    mesh = new THREE.Mesh(geometry,material);
    material.opacity = 0.1;
    scene.add(mesh)
        
        return v
}

function proc_faces(results) {

    f = results.data;
    f.splice(-1);
	geometry = new THREE.Geometry();
	 for (i = 0, len = f.length ; i < len; i++) {
        // document.write(""+d[i]+"\n")
        face(f[i]);
    }
    return f
}

function proc_rois(results) {

    d = results.data;
    d.splice(-1);
    return d 
}

function pause(results){
	// a quite frankly embarassing hack to compensate the simultaneous loading of the CSV files. Pauses the script to allow for slow loads.
 conns = results.data;
 window.setTimeout(draw_all,100);
 return conns
}


function draw_all() {


  
   
    conns.splice(-1);
    count = Array.apply(null, new Array(78)).map(Number.prototype.valueOf,0);
    var f = new Array();
    var mf = new Array();

    for (i=0;i<d.length;i++) {
        f[i]=new Array();
        for (j=0;j<d.length;j++) {
            f[i][j]=Math.abs(conns[i][j]);
        }
        mf[i] = Math.max.apply(Math,f[i]);
    }

    var max = Math.max.apply(Math,mf);
    var thresh = 0.7*max;

    geometry = new THREE.Geometry();

    for (i = 0; i < d.length; i++) {
        for (j = 0; j < d.length; j++) {
            if (Math.abs(conns[i][j]) > thresh) {
            		count[i] = count[i]+1;
                    geometry = new THREE.Geometry();
                    geometry.vertices.push(new THREE.Vector3(d[i][0],d[i][2],d[i][1]));
                    geometry.vertices.push(new THREE.Vector3(d[j][0],d[j][2],d[j][1]));
                    var color = new THREE.Color();
                    var rgb = colorindex(conns[i][j],max);
                    color.setRGB(colormap[rgb][0],colormap[rgb][1],colormap[rgb][2]);
					
					if (!isWindows()) {
						material = new THREE.LineBasicMaterial({
							color: color,
							linewidth: 10
						});
						scene.add(new THREE.Line(geometry,material));
					} else {
						// For windows only we'll use the meshline workaround.
            var line = new MeshLine();
            line.setGeometry(geometry,function(){return 3;}); // linewdith of 10
            material = new MeshLineMaterial({
              color: color
            })
            scene.add(new THREE.Mesh(line.geometry,material));
					}
					
            };
        };
    };

    // Draw circles

    	
	    var segments = 10,
	    rings = 5;

	// create a new mesh with
	// sphere geometry - we will cover
	// the sphereMaterial next!


	var sphereMaterial = new THREE.MeshLambertMaterial(
    {
      color: 0xFF0000,
      transparent: false
    });

	for (i = 0, len = d.length; i < len; i++) {

		if (count[i] == 0) {
			var radius = 0.1;
		} else {
			var radius = count[i]*0.75;
		}
	var sphere = new THREE.Mesh(

	  new THREE.SphereGeometry(
	    radius,
	    segments,
	    rings),

	  sphereMaterial);

	
      sphere.position.set(d[i][0],d[i][2],d[i][1]); 
     
      // console.log(sphere.position);  
      scene.add(sphere); 

      animate();
    }



    renderer.setClearColor( 0xeeeeee, 1);
    renderer.render( scene, camera );

}

function generate_colormap(results){
    colormap = results.data;
    colormap.splice(-1);
    return colormap;
};

function colorindex(value,mx){
    var hi = 2*mx;
    var v = Number(value)+mx;
    var index = Math.round(100*v/hi);
    return index

};


function sizeObj(obj) {
  return Object.keys(obj).length;
};

function render() {
  renderer.render( scene, camera );
}


function refresh() {
	var total = (scene.children.length);
	for (i = 1; i < total; i++) {
		scene.remove(scene.children[1])
	}
	str = "data/connections_";
	option = $( "#sel1" ).val();
	str2 = str.concat(option.toString(),".dat");
 	render();
 	animate();
	// Read in connections
 	$.get( str2, function( data ) {
      parseData(data,pause);
    });
  render();
 	animate();
};


function loadCortex(cortex,xp,yp,zp) {
    var objectCor2
    // Actually have the loader include the other part to make it work
    // var geo = THREE.Geometry();
    // var vertexColorMaterial         
    var loader = new THREE.VTKLoader();
    loader.load( [cortex, 'vtk'].join('.'), function ( geometry ) {

      geo = new THREE.Geometry().fromBufferGeometry( geometry );

      // geo.center();
      // geo.computeVertexNormals();
                    
    // material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
      material = new THREE.MeshLambertMaterial({
        emissive: 0x000103,
        wireframe: false,
        transparent: true,
        opacity: 0.1
    });
   


      objectCor2 = new THREE.Mesh( geo, material );
      // objectCor2.position.set( xp, yp, zp );
      objectCor2.scale.multiplyScalar( 1 );
      objectCor2.name = cortex;

        
      scene.add( objectCor2 );
    });
}

function isWindows() {
  return navigator.platform.indexOf('Win') > -1
}