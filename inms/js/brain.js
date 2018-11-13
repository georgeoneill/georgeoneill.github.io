var camera, controls, scene, renderer, drawline, d, v, f, geometry, material, mesh, colormap, conns

container = document.getElementById('canvas');
document.body.appendChild(container);

renderer = new THREE.WebGLRenderer();
renderer.setSize(800, 600);
container.appendChild( renderer.domElement );

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(
    35,             // Field of view
    4 / 3,      // Aspect ratio
    0.1,            // Near plane
    10000           // Far plane
);

camera.position.set( -250, 50, 100 );
camera.lookAt( scene.position );

controls = new THREE.OrbitControls( camera , container );
controls.damping = 0.2;
controls.addEventListener( 'change', render );

geometry = new THREE.Geometry();
// Read in colormap
 // $.get( "data/colourmap.dat", function( data ) {
 //      parseData(data,generate_colormap);
 //    });
 // Read in faces associated with brain

  $.get( "data/brain_face.dat", function( data ) {
      parseData(data,proc_faces);
    });

// Read in vertices of brain
 $.get( "data/brain_vert.dat", function( data ) {
      parseData(data,proc_vertices);
    });


// Read in node locations
 // $.get( "data/aal_points.dat", function( data ) {
 //      parseData(data,proc_rois);
 //    });

// Read in connections
 // $.get( "data/connections.dat", function( data ) {
 //      parseData(data,pause);
 //    });

window.setTimeout(draw_all,1000);
render();


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
        fastmode: "true",
        complete: varout,
    });
}

function animate(results) {
            requestAnimationFrame(animate);
            controls.update();
        }

function proc_vertices(results) {

        v = results.data;
        v.splice(-1);
           
        return v
}

function proc_faces(results) {

    f = results.data;
    f.splice(-1);
    
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
 window.setTimeout(draw_all,10);
 return conns
}


function draw_all() {

     for (i = 0, len = Object.keys(f).length ; i < len; i++) {
        // document.write(""+d[i]+"\n")
        face(f[i]);
    }

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


   
 //    conns.splice(-1);
 //    count = Array.apply(null, new Array(78)).map(Number.prototype.valueOf,0);
 //    var f = new Array();
 //    var mf = new Array();

 //    for (i=0;i<d.length;i++) {
 //        f[i]=new Array();
 //        for (j=0;j<d.length;j++) {
 //            f[i][j]=Math.abs(conns[i][j]);
 //        }
 //        mf[i] = Math.max.apply(Math,f[i]);
 //    }

 //    var max = Math.max.apply(Math,mf);
 //    var thresh = 0.7*max;

 //    geometry = new THREE.Geometry();

 //    for (i = 0; i < d.length; i++) {
 //        for (j = 0; j < d.length; j++) {
 //            if (Math.abs(conns[i][j]) > thresh) {
 //                 count[i] = count[i]+1;
 //                    geometry = new THREE.Geometry();
 //                    geometry.vertices.push(new THREE.Vector3(d[i][0],d[i][2],d[i][1]));
 //                    geometry.vertices.push(new THREE.Vector3(d[j][0],d[j][2],d[j][1]));
 //                    var color = new THREE.Color();
 //                    var rgb = colorindex(conns[i][j],max);
 //                    color.setRGB(colormap[rgb][0],colormap[rgb][1],colormap[rgb][2]);
 //                    material = new THREE.LineBasicMaterial({
 //                        color: color,
 //                        linewidth: 10
 //                    });
 //                    scene.add(new THREE.Line(geometry,material));
 //            };
 //        };
 //    };

 //    // Draw circles

        
    //     var segments = 10,
    //     rings = 5;

    // // create a new mesh with
    // // sphere geometry - we will cover
    // // the sphereMaterial next!


    // var sphereMaterial = new THREE.MeshLambertMaterial(
 //    {
 //      color: 0xFF0000,
 //      transparent: false
 //    });

    // for (i = 0, len = d.length; i < len; i++) {

    //  if (count[i] == 0) {
    //      var radius = 0.1;
    //  } else {
    //      var radius = count[i];
    //  }
    // var sphere = new THREE.Mesh(

    //   new THREE.SphereGeometry(
    //     radius,
    //     segments,
    //     rings),

    //   sphereMaterial);

    
 //      sphere.position.set(d[i][0],d[i][2],d[i][1]); 
     
 //      console.log(sphere.position);  
 //      scene.add(sphere); 
 //    }



    renderer.setClearColor( 0xeeeeee, 1);
    renderer.render( scene, camera );

    animate();

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

function render() {
    renderer.render( scene, camera );
};

function sizeObj(obj) {
  return Object.keys(obj).length;
};


