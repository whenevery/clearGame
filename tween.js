// JavaScript Document
function Timer(){
}
Timer.Timer=[];
Timer.removeAll=function(){
	var o;
	while(o=Timer.Timer[0]){
		window.clearInterval(o);
		Timer.Timer.shift();
	}
}
Timer.prototype={
	setObject:function(o){
		this.obj=o;
		return this;
	},
	to:function(p,t,o,s){
		this.op=o||0.5;
		this.point=p;
		this.x=p.x;
		this.y=p.y;
		this.opacity=p.opacity;
		this.time=t||1;
		return this;
	},
	easing:function(t){
		this.type=t;
		return this;
	},
	start:function(call){
		if(call)this.call=call;
		if(!this.obj)return this;
		this.l=50;
		this.l=this.l/this.time;
		if(!isNaN(this.x))this.ax=(this.x-this.obj.position.x)/this.l;
		if(!isNaN(this.y))this.ay=(this.y-this.obj.position.y)/this.l;
		if(!isNaN(this.opacity))this.ap=(this.opacity-this.obj.opacity)/this.l;
		this.count=1;
		this.timer=setInterval(this.Timer.bind(this),500/this.l);
		Timer.Timer.push(this.timer);
	},
	Timer:function(){
		if(this.l<this.count){
			if(!isNaN(this.x))this.obj.position.x=this.x;//this.obj.x*cols-1000;
			if(!isNaN(this.y))this.obj.position.y=this.y;//(9-this.obj.y)*cols-1000;
			if(!isNaN(this.opacity))this.opacity=this.opacity;
			this.clear(this.timer);
			if(!Timer.Timer.length){
				drawOverSts=true;
				if(this.call)this.call();
				else clickAnbled=true;
			}
		}else{
			if(this.count>=this.l-1){
				if(!isNaN(this.x))this.obj.position.x=this.x;//this.obj.x*cols-1000;
				if(!isNaN(this.y))this.obj.position.y=this.y;//(9-this.obj.y)*cols-1000;
				if(!isNaN(this.opacity))this.opacity=this.opacity;
			}else{
				if(!isNaN(this.x))this.obj.position.x+=this.ax;//this.obj.x*cols-1000;
				if(!isNaN(this.y))this.obj.position.y+=this.ay;//(9-this.obj.y)*cols-1000;
				if(!isNaN(this.opacity))this.opacity+=this.ap;
			}
			this.count++;
		}
	},clear:function(m){
		window.clearInterval(m);
		for(var i=0,n=Timer.Timer.length;i<n;i++)
			if(m==Timer.Timer[i])return Timer.Timer.splice(i,1);
	}
}
function transform(o,sts,call) {
	if(sts)Timer.removeAll();
	clickAnbled=false;
	drawOverSts=false;
	for ( var i=0,n=o.length; i <n; i ++ ) {
		var row=o[i];
		var obj=row[0];
		var p=row[1];
		var l=row[2]||1;
		var id=row[3];
		if(id)exchangeObj(obj,tables[id]);
		l=Math.abs(l);
		new Timer().setObject(obj).to(p,l).start(call);
	}
}
THREE.Mesh.prototype.getPoint=function(f){
	var x=this.x,y=this.y;
	f=f||"top";
	switch(f){
		case 'left':
			x--;
			break;
		case 'right':
			x++;
			break;
		case 'top':
			y--;
			break;
		case 'bottom':
			y++;
			break;
		default:
			x=-1;
			y=-1;		
	}
	return tables[x+"|"+y];
}
THREE.Mesh.prototype.getPointType=function(f,o){
	f=f||"top";
	o=o||this;
	o=o.getPoint(f);
	if(!o)return null;
	if(o.sts){
		o.sts=false;
		return o;
	}
	return o.getPointType(f);
}
function copyPosition(o){
	o=o.position||o;
	var r={};
	r.x=o.x;
	r.y=o.y;
	r.z=o.z;
	return r;
}
	function draw(){
		var x=50, y =25;
		//桃心
		var shape=new THREE.Shape();
		var scale=1.2;
		shape.moveTo((x+25)*scale, (y+25)*scale );
		shape.bezierCurveTo((x+25)*scale,(y+25)*scale,(x+20)*scale,y*scale,x*scale,y*scale );
		shape.bezierCurveTo( (x - 30)*scale,(y)*scale,( x - 30)*scale,( y + 35)*scale,(x - 30)*scale,(y + 35)*scale );
		shape.bezierCurveTo( (x - 30)*scale,(y + 55)*scale,( x - 10)*scale,( y + 77)*scale,( x + 25)*scale, (y + 95)*scale );
		shape.bezierCurveTo( (x + 60)*scale,(y + 77)*scale,( x + 80)*scale,( y + 55)*scale, (x + 80)*scale,( y + 35)*scale );
		shape.bezierCurveTo( (x + 80)*scale,(y + 35)*scale, (x + 80)*scale,( y)*scale, (x + 50)*scale,( y)*scale );
		shape.bezierCurveTo(( x + 35)*scale,(y)*scale, (x + 25)*scale,( y + 25)*scale,( x + 25)*scale,( y + 25)*scale );
		shapes.push(shape);

		//斜正方形
		shape=new THREE.Shape();
		shape.moveTo(0,90);
		shape.lineTo(90,180);
		shape.lineTo(180,90);
		shape.lineTo(90,0);
		shape.lineTo(0,90);
		shapes.push(shape);
		//正三角形
		shape=new THREE.Shape();
		shape.moveTo(0,168);
		shape.lineTo(180,168);
		shape.lineTo(90,12);
		shape.lineTo(0,168);
		shapes.push(shape);
		
		// 圆
		shape=new THREE.Shape();
		shape.moveTo(0,0);
		shape.lineTo(0,0)
		shape.arc(90,90,90,0,Math.PI*2,false);
		shapes.push(shape);
		
		//正方形
		shape=new THREE.Shape();
		shape.moveTo(10,170);
		shape.lineTo(170,170);
		shape.lineTo(170,10);
		shape.lineTo(10,10);
		shape.lineTo(10,170);
		shapes.push(shape);
		
		//钻石
		shape=new THREE.Shape();
		shape.moveTo(90,180);
		shape.lineTo(170,50);
		shape.lineTo(130,10);
		shape.lineTo(50,10);
		shape.lineTo(10,50);
		shape.lineTo(90,180);
		shapes.push(shape);
		
		//箭头
		shape=new THREE.Shape();
		shape.moveTo(10,20);
		shape.lineTo(140,20);
		shape.lineTo(140,0);
		shape.lineTo(200,30);
		shape.lineTo(140,60);
		shape.lineTo(140,40);
		shape.lineTo(10,40);
		shape.lineTo(10,20);
		shapes.arrow=shape;
		
	}