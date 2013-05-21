// JavaScript Document
function make_num(o,n){//获取颜色序号 如果新的就上次的+1
	var num,obj,sts,data;
	for(var i in o){
		if(i=='length')continue;
		if(n){
			tables[i].sts=false;
			Colors[i]={sts:n};
		}else if(Colors[i]){
			sts=true;
			data=Colors[i];
			break;
		}
	}
	if(!n){
		if(sts)num=data.sts;
		else num=color_num++;
		add_clears(o,num);
		make_num(o,num);
	}
}
function add_clears(o,num){//将满足的td添加到消除集合 不同的序列有不同的颜色区分
	for(var i in o){
		if(i=='length')continue;
		var obj=tables[i];
		if(!clears[num])clears[num]={};
		clears[num][i]=obj;
		if(obj.x<min_bom)min_bom=obj.x;
		if(rows[obj.x]==undefined||obj.y>rows[obj.x])rows[obj.x]=obj.y;
	}
}
function ck_one(obj,arr,a,b){//检查每一个是否和边上的组成3连
	arr=arr||_fx_arr;
	if(obj){
		var val=obj.type;
		for(var i=0,n=arr.length;i<n;i++){
			fx=arr[i];
			count=0
			var rt={length:1}
			rt[obj.id]=1;
			makeStsObj(obj,val,fx,rt,a);
			if(rt.length>=3)make_num(rt);
		}
	}
	if(b)checkClearSts=true;
}
function makeStsObj(o,v,f,r,s){
	if(!o)return;
	var obj=o.getPoint(f);
	if(obj&&obj.type==v){
		if(!r[obj.id]){
			r[obj.id]=1;
			r.length++;
		}
		makeStsObj(obj,v,f,r);
	}
	if(s){
		f=re_arr[f];
		obj=o.getPoint(f);
		if(obj&&obj.type==v){
			r[obj.id]=1;
			r.length++;
			makeStsObj(obj,v,f,r);
		}
	}
}
function dropTable(call){
	var i,j,y,id,o,v,a;
	var objs=[];
	var e;
	var last;
	for(i in rows){
		y=rows[i];
		if(y==undefined)continue;
		id=i+"|"+y;
		o=tables[id];
		e=null;
		for(j=y;j>=0;j--){
			if(!o)break;
			a=o.getPointType('',a);
			if(a){
				var position=o.toPosition||copyPosition(o.position);
				objs.push([a,{y:position.y},o.y-a.y,o.id]);
				o=o.getPoint('top');
				if(!o)break;
			}else{
				tops[i]=''+j;
				break;
			}
		}
	}
	transform(objs);
	makeGeometryObj(call);
}
function clearTable(obj,sts){
	obj=obj||tables;
	for(var i in obj){
		var o=obj[i]
		o.fromPosition=null;
		o.toPosition=null;
		o.sts=true;
	}
	color_num=1;
	Colors={};
	clears=[];
	initTop();
	if(sts){
		rows=[];
		min_bom=10;
	}
}
function exchangeObj(a,b,s){
	var x=a.x;
	var y=a.y;
	var id=a.id;

	tables[id]=b;
	tables[b.id]=a;
	a.id=b.id;
	a.x=b.x;
	a.y=b.y;
	b.x=x;
	b.y=y;
	b.id=id;
	if(s){
		a.fromPosition=lastPoint;
		a.toPosition=copyPosition(b.position);
		b.fromPosition=copyPosition(b.position);
		b.toPosition=lastPoint;
	}
}
function exchangeType(a,b){
	var type=a.type;
	a.type=b.type;
	b.type=type;
}
function initTop(){
	for(var i in tops)tops[i]=0;
}
function getGeometry(x,y){
	var rand=Math.random()*shapes.length|0;
	var Shape =shapes[rand]; 
	var geometry = new THREE.ShapeGeometry(Shape);
	var object = new THREE.Mesh( geometry,new THREE.MeshLambertMaterial({color:colors[rand],opacity:0.5,transparent: true,wireframe:ShowLineSts} ));						
	object.material.ambient = object.material.color;

	object.position.x =x*cols-1000;
	object.position.y =(9-y)*cols-1000;
	object.position.z = rotateZ;
	object.x=x;
	object.y=y;
	object.rotation.z = Math.PI;
	
	object.id=x+"|"+y;
	object.type=rand;
	object.sts=true;
	object.opcity=0.5;
	object.castShadow = true;
	object.receiveShadow = true;
	return object;
}
function makeGeometryObj(call){
	var objs=[];
	for(var j in tops){
		var y=tops[j];
		if(!y)continue;
		for(var i=y;i>=0;i--){
			var object = getGeometry(j,i);
			var py=(9-i)*cols - 1000;
			object.position.x =j*cols - 1000;
			object.position.y =py+(y-0+1)*cols;

			scene.add(object);
			tables[j+"|"+i]=object;
			objects.push(object);
			objs.push([object,{y:py},y-0+1]);
		}
	}
	transform(objs,0,call);
}
function reMoveObj(o){
	if(o instanceof Array)for(var i in o)reMoveObj(o[i])
	else for(var i in objects)if(o.id==objects[i].id)return objects.splice(i,1);
}
function ckCall(sel,bgl){
	if(checkClearSts){
		if(clears.length)startClear();
		else{
			exchangeObj(sel,bgl);
			transform([[sel,lastPoint,1],[bgl,bgl.fromPosition,1]],1);
			clearTable([sel,bgl]);
		}
	}else setTimeout(ckCall(sel,bgl),50);
}
function makeTables(){
	for ( var i=9;i>=0;i--){
		for(var j=0;j<=9;j++){
			var object = getGeometry(j,i);
			scene.add(object);
			tables[j+"|"+i]=object;
			objects.push( object );
		}
	}
}
function beginCheckTables(o,s){
	o=o||bottoms;
	var y,id;
	rows=[];
	for(var i=0,n=o.length;i<n;i++){
		y=o[i];
		if(y==undefined)continue;
		for(var j=y;j>=0;j--){
			id=i+"|"+j;
			ck_one(tables[id],_fx_arr,s);
		}
	}
	ck_one(0,0,0,1);
	if(clears.length){
		setTimeout(function(){
			if(drawOverSts)startClear();
			else setTimeout(arguments.callee,50);
		},50);
	}else{
		ckMoveSts();
		clearTable(0,1);
		if(moveData.sts)clickAnbled=true;
		else reAgain();
	}
}
function startClear(){
	for(var i in Colors){
		var obj=tables[i];
		obj.sts=false;
		scene.remove(obj);
		reMoveObj(obj);
	}
	initTop();
	dropTable(beginCheckTables.bind(this,rows,1));
	clearTable();
}
function ckOneMove(o,v,a,f){
	var r={length:1};
	makeStsObj(o,v,f||'top',r,1);
	if(r.length>=3){
		exchangeType(o,a);
		var keys=Object.keys(r);
		for(var i=0;keys[i];i++){
			if(keys[i]=='length'){
				keys.splice(i,1);
				i--;
			}else if(keys[i]==o.id)keys[i]=a.id;
		}
		moveData.type=v;
		moveData.data=keys;
		moveData.sts=true;
		moveData.keys=[o.id,a.id];
		return true;
	}
	if(!f)return ckOneMove(o,v,a,'right');
}
function ckMoveSts(_o){
	_o=_o||bottoms;
	var y,id,r,o,obj,ck_self;
	if(moveData.sts){
		for(var i in moveData.data){
			var cell=moveData.data[i];
			if(tables[cell].type!=moveData.type){
				moveData.sts=false;
				break;
			}
		}
		if(moveData.sts)return;
	}
	for(i=0,n=_o.length;i<n;i++){
		if(i<min_bom)continue;
		y=_o[i];
		if(y==undefined)continue;
		for(var j=y;j>=0;j--){
			id=i+"|"+j;
			o=tables[id];
			while(o){
				obj=o.getPoint('top');
				ck_self=false;
				if(obj){
					r={length:1};
					exchangeType(o,obj);
					ck_self=true;
					if(ckOneMove(o,o.type,obj))return;
					if(ckOneMove(obj,obj.type,o))return;
					exchangeType(o,obj);
				}
				obj=o.getPoint('right');
				if(obj){
					r={length:1};
					exchangeType(o,obj);
					if(ck_self&&ckOneMove(o,o.type,obj))return;
					if(ckOneMove(obj,obj.type,o))return;
					exchangeType(o,obj);
				}
				o=o.getPoint('top');
			}
		}
	}
}
function reAgain(){
	if(window.confirm("无法移动\n重构？")){
		for(var i in tables)scene.remove(tables[i]);
		objects=[];
		tables={};
		init();
	}
}
function showMove(){
	if(moveData.sts){
		var a=tables[moveData.keys[0]];
		var b=tables[moveData.keys[1]];
		drawMoveInfo(a,b);
	}else reAgain();
}
function drawMoveInfo(a,b){
	var ax=a.position.x;
	var ay=a.position.y;
	var bx=b.position.x;
	var by=b.position.y;
	var obj,objs=[];
	var thisObjs=[];
	if(ax==bx){
		obj=getMoveShap('top',ax,Math.min(ay,by));
		obj.rotation.z = Math.PI/2;
		obj.position.x+=180-cols;
		obj.position.y-=cols;
		objs.push([obj,{y:obj.position.y+cols},1]);
		scene.add(obj);
		thisObjs.push(obj);
		obj=getMoveShap('bottom',ax,Math.max(ay,by));
		obj.rotation.z =3*Math.PI/2;
		obj.position.x+=40-cols;
		objs.push([obj,{y:obj.position.y-cols},1]);
		scene.add(obj);
		thisObjs.push(obj);
	}else{
		obj=getMoveShap('left',Math.min(ax,bx),ay);
		obj.position.y+=cols-280;
		obj.position.x-=cols;
		objs.push([obj,{x:obj.position.x+cols},1]);
		scene.add(obj);
		thisObjs.push(obj);
		obj=getMoveShap('right',Math.max(ax,bx),ay);
		objs.push([obj,{x:obj.position.x-cols},1]);
		obj.rotation.z =Math.PI;
		obj.position.y+=cols-320;
		
		scene.add(obj);
		thisObjs.push(obj);
	}
	transform(objs,0,(function(o){
		for(var i in o)scene.remove(o[i]);
		clickAnbled=true;
	}).bind(this,thisObjs));
}
function getMoveShap(type,x,y){
	var Shape =shapes.arrow; 
	var geometry = new THREE.ShapeGeometry(Shape);
	var object=new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({color:colors[1],opacity:0.5,transparent:true,wireframe:false}));						
	object.material.ambient = object.material.color;
	
	object.position.x=x;
	object.position.y=y;
	object.position.z=rotateZ;
	
	object.castShadow = true;
	object.receiveShadow = true;
	return object;
}