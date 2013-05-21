var container, stats;
var camera, controls, scene, projector, renderer;
var objects = [], plane;

var mouse = new THREE.Vector2(),
offset = new THREE.Vector3(),
INTERSECTED, SELECTED;
var rotateZ=200;
var lastPoint;
var tables={};
var clickAnbled=true;
var drawOverSts=true;
var checkClearSts=false;
var cols=200;
var colors=[0xFF0000,0xFF00FF,0x00FFFF,0xffff00,0x00ff00,0x0000ff,0x9900fF];
var _fx_arr=["right","top"];
var re_arr={"left":"right","top":"bottom","bottom":"top","right":"left"};//方向数组
var shapes=[];	

var color_num=1;
var Colors={};//记录可以消除的obj
var clears=[];
var rows=[];
var tops=[0,0,0,0,0,0,0,0,0,0];
var bottoms=[9,9,9,9,9,9,9,9,9,9];
var moveData={};
var min_bom=10;
var ShowLineSts=1;
draw();
init(1);
animate();
function ckShowLineSts(o){
	if(!clickAnbled||ShowLineSts==o)return;
	for(var i in objects)scene.remove(objects[i]);
	objects=[];
	tables={};
	ShowLineSts=o;
	init();
}
function makeLight(){
	var light = new THREE.SpotLight(0xffffff,1.5);
	light.position.set(0,500,2000);
	light.castShadow = true;
	light.shadowCameraNear = 200;
	light.shadowCameraFar = camera.far;
	light.shadowCameraFov = 50;
	light.shadowBias = -0.00022;
	light.shadowDarkness = 0.5;
	light.shadowMapWidth = 2048;
	light.shadowMapHeight = 2048;
	return light;
}
function makeControl(){
	controls = new THREE.TrackballControls( camera );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
}
function makeInfoDiv(){
	var info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '10px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	info.innerHTML = '<input type="button" value="线状" onClick="ckShowLineSts(1)" /><input type="button" value="填充状" onClick="ckShowLineSts(0)" /><input type="button" value="提示移动点" onClick="showMove()" /><p>(PS:填充状不能看到背面 背面都不能点击</p>';
	return info;
}
function init(sts) {
	//
	if(sts){
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		camera =new THREE.PerspectiveCamera(70,window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.z =2500;
		makeControl();
		scene = new THREE.Scene();
		scene.add( new THREE.AmbientLight(0x505050));
		scene.add(makeLight());
		plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.5, transparent: true, wireframe:true} ) );
		plane.visible = false;
		scene.add( plane );
		projector = new THREE.Projector();
		
		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.sortObjects = false;
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMapEnabled = true;
		renderer.shadowMapType = THREE.PCFShadowMap;
		container.appendChild( renderer.domElement );
		container.appendChild(makeInfoDiv());
		
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );
		
		renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
		window.addEventListener( 'resize', onWindowResize, false );
	} 
	makeTables();	
	beginCheckTables();
}
function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseMove( event ) {
	event.preventDefault();
	mouse.x = (event.clientX/window.innerWidth)*2-1;
	mouse.y = - (event.clientY/window.innerHeight)*2+1;
	//
	var vector = new THREE.Vector3(mouse.x,mouse.y,0.5);
	projector.unprojectVector(vector,camera);
	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
	var intersects =raycaster.intersectObjects(objects);
	if(SELECTED){
		var interIndex;
		if(interIndex=intersects[0]){
			var o=interIndex.point.sub(offset);
			o.z=rotateZ;
			if(Math.abs(o.x-lastPoint.x)>Math.abs(o.y-lastPoint.y))SELECTED.position.x=o.x;
			else SELECTED.position.y=o.y;
		}
		checkClearSts=false;
		return getPointId();
	}
	if(intersects.length>0){
		if ( INTERSECTED != intersects[ 0 ].object ) {
			if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
			INTERSECTED=intersects[0].object;
			INTERSECTED.currentHex=INTERSECTED.material.color.getHex();
			//固定Z
			INTERSECTED.position.z=rotateZ;
			plane.position.copy( INTERSECTED.position );
			plane.lookAt(camera.position);
		}
		container.style.cursor = 'pointer';
	}else{
		if(INTERSECTED)INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
		INTERSECTED = null;
		container.style.cursor = 'auto';
	}
}
function getPointId(sts){
	var ax=SELECTED.position.x-lastPoint.x;
	var ay=SELECTED.position.y-lastPoint.y;
	var scale=0.8,id;
	if(sts){
		ax*=5;
		ay*=5;
	}	
	if(ax>=cols*scale){
		id=(SELECTED.x-0+1)+"|"+SELECTED.y;
	}else if(ax<=-cols*scale){
		id=(SELECTED.x-1)+"|"+SELECTED.y;
	}else if(ay>=cols*scale){
		id=SELECTED.x+"|"+(SELECTED.y-1);
	}else if(ay<=-cols*scale){
		id=SELECTED.x+"|"+(SELECTED.y-0+1);
	}
	var o,sel=SELECTED;
	if(id){
		SELECTED=null;
		if(o=tables[id]){
			startCheck(sel,o);
		}else{
			clearCheck(sel);
		}
	}else if(sts)clearCheck(sel);
	return id;
}
function startCheck(sel,bgl){
	if(sel.type==bgl.type)return clearCheck(sel);
	exchangeObj(sel,bgl,1);
	transform([[sel,sel.toPosition,1],[bgl,lastPoint,1]],0,ckCall.bind(this,sel,bgl));
	ck_one(sel,_fx_arr,1);
	ck_one(bgl,_fx_arr,1,1);
}
function clearCheck(sel){
	transform([[sel,lastPoint,1]]);
}
function onDocumentMouseDown( event ) {
	event.preventDefault();
	if(!clickAnbled)return;
	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector,camera);
	var raycaster = new THREE.Raycaster(camera.position, vector.sub( camera.position ).normalize());
	var intersects = raycaster.intersectObjects(objects);
	if(intersects.length >0) {
		controls.enabled = false;
		SELECTED=intersects[0].object;
		lastPoint=copyPosition(SELECTED.position);
		var intersects = raycaster.intersectObject(plane);
		if(intersects[0])offset.copy( intersects[0].point).sub(plane.position );
		container.style.cursor = 'move';
	}else SELECTED=null;
}
function onDocumentMouseUp( event ) {
	event.preventDefault();
	controls.enabled = true;
	if(INTERSECTED)plane.position.copy(INTERSECTED.position);
	container.style.cursor = 'auto';
	if(SELECTED){
		getPointId(1);
		SELECTED=null;
	}
}
function animate() {
	requestAnimationFrame( animate );
	render();
	stats.update();
}
function render() {
	controls.update();
	renderer.render( scene, camera );
}