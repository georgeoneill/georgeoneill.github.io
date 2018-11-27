
      var container, stats, q, cortex, ready, exp, hand;
      var map = null
      var camera, controls, scene, renderer;
      var faceIndices = [ 'a', 'b', 'c', 'd' ];
      
      init();                      
      animate();    

      function init() {
        // camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 1e10 );
        

        container = document.getElementById('canvas');
        document.body.appendChild(container);


        var width = Math.min(600, window.innerWidth);
        canvas.width = width
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, width);
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setClearColor( 0xeeeeee, 1);
        container.appendChild( renderer.domElement );

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 60, 1, 0.01, 1e10 );
        camera.position.z = 100;
        controls = new THREE.TrackballControls( camera, container );
        controls.rotateSpeed = 5.0;
        controls.zoomSpeed = 5;
        controls.panSpeed = 2;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        scene = new THREE.Scene();
        scene.add( camera );
        // light
        var dirLight = new THREE.DirectionalLight( 0xffffff );
        dirLight.position.set( 200, 200, 1000 ).normalize();
        camera.add( dirLight );
        camera.add( dirLight.target );

        // define the quality of the mesh and overlay as low (can be changed by user)
        q = '_lo';

        // define which experiment we need (inms to start)
        exp = '_inms';
		hand = false;

		    // Here have left and right cortices, load them in add them to the scene global variable.
        loadCortex('data/lcortex',-20,0,0);            
        loadCortex('data/rcortex',+20,0,0);    
          
        renderer.setPixelRatio( window.devicePixelRatio );
        

        // container.appendChild( renderer.domElement );
        requestAnimationFrame( animate );
        controls.update();
        renderer.render( scene, camera );  
      };
  
	   function animate() {
        requestAnimationFrame( animate );
        controls.update();
        renderer.render( scene, camera );        
      }

      function changeOverlay(overlayType)
      {
        map = overlayType // save this for later
        var total = (scene.children.length);
        if (total == 3) {
          scene.children[1].overlayFunction(1,overlayType);
         
        } else {

        }
      }

      function addHandArea(){
        var total = (scene.children.length);
        for (i = 0; i < total; i++){
          if (scene.children[i].name[5] === "r"){
            scene.children[i].drawHand();
			hand = true;
          }
        }
      }
	  
	  function addBetaPeak(){
		  var total = (scene.children.length)
		  for (i = 0; i < total; i++){
          if (scene.children[i].name[5] === "r"){
		      obj = scene.children[i];
			  geo = obj.geometry;
			  
			  // work out which vertex we need to overlay the dot
			  switch (q) {
				  case '_hi':
					  var vid = 26812;
					  break;
				  case '_md':
					  var vid = 25812;
					  break;
				  case '_lo':
					  var vid = 4657;
			  }
			  
			  // get sphere centre coordinates
			  var x = geo.vertices[vid].x;
			  var y = geo.vertices[vid].y;
			  var z = geo.vertices[vid].z;
			  
			  
			  // build and draw sphere
			  var sphereMaterial = new THREE.MeshLambertMaterial(
				{
				  color: 0xFF00FF,
				  transparent: false
				});
			  
				var sphere = new THREE.Mesh(new THREE.SphereGeometry(2,10,5),sphereMaterial);
				sphere.position.set(20+0.4*x,0.4*y,0.4*z);
				scene.add(sphere); 
			  }
          
        }
	  }

      function changeExperiment(etmp){
        if (etmp === exp) {
          // no need to do anything
        } else {
          exp = etmp;
          if (map){
            changeOverlay(map);
          }
		  if (hand){
			  hand_holding_pattern();
		  }
        }
      }
      
      function changeQuality(qtmp){

        // First need to check if the quality has changed or we are just making work for ourselves...
        if (qtmp === q) {
          // no need to do anything
        } else {
          // delete all objects in the scene and load in the correct ones (but keep the camera!)
          var total = (scene.children.length);
          for (i = 1; i < total; i++) {
            scene.remove(scene.children[1])
          }
          q = qtmp;

          // redraw the cortices
          loadCortex('data/lcortex',-20,0,0);            
          loadCortex('data/rcortex',+20,0,0);    

          // render the scene first
          requestAnimationFrame( animate );
          controls.update();
          renderer.render( scene, camera );  

          hand = false;

          if (map) {
            overlay_holding_pattern()
          }

        }
        
      }

      function overlay_holding_pattern(){
        if (scene.children.length!==3){
          setTimeout(overlay_holding_pattern, 50);//wait 50 millisecnds then recheck
          return;
        }
        changeOverlay(map)
      }

	  function hand_holding_pattern(){
		  if (!ready){
			  setTimeout(hand_holding_pattern,50);
			  return;
		  }
		  addHandArea();
	  }
	   function loadCortex(cortex,xp,yp,zp) {
        var objectCor2
        // Actually have the loader include the other part to make it work
        // var geo = THREE.Geometry();
        // var vertexColorMaterial       
        var filename = cortex.concat(q,'.vtk')  
        var loader = new THREE.VTKLoader();
        loader.load ( filename, function ( geometry ) {
      
          vertexColorMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
          geo = new THREE.Geometry().fromBufferGeometry( geometry );

          geo.center();
          geo.computeVertexNormals();
                        

          for ( var i = 0; i < geo.vertices.length; i++ ) 
          {
              point = geo.vertices[ i ];              
              color = new THREE.Color( 0xffffff );
              var col_r = 0.5;//0.5;//colour_red[ i ];
              var col_g = 0.5;//0.5;//colour_green[ i ];
              var col_b = 0.5;//.5;//colour_blue[ i ];
              color.setRGB( col_r, col_g, col_b);              
              geo.colors[i] = color; // use this array for convenience
          }
        

      
        
          // copy the colors to corresponding positions 
          //     in each face's vertexColors array.
          for ( var i = 0; i < geo.faces.length; i++ ) 
          {
              face = geo.faces[ i ];
              numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
              for( var j = 0; j < numberOfSides; j++ ) 
              {
                  vertexIndex = face[ faceIndices[ j ] ];
                  face.vertexColors[ j ] = geo.colors[ vertexIndex ];
              }
          }


          objectCor2 = new THREE.Mesh( geo, vertexColorMaterial );
          objectCor2.position.set( xp, yp, zp );
          objectCor2.scale.multiplyScalar( 0.4 );
          objectCor2.name = cortex.concat(q);

          // This is a method within the mesh object, and is needed here to load in the different overlay
          objectCor2.overlayFunction = function(idNumber,overlayType){
			ready = false;
            obj = this;
            cortex = obj.name;
            var loader_overlay = new THREE.JSONLoader();
            var request = new XMLHttpRequest();
            // Now we need to open a new request using the open() method. Add the following line:
            request.open('GET', cortex.concat(exp,overlayType,'.json'));        
            request.responseType = 'json';
            request.send();
            var color_json;
            geo = obj.geometry;
            request.onload  = function() {
              color_json = request.response;  
              var col = color_json.r[ i ];
              vertexColorMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

              for ( var i = 0; i < geo.vertices.length; i++ ) 
              {                  
                  color = new THREE.Color( 0xffffff );
                  var col_r = color_json.r[ i ];
                  var col_g = color_json.g[ i ];
                  var col_b = color_json.b[ i ];
                  color.setRGB( col_r, col_g, col_b);              
                  geo.colors[i] = color; 
              }            

              // copy the colors to corresponding positions 
              //     in each face's vertexColors array.
              for ( var i = 0; i < geo.faces.length; i++ ) 
              {
                  face = geo.faces[ i ];
                  numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
                  for( var j = 0; j < numberOfSides; j++ ) 
                  {
                      vertexIndex = face[ faceIndices[ j ] ];                      
                      geo.faces[ i ].vertexColors[ j ].set(geo.colors[vertexIndex]);
                  }
                obj.geometry.colorsNeedUpdate = true;      
              }

              // Now this is a curious little recursion, this is needed because there is a hang time with loading up the XMLHttpRequest methods
              // This ensures to update the second mesh only after everything has finished loading as opposed to explicitly stating it in the
              // to do : 
              // scene.children[1].overlayFunction();
              // scene.children[2].overlayFunction();
              // This seems to work nicely!
              if(idNumber<2){
                scene.children[2].overlayFunction(2,overlayType);
              }
                ready = true;
              }  
			
          }

          objectCor2.drawHand = function(){
            obj = this;
            var hand = "data/hand";
            var loader_overlay = new THREE.JSONLoader();
            var request = new XMLHttpRequest();
            // Now we need to open a new request using the open() method. Add the following line:
            request.open('GET', hand.concat(q,'.json'));        
            request.responseType = 'json';
            request.send();

            var boundary;
            geo = obj.geometry;
            request.onload  = function() {

              boundary = request.response;  
              vertexColorMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
              color = new THREE.Color( 0x000000 );
              for ( var i = 0; i < geo.vertices.length; i++ ) 
              {                  
                if (boundary.perimeter[i]){      
                  geo.colors[i] = color; 
                }
              }            

              // copy the colors to corresponding positions 
              //     in each face's vertexColors array.
              for ( var i = 0; i < geo.faces.length; i++ ) 
              {
                  face = geo.faces[ i ];
                  numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
                  for( var j = 0; j < numberOfSides; j++ ) 
                  {
                      vertexIndex = face[ faceIndices[ j ] ];                      
                      geo.faces[ i ].vertexColors[ j ].set(geo.colors[vertexIndex]);
                  }
                obj.geometry.colorsNeedUpdate = true;      
              }
          }
        }
		  
          scene.add( objectCor2 );
      });
    };