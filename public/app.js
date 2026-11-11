(()=>{var Uf=0,hd=1,Ff=2;var Hs=1,Of=2,Gr=3,gs=0,li=1,Xe=2,Gs=0,Vr=1,ho=2,dd=3,ud=4,kf=5;var Vs=100,zf=101,Bf=102,Hf=103,Gf=104,Vf=200,Wf=201,Xf=202,qf=203,fd=204,pd=205,$f=206,Yf=207,Kf=208,Zf=209,Jf=210,jf=211,Qf=212,tp=213,ep=214,yl=0,_l=1,bl=2,Pr=3,Ml=4,Sl=5,wl=6,El=7,md=0,ip=1,np=2,_n=0,gd=1,xd=2,vd=3,yd=4,_d=5,bd=6,Ws=7;var Md=300,Xs=301,Wr=302,tc=303,ec=304,en=1e3,Gi=1001,Tl=1002,We=1003,sp=1004;var uo=1005;var Ke=1006,ic=1007;var Xi=1008;var Ii=1009,Sd=1010,wd=1011,Xr=1012,nc=1013,rn=1014,qi=1015,Li=1016,sc=1017,rc=1018,qs=1020,Ed=35902,Td=35899,Ad=1021,Rd=1022,Ri=1023,kn=1026,Wn=1027,ac=1028,oc=1029,xs=1030,lc=1031;var cc=1033,fo=33776,po=33777,mo=33778,go=33779,hc=35840,dc=35841,uc=35842,fc=35843,pc=36196,mc=37492,gc=37496,xc=37488,vc=37489,xo=37490,yc=37491,_c=37808,bc=37809,Mc=37810,Sc=37811,wc=37812,Ec=37813,Tc=37814,Ac=37815,Rc=37816,Cc=37817,Pc=37818,Ic=37819,Lc=37820,Dc=37821,Nc=36492,Uc=36494,Fc=36495,Oc=36283,kc=36284,vo=36285,zc=36286;var Aa=2300,Al=2301,xl=2302,jh=2303,Qh=2400,td=2401,ed=2402;var rp=3200;var Bc=0,ap=1,an="",Oe="srgb",Ra="srgb-linear",Ca="linear",we="srgb";var vl=7680;var op=519,lp=512,cp=513,hp=514,Cd=515,dp=516,up=517,Pd=518,Id=519,Ld=35044;var Dd="300 es",Vi=2e3,Ir=2001;function Em(n){for(let t=n.length-1;t>=0;--t)if(n[t]>=65535)return!0;return!1}function Tm(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function Pa(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function fp(){let n=Pa("canvas");return n.style.display="block",n}var Ju={},Lr=null;function Ia(...n){let t="THREE."+n.shift();Lr?Lr("log",t,...n):console.log(t,...n)}function pp(n){let t=n[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=n[1];e&&e.isStackTrace?n[0]+=" "+e.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function qt(...n){n=pp(n);let t="THREE."+n.shift();if(Lr)Lr("warn",t,...n);else{let e=n[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...n)}}function Yt(...n){n=pp(n);let t="THREE."+n.shift();if(Lr)Lr("error",t,...n);else{let e=n[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...n)}}function Ma(...n){let t=n.join(" ");t in Ju||(Ju[t]=!0,qt(...n))}function mp(n,t,e){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(t,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}var gp={[yl]:yl,[bl]:wl,[Ml]:Ml,[Pr]:Sl,[_l]:_l,[wl]:bl,[El]:El,[Sl]:Pr},vn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let s=i[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},mi=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],ju=1234567,Sa=Math.PI/180,Dr=180/Math.PI;function Xn(){let n=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(mi[n&255]+mi[n>>8&255]+mi[n>>16&255]+mi[n>>24&255]+"-"+mi[t&255]+mi[t>>8&255]+"-"+mi[t>>16&15|64]+mi[t>>24&255]+"-"+mi[e&63|128]+mi[e>>8&255]+"-"+mi[e>>16&255]+mi[e>>24&255]+mi[i&255]+mi[i>>8&255]+mi[i>>16&255]+mi[i>>24&255]).toLowerCase()}function ee(n,t,e){return Math.max(t,Math.min(e,n))}function Nd(n,t){return(n%t+t)%t}function Am(n,t,e,i,s){return i+(n-t)*(s-i)/(e-t)}function Rm(n,t,e){return n!==t?(e-n)/(t-n):0}function wa(n,t,e){return(1-e)*n+e*t}function Cm(n,t,e,i){return wa(n,t,1-Math.exp(-e*i))}function Pm(n,t=1){return t-Math.abs(Nd(n,t*2)-t)}function Im(n,t,e){return n<=t?0:n>=e?1:(n=(n-t)/(e-t),n*n*(3-2*n))}function Lm(n,t,e){return n<=t?0:n>=e?1:(n=(n-t)/(e-t),n*n*n*(n*(n*6-15)+10))}function Dm(n,t){return n+Math.floor(Math.random()*(t-n+1))}function Nm(n,t){return n+Math.random()*(t-n)}function Um(n){return n*(.5-Math.random())}function Fm(n){n!==void 0&&(ju=n);let t=ju+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Om(n){return n*Sa}function km(n){return n*Dr}function zm(n){return n>0&&Number.isInteger(n)&&2**Math.round(Math.log2(n))===n}function Bm(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Ud(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Hm(n,t,e,i,s){let r=Math.cos,a=Math.sin,o=r(e/2),l=a(e/2),c=r((t+i)/2),u=a((t+i)/2),h=r((t-i)/2),d=a((t-i)/2),f=r((i-t)/2),p=a((i-t)/2);switch(s){case"XYX":n.set(o*u,l*h,l*d,o*c);break;case"YZY":n.set(l*d,o*u,l*h,o*c);break;case"ZXZ":n.set(l*h,l*d,o*u,o*c);break;case"XZX":n.set(o*u,l*p,l*f,o*c);break;case"YXY":n.set(l*f,o*u,l*p,o*c);break;case"ZYZ":n.set(l*p,l*f,o*u,o*c);break;default:qt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Hc(n){switch(n.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Fd(n,t){if(t.constructor===Float32Array)return n;let e=Hc(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(n/e,-1)}function Od(n,t){if(t.constructor===Float32Array)return n;let e=Hc(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(n*e)}var kd={DEG2RAD:Sa,RAD2DEG:Dr,generateUUID:Xn,clamp:ee,euclideanModulo:Nd,mapLinear:Am,inverseLerp:Rm,lerp:wa,damp:Cm,pingpong:Pm,smoothstep:Im,smootherstep:Lm,randInt:Dm,randFloat:Nm,randFloatSpread:Um,seededRandom:Fm,degToRad:Om,radToDeg:km,isPowerOfTwo:zm,ceilPowerOfTwo:Bm,floorPowerOfTwo:Ud,setQuaternionFromProperEuler:Hm,normalize:Od,denormalize:Fd},Wd=class Wd{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6],this.y=s[1]*e+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=ee(this.x,t.x,e.x),this.y=ee(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=ee(this.x,t,e),this.y=ee(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ee(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(ee(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*i-a*s+t.x,this.y=r*s+a*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Wd.prototype.isVector2=!0;var dt=Wd,si=class{constructor(t=0,e=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=s}static slerpFlat(t,e,i,s,r,a,o){let l=i[s+0],c=i[s+1],u=i[s+2],h=i[s+3],d=r[a+0],f=r[a+1],p=r[a+2],x=r[a+3];if(h!==x||l!==d||c!==f||u!==p){let m=l*d+c*f+u*p+h*x;m<0&&(d=-d,f=-f,p=-p,x=-x,m=-m);let g=1-o;if(m<.9995){let _=Math.acos(m),b=Math.sin(_);g=Math.sin(g*_)/b,o=Math.sin(o*_)/b,l=l*g+d*o,c=c*g+f*o,u=u*g+p*o,h=h*g+x*o}else{l=l*g+d*o,c=c*g+f*o,u=u*g+p*o,h=h*g+x*o;let _=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=_,c*=_,u*=_,h*=_}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=h}static multiplyQuaternionsFlat(t,e,i,s,r,a){let o=i[s],l=i[s+1],c=i[s+2],u=i[s+3],h=r[a],d=r[a+1],f=r[a+2],p=r[a+3];return t[e]=o*p+u*h+l*f-c*d,t[e+1]=l*p+u*d+c*h-o*f,t[e+2]=c*p+u*f+o*d-l*h,t[e+3]=u*p-o*h-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,s){return this._x=t,this._y=e,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(i/2),u=o(s/2),h=o(r/2),d=l(i/2),f=l(s/2),p=l(r/2);switch(a){case"XYZ":this._x=d*u*h+c*f*p,this._y=c*f*h-d*u*p,this._z=c*u*p+d*f*h,this._w=c*u*h-d*f*p;break;case"YXZ":this._x=d*u*h+c*f*p,this._y=c*f*h-d*u*p,this._z=c*u*p-d*f*h,this._w=c*u*h+d*f*p;break;case"ZXY":this._x=d*u*h-c*f*p,this._y=c*f*h+d*u*p,this._z=c*u*p+d*f*h,this._w=c*u*h-d*f*p;break;case"ZYX":this._x=d*u*h-c*f*p,this._y=c*f*h+d*u*p,this._z=c*u*p-d*f*h,this._w=c*u*h+d*f*p;break;case"YZX":this._x=d*u*h+c*f*p,this._y=c*f*h+d*u*p,this._z=c*u*p-d*f*h,this._w=c*u*h-d*f*p;break;case"XZY":this._x=d*u*h-c*f*p,this._y=c*f*h-d*u*p,this._z=c*u*p+d*f*h,this._w=c*u*h+d*f*p;break;default:qt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],u=e[6],h=e[10],d=i+o+h;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(i>o&&i>h){let f=2*Math.sqrt(1+i-o-h);this._w=(u-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>h){let f=2*Math.sqrt(1+o-i-h);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+h-i-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ee(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,e/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,u=e._w;return this._x=i*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-i*c,this._z=r*u+a*c+i*l-s*o,this._w=a*u-i*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){let i=t._x,s=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(i=-i,s=-s,r=-r,a=-a,o=-o);let l=1-e;if(o<.9995){let c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,e=Math.sin(e*c)/u,this._x=this._x*l+i*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this._onChangeCallback()}else this._x=this._x*l+i*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Xd=class Xd{constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Qu.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Qu.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*s,this.y=r[1]*e+r[4]*i+r[7]*s,this.z=r[2]*e+r[5]*i+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,i=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*i),u=2*(o*e-r*s),h=2*(r*i-a*e);return this.x=e+l*c+a*h-o*u,this.y=i+l*u+o*c-r*h,this.z=s+l*h+r*u-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*s,this.y=r[1]*e+r[5]*i+r[9]*s,this.z=r[2]*e+r[6]*i+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=ee(this.x,t.x,e.x),this.y=ee(this.y,t.y,e.y),this.z=ee(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=ee(this.x,t,e),this.y=ee(this.y,t,e),this.z=ee(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ee(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-i*l,this.z=i*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Rh.copy(this).projectOnVector(t),this.sub(Rh)}reflect(t){return this.sub(Rh.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(ee(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return e*e+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let s=Math.sin(e)*t;return this.x=s*Math.sin(i),this.y=Math.cos(e)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Xd.prototype.isVector3=!0;var D=Xd,Rh=new D,Qu=new si,qd=class qd{constructor(t,e,i,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,a,o,l,c)}set(t,e,i,s,r,a,o,l,c){let u=this.elements;return u[0]=t,u[1]=s,u[2]=o,u[3]=e,u[4]=r,u[5]=l,u[6]=i,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],u=i[4],h=i[7],d=i[2],f=i[5],p=i[8],x=s[0],m=s[3],g=s[6],_=s[1],b=s[4],v=s[7],E=s[2],T=s[5],y=s[8];return r[0]=a*x+o*_+l*E,r[3]=a*m+o*b+l*T,r[6]=a*g+o*v+l*y,r[1]=c*x+u*_+h*E,r[4]=c*m+u*b+h*T,r[7]=c*g+u*v+h*y,r[2]=d*x+f*_+p*E,r[5]=d*m+f*b+p*T,r[8]=d*g+f*v+p*y,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8];return e*a*u-e*o*c-i*r*u+i*o*l+s*r*c-s*a*l}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],h=u*a-o*c,d=o*l-u*r,f=c*r-a*l,p=e*h+i*d+s*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/p;return t[0]=h*x,t[1]=(s*c-u*i)*x,t[2]=(o*i-s*a)*x,t[3]=d*x,t[4]=(u*e-s*l)*x,t[5]=(s*r-o*e)*x,t[6]=f*x,t[7]=(i*l-c*e)*x,t[8]=(a*e-i*r)*x,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return Ma("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Ch.makeScale(t,e)),this}rotate(t){return Ma("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Ch.makeRotation(-t)),this}translate(t,e){return Ma("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Ch.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<9;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}};qd.prototype.isMatrix3=!0;var Kt=qd,Ch=new Kt,tf=new Kt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ef=new Kt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Gm(){let n={enabled:!0,workingColorSpace:Ra,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===we&&(s.r=On(s.r),s.g=On(s.g),s.b=On(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===we&&(s.r=Cr(s.r),s.g=Cr(s.g),s.b=Cr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===an?Ca:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Ra]:{primaries:t,whitePoint:i,transfer:Ca,toXYZ:tf,fromXYZ:ef,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Oe},outputColorSpaceConfig:{drawingBufferColorSpace:Oe}},[Oe]:{primaries:t,whitePoint:i,transfer:we,toXYZ:tf,fromXYZ:ef,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Oe}}}),n}var me=Gm();function On(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Cr(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var fr,Rl=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{fr===void 0&&(fr=Pa("canvas")),fr.width=t.width,fr.height=t.height;let s=fr.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),i=fr}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Pa("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let s=i.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=On(r[a]/255)*255;return i.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(On(e[i]/255)*255):e[i]=On(e[i]);return{data:e,width:t.width,height:t.height}}else return qt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Vm=0,Nr=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Vm++}),this.uuid=Xn(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width||0,e.height||0,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Ph(s[a].image)):r.push(Ph(s[a]))}else r=Ph(s);i.url=r}return e||(t.images[this.uuid]=i),i}};function Ph(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Rl.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(qt("Texture: Unable to serialize Texture."),{})}var Wm=0,Ih=new D,Ti=class n extends vn{constructor(t=n.DEFAULT_IMAGE,e=n.DEFAULT_MAPPING,i=Gi,s=Gi,r=Ke,a=Xi,o=Ri,l=Ii,c=n.DEFAULT_ANISOTROPY,u=an){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Wm++}),this.uuid=Xn(),this.name="",this.source=new Nr(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new dt(0,0),this.repeat=new dt(1,1),this.center=new dt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Kt,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Ih).x}get height(){return this.source.getSize(Ih).y}get depth(){return this.source.getSize(Ih).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.mipmapsAutoUpdate=t.mipmapsAutoUpdate,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isPMREMTexture=t.isPMREMTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){qt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){qt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Md)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case en:t.x=t.x-Math.floor(t.x);break;case Gi:t.x=t.x<0?0:1;break;case Tl:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case en:t.y=t.y-Math.floor(t.y);break;case Gi:t.y=t.y<0?0:1;break;case Tl:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Ti.DEFAULT_IMAGE=null;Ti.DEFAULT_MAPPING=Md;Ti.DEFAULT_ANISOTROPY=1;var $d=class $d{constructor(t=0,e=0,i=0,s=1){this.x=t,this.y=e,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,s){return this.x=t,this.y=e,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*i+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,s,r,l=t.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],p=l[9],x=l[2],m=l[6],g=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-x)<.01&&Math.abs(p-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+x)<.1&&Math.abs(p+m)<.1&&Math.abs(c+f+g-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let b=(c+1)/2,v=(f+1)/2,E=(g+1)/2,T=(u+d)/4,y=(h+x)/4,M=(p+m)/4;return b>v&&b>E?b<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(b),s=T/i,r=y/i):v>E?v<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),i=T/s,r=M/s):E<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),i=y/r,s=M/r),this.set(i,s,r,e),this}let _=Math.sqrt((m-p)*(m-p)+(h-x)*(h-x)+(d-u)*(d-u));return Math.abs(_)<.001&&(_=1),this.x=(m-p)/_,this.y=(h-x)/_,this.z=(d-u)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=ee(this.x,t.x,e.x),this.y=ee(this.y,t.y,e.y),this.z=ee(this.z,t.z,e.z),this.w=ee(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=ee(this.x,t,e),this.y=ee(this.y,t,e),this.z=ee(this.z,t,e),this.w=ee(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ee(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};$d.prototype.isVector4=!0;var _e=$d,Cl=class extends vn{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ke,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new _e(0,0,t,e),this.scissorTest=!1,this.viewport=new _e(0,0,t,e),this.textures=[];let s=i.count;for(let r=0;r<s;r++)this.textures[r]=new Ti({width:t,height:e,depth:i.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Ke,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.mipmapsAutoUpdate!==void 0&&(e.mipmapsAutoUpdate=t.mipmapsAutoUpdate),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new Nr(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;else this.depthTexture=null;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},ai=class extends Cl{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},La=class extends Ti{constructor(t=null,e=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=We,this.minFilter=We,this.wrapR=Gi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Pl=class extends Ti{constructor(t=null,e=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=We,this.minFilter=We,this.wrapR=Gi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Ql=class Ql{constructor(t,e,i,s,r,a,o,l,c,u,h,d,f,p,x,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,a,o,l,c,u,h,d,f,p,x,m)}set(t,e,i,s,r,a,o,l,c,u,h,d,f,p,x,m){let g=this.elements;return g[0]=t,g[4]=e,g[8]=i,g[12]=s,g[1]=r,g[5]=a,g[9]=o,g[13]=l,g[2]=c,g[6]=u,g[10]=h,g[14]=d,g[3]=f,g[7]=p,g[11]=x,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ql().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,i=t.elements,s=1/pr.setFromMatrixColumn(t,0).length(),r=1/pr.setFromMatrixColumn(t,1).length(),a=1/pr.setFromMatrixColumn(t,2).length();return e[0]=i[0]*s,e[1]=i[1]*s,e[2]=i[2]*s,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*a,e[9]=i[9]*a,e[10]=i[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,s=t.y,r=t.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(t.order==="XYZ"){let d=a*u,f=a*h,p=o*u,x=o*h;e[0]=l*u,e[4]=-l*h,e[8]=c,e[1]=f+p*c,e[5]=d-x*c,e[9]=-o*l,e[2]=x-d*c,e[6]=p+f*c,e[10]=a*l}else if(t.order==="YXZ"){let d=l*u,f=l*h,p=c*u,x=c*h;e[0]=d+x*o,e[4]=p*o-f,e[8]=a*c,e[1]=a*h,e[5]=a*u,e[9]=-o,e[2]=f*o-p,e[6]=x+d*o,e[10]=a*l}else if(t.order==="ZXY"){let d=l*u,f=l*h,p=c*u,x=c*h;e[0]=d-x*o,e[4]=-a*h,e[8]=p+f*o,e[1]=f+p*o,e[5]=a*u,e[9]=x-d*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let d=a*u,f=a*h,p=o*u,x=o*h;e[0]=l*u,e[4]=p*c-f,e[8]=d*c+x,e[1]=l*h,e[5]=x*c+d,e[9]=f*c-p,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let d=a*l,f=a*c,p=o*l,x=o*c;e[0]=l*u,e[4]=x-d*h,e[8]=p*h+f,e[1]=h,e[5]=a*u,e[9]=-o*u,e[2]=-c*u,e[6]=f*h+p,e[10]=d-x*h}else if(t.order==="XZY"){let d=a*l,f=a*c,p=o*l,x=o*c;e[0]=l*u,e[4]=-h,e[8]=c*u,e[1]=d*h+x,e[5]=a*u,e[9]=f*h-p,e[2]=p*h-f,e[6]=o*u,e[10]=x*h+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Xm,t,qm)}lookAt(t,e,i){let s=this.elements;return Di.subVectors(t,e),Di.lengthSq()===0&&(Di.z=1),Di.normalize(),is.crossVectors(i,Di),is.lengthSq()===0&&(Math.abs(i.z)===1?Di.x+=1e-4:Di.z+=1e-4,Di.normalize(),is.crossVectors(i,Di)),is.normalize(),Xo.crossVectors(Di,is),s[0]=is.x,s[4]=Xo.x,s[8]=Di.x,s[1]=is.y,s[5]=Xo.y,s[9]=Di.y,s[2]=is.z,s[6]=Xo.z,s[10]=Di.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],u=i[1],h=i[5],d=i[9],f=i[13],p=i[2],x=i[6],m=i[10],g=i[14],_=i[3],b=i[7],v=i[11],E=i[15],T=s[0],y=s[4],M=s[8],U=s[12],P=s[1],C=s[5],N=s[9],O=s[13],L=s[2],k=s[6],G=s[10],V=s[14],at=s[3],$=s[7],nt=s[11],rt=s[15];return r[0]=a*T+o*P+l*L+c*at,r[4]=a*y+o*C+l*k+c*$,r[8]=a*M+o*N+l*G+c*nt,r[12]=a*U+o*O+l*V+c*rt,r[1]=u*T+h*P+d*L+f*at,r[5]=u*y+h*C+d*k+f*$,r[9]=u*M+h*N+d*G+f*nt,r[13]=u*U+h*O+d*V+f*rt,r[2]=p*T+x*P+m*L+g*at,r[6]=p*y+x*C+m*k+g*$,r[10]=p*M+x*N+m*G+g*nt,r[14]=p*U+x*O+m*V+g*rt,r[3]=_*T+b*P+v*L+E*at,r[7]=_*y+b*C+v*k+E*$,r[11]=_*M+b*N+v*G+E*nt,r[15]=_*U+b*O+v*V+E*rt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],u=t[2],h=t[6],d=t[10],f=t[14],p=t[3],x=t[7],m=t[11],g=t[15],_=l*f-c*d,b=o*f-c*h,v=o*d-l*h,E=a*f-c*u,T=a*d-l*u,y=a*h-o*u;return e*(x*_-m*b+g*v)-i*(p*_-m*E+g*T)+s*(p*b-x*E+g*y)-r*(p*v-x*T+m*y)}determinantAffine(){let t=this.elements,e=t[0],i=t[4],s=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],u=t[10];return e*(a*u-o*c)-i*(r*u-o*l)+s*(r*c-a*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],h=t[9],d=t[10],f=t[11],p=t[12],x=t[13],m=t[14],g=t[15],_=e*o-i*a,b=e*l-s*a,v=e*c-r*a,E=i*l-s*o,T=i*c-r*o,y=s*c-r*l,M=u*x-h*p,U=u*m-d*p,P=u*g-f*p,C=h*m-d*x,N=h*g-f*x,O=d*g-f*m,L=_*O-b*N+v*C+E*P-T*U+y*M;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let k=1/L;return t[0]=(o*O-l*N+c*C)*k,t[1]=(s*N-i*O-r*C)*k,t[2]=(x*y-m*T+g*E)*k,t[3]=(d*T-h*y-f*E)*k,t[4]=(l*P-a*O-c*U)*k,t[5]=(e*O-s*P+r*U)*k,t[6]=(m*v-p*y-g*b)*k,t[7]=(u*y-d*v+f*b)*k,t[8]=(a*N-o*P+c*M)*k,t[9]=(i*P-e*N-r*M)*k,t[10]=(p*T-x*v+g*_)*k,t[11]=(h*v-u*T-f*_)*k,t[12]=(o*U-a*C-l*M)*k,t[13]=(e*C-i*U+s*M)*k,t[14]=(x*b-p*E-m*_)*k,t[15]=(u*E-h*b+d*_)*k,this}scale(t){let e=this.elements,i=t.x,s=t.y,r=t.z;return e[0]*=i,e[4]*=s,e[8]*=r,e[1]*=i,e[5]*=s,e[9]*=r,e[2]*=i,e[6]*=s,e[10]*=r,e[3]*=i,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,s))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),s=Math.sin(e),r=1-i,a=t.x,o=t.y,l=t.z,c=r*a,u=r*o;return this.set(c*a+i,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+i,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,s,r,a){return this.set(1,i,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,i){let s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,u=a+a,h=o+o,d=r*c,f=r*u,p=r*h,x=a*u,m=a*h,g=o*h,_=l*c,b=l*u,v=l*h,E=i.x,T=i.y,y=i.z;return s[0]=(1-(x+g))*E,s[1]=(f+v)*E,s[2]=(p-b)*E,s[3]=0,s[4]=(f-v)*T,s[5]=(1-(d+g))*T,s[6]=(m+_)*T,s[7]=0,s[8]=(p+b)*y,s[9]=(m-_)*y,s[10]=(1-(d+x))*y,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,i){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),e.identity(),this;let a=pr.set(s[0],s[1],s[2]).length(),o=pr.set(s[4],s[5],s[6]).length(),l=pr.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Ji.copy(this);let c=1/a,u=1/o,h=1/l;return Ji.elements[0]*=c,Ji.elements[1]*=c,Ji.elements[2]*=c,Ji.elements[4]*=u,Ji.elements[5]*=u,Ji.elements[6]*=u,Ji.elements[8]*=h,Ji.elements[9]*=h,Ji.elements[10]*=h,e.setFromRotationMatrix(Ji),i.x=a,i.y=o,i.z=l,this}makePerspective(t,e,i,s,r,a,o=Vi,l=!1){let c=this.elements,u=2*r/(e-t),h=2*r/(i-s),d=(e+t)/(e-t),f=(i+s)/(i-s),p,x;if(l)p=r/(a-r),x=a*r/(a-r);else if(o===Vi)p=-(a+r)/(a-r),x=-2*a*r/(a-r);else if(o===Ir)p=-a/(a-r),x=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=h,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=x,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,i,s,r,a,o=Vi,l=!1){let c=this.elements,u=2/(e-t),h=2/(i-s),d=-(e+t)/(e-t),f=-(i+s)/(i-s),p,x;if(l)p=1/(a-r),x=a/(a-r);else if(o===Vi)p=-2/(a-r),x=-(a+r)/(a-r);else if(o===Ir)p=-1/(a-r),x=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=h,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=x,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<16;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}};Ql.prototype.isMatrix4=!0;var ge=Ql,pr=new D,Ji=new ge,Xm=new D(0,0,0),qm=new D(1,1,1),is=new D,Xo=new D,Di=new D,nf=new ge,sf=new si,nn=class n{constructor(t=0,e=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,s=this._order){return this._x=t,this._y=e,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],h=s[2],d=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(ee(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ee(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(ee(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ee(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(ee(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-ee(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:qt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return nf.makeRotationFromQuaternion(t),this.setFromRotationMatrix(nf,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return sf.setFromEuler(this),this.setFromQuaternion(sf,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};nn.DEFAULT_ORDER="XYZ";var Da=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},$m=0,rf=new D,mr=new si,Ln=new ge,qo=new D,ma=new D,Ym=new D,Km=new si,af=new D(1,0,0),of=new D(0,1,0),lf=new D(0,0,1),cf={type:"added"},Zm={type:"removed"},gr={type:"childadded",child:null},Lh={type:"childremoved",child:null},Ze=class n extends vn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:$m++}),this.uuid=Xn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let t=new D,e=new nn,i=new si,s=new D(1,1,1);function r(){i.setFromEuler(e,!1)}function a(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ge},normalMatrix:{value:new Kt}}),this.matrix=new ge,this.matrixWorld=new ge,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Da,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return mr.setFromAxisAngle(t,e),this.quaternion.multiply(mr),this}rotateOnWorldAxis(t,e){return mr.setFromAxisAngle(t,e),this.quaternion.premultiply(mr),this}rotateX(t){return this.rotateOnAxis(af,t)}rotateY(t){return this.rotateOnAxis(of,t)}rotateZ(t){return this.rotateOnAxis(lf,t)}translateOnAxis(t,e){return rf.copy(t).applyQuaternion(this.quaternion),this.position.add(rf.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(af,t)}translateY(t){return this.translateOnAxis(of,t)}translateZ(t){return this.translateOnAxis(lf,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Ln.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?qo.copy(t):qo.set(t,e,i);let s=this.parent;this.updateWorldMatrix(!0,!1),ma.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ln.lookAt(ma,qo,this.up):Ln.lookAt(qo,ma,this.up),this.quaternion.setFromRotationMatrix(Ln),s&&(Ln.extractRotation(s.matrixWorld),mr.setFromRotationMatrix(Ln),this.quaternion.premultiply(mr.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Yt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(cf),gr.child=t,this.dispatchEvent(gr),gr.child=null):Yt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Zm),Lh.child=t,this.dispatchEvent(Lh),Lh.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Ln.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Ln.multiply(t.parent.matrixWorld)),t.applyMatrix4(Ln),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(cf),gr.child=t,this.dispatchEvent(gr),gr.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,s=this.children.length;i<s;i++){let a=this.children[i].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ma,t,Ym),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ma,Km,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(t){t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,i=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*i-r[8]*s,r[13]+=i-r[1]*e-r[5]*i-r[9]*s,r[14]+=s-r[2]*e-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];r(t.shapes,h)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),u=a(t.images),h=a(t.shapes),d=a(t.skeletons),f=a(t.animations),p=a(t.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),p.length>0&&(i.nodes=p)}return i.object=s,i;function a(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let s=t.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ze.DEFAULT_UP=new D(0,1,0);Ze.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ze.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var he=class extends Ze{constructor(){super(),this.isGroup=!0,this.type="Group"}},Jm={type:"move"},Ur=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new he,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new he,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new he,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let x of t.hand.values()){let m=e.getJointPose(x,i),g=this._getHandJoint(c,x);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.quaternion,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,p=.005;c.inputState.pinching&&d>f+p?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-p&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=e.getPose(t.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Jm)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new he;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},xp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ns={h:0,s:0,l:0},$o={h:0,s:0,l:0};function Dh(n,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?n+(t-n)*6*e:e<1/2?t:e<2/3?n+(t-n)*6*(2/3-e):n}var Lt=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Oe){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,me.colorSpaceToWorking(this,e),this}setRGB(t,e,i,s=me.workingColorSpace){return this.r=t,this.g=e,this.b=i,me.colorSpaceToWorking(this,s),this}setHSL(t,e,i,s=me.workingColorSpace){if(t=Nd(t,1),e=ee(e,0,1),i=ee(i,0,1),e===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+e):i+e-i*e,a=2*i-r;this.r=Dh(a,r,t+1/3),this.g=Dh(a,r,t),this.b=Dh(a,r,t-1/3)}return me.colorSpaceToWorking(this,s),this}setStyle(t,e=Oe){function i(r){r!==void 0&&parseFloat(r)<1&&qt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,e);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:qt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);qt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Oe){let i=xp[t.toLowerCase()];return i!==void 0?this.setHex(i,e):qt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=On(t.r),this.g=On(t.g),this.b=On(t.b),this}copyLinearToSRGB(t){return this.r=Cr(t.r),this.g=Cr(t.g),this.b=Cr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Oe){return me.workingToColorSpace(gi.copy(this),t),Math.round(ee(gi.r*255,0,255))*65536+Math.round(ee(gi.g*255,0,255))*256+Math.round(ee(gi.b*255,0,255))}getHexString(t=Oe){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=me.workingColorSpace){me.workingToColorSpace(gi.copy(this),e);let i=gi.r,s=gi.g,r=gi.b,a=Math.max(i,s,r),o=Math.min(i,s,r),l,c,u=(o+a)/2;if(o===a)l=0,c=0;else{let h=a-o;switch(c=u<=.5?h/(a+o):h/(2-a-o),a){case i:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-i)/h+2;break;case r:l=(i-s)/h+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=me.workingColorSpace){return me.workingToColorSpace(gi.copy(this),e),t.r=gi.r,t.g=gi.g,t.b=gi.b,t}getStyle(t=Oe){me.workingToColorSpace(gi.copy(this),t);let e=gi.r,i=gi.g,s=gi.b;return t!==Oe?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,e,i){return this.getHSL(ns),this.setHSL(ns.h+t,ns.s+e,ns.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(ns),t.getHSL($o);let i=wa(ns.h,$o.h,e),s=wa(ns.s,$o.s,e),r=wa(ns.l,$o.l,e);return this.setHSL(i,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*s,this.g=r[1]*e+r[4]*i+r[7]*s,this.b=r[2]*e+r[5]*i+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},gi=new Lt;Lt.NAMES=xp;var Na=class n{constructor(t,e=1,i=1e3){this.isFog=!0,this.name="",this.color=new Lt(t),this.near=e,this.far=i}clone(){return new n(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Fs=class extends Ze{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new nn,this.environmentIntensity=1,this.environmentRotation=new nn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),this.background=t.background!==null?t.background.clone():null,this.environment=t.environment!==null?t.environment.clone():null,this.fog=t.fog!==null?t.fog.clone():null,this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),this.overrideMaterial=t.overrideMaterial!==null?t.overrideMaterial.clone():null,this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},ji=new D,Dn=new D,Nh=new D,Nn=new D,xr=new D,vr=new D,hf=new D,Uh=new D,Fh=new D,Oh=new D,kh=new _e,zh=new _e,Bh=new _e,os=class n{constructor(t=new D,e=new D,i=new D){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,s){s.subVectors(i,e),ji.subVectors(t,e),s.cross(ji);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,i,s,r){ji.subVectors(s,e),Dn.subVectors(i,e),Nh.subVectors(t,e);let a=ji.dot(ji),o=ji.dot(Dn),l=ji.dot(Nh),c=Dn.dot(Dn),u=Dn.dot(Nh),h=a*c-o*o;if(h===0)return r.set(0,0,0),null;let d=1/h,f=(c*l-o*u)*d,p=(a*u-o*l)*d;return r.set(1-f-p,p,f)}static containsPoint(t,e,i,s){return this.getBarycoord(t,e,i,s,Nn)===null?!1:Nn.x>=0&&Nn.y>=0&&Nn.x+Nn.y<=1}static getInterpolation(t,e,i,s,r,a,o,l){return this.getBarycoord(t,e,i,s,Nn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Nn.x),l.addScaledVector(a,Nn.y),l.addScaledVector(o,Nn.z),l)}static getInterpolatedAttribute(t,e,i,s,r,a){return kh.setScalar(0),zh.setScalar(0),Bh.setScalar(0),kh.fromBufferAttribute(t,e),zh.fromBufferAttribute(t,i),Bh.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(kh,r.x),a.addScaledVector(zh,r.y),a.addScaledVector(Bh,r.z),a}static isFrontFacing(t,e,i,s){return ji.subVectors(i,e),Dn.subVectors(t,e),ji.cross(Dn).dot(s)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,s){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,i,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return ji.subVectors(this.c,this.b),Dn.subVectors(this.a,this.b),ji.cross(Dn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return n.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return n.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,s,r){return n.getInterpolation(t,this.a,this.b,this.c,e,i,s,r)}containsPoint(t){return n.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return n.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,s=this.b,r=this.c,a,o;xr.subVectors(s,i),vr.subVectors(r,i),Uh.subVectors(t,i);let l=xr.dot(Uh),c=vr.dot(Uh);if(l<=0&&c<=0)return e.copy(i);Fh.subVectors(t,s);let u=xr.dot(Fh),h=vr.dot(Fh);if(u>=0&&h<=u)return e.copy(s);let d=l*h-u*c;if(d<=0&&l>=0&&u<=0&&l-u>0)return a=l/(l-u),e.copy(i).addScaledVector(xr,a);Oh.subVectors(t,r);let f=xr.dot(Oh),p=vr.dot(Oh);if(p>=0&&f<=p)return e.copy(r);let x=f*c-l*p;if(x<=0&&c>=0&&p<=0)return o=c/(c-p),e.copy(i).addScaledVector(vr,o);let m=u*p-f*h;if(m<=0&&h-u>=0&&f-p>=0)return hf.subVectors(r,s),o=(h-u)/(h-u+(f-p)),e.copy(s).addScaledVector(hf,o);let g=1/(m+x+d);return a=x*g,o=d*g,e.copy(i).addScaledVector(xr,a).addScaledVector(vr,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},oi=class{constructor(t=new D(1/0,1/0,1/0),e=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(Qi.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(Qi.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=Qi.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0&&t.isBatchedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,Qi):Qi.fromBufferAttribute(r,a),Qi.applyMatrix4(t.matrixWorld),this.expandByPoint(Qi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Yo.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Yo.copy(i.boundingBox)),Yo.applyMatrix4(t.matrixWorld),this.union(Yo)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Qi),Qi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(ga),Ko.subVectors(this.max,ga),yr.subVectors(t.a,ga),_r.subVectors(t.b,ga),br.subVectors(t.c,ga),ss.subVectors(_r,yr),rs.subVectors(br,_r),Ls.subVectors(yr,br);let e=[0,-ss.z,ss.y,0,-rs.z,rs.y,0,-Ls.z,Ls.y,ss.z,0,-ss.x,rs.z,0,-rs.x,Ls.z,0,-Ls.x,-ss.y,ss.x,0,-rs.y,rs.x,0,-Ls.y,Ls.x,0];return!Hh(e,yr,_r,br,Ko)||(e=[1,0,0,0,1,0,0,0,1],!Hh(e,yr,_r,br,Ko))?!1:(Zo.crossVectors(ss,rs),e=[Zo.x,Zo.y,Zo.z],Hh(e,yr,_r,br,Ko))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Qi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Qi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Un[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Un[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Un[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Un[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Un[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Un[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Un[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Un[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Un),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Un=[new D,new D,new D,new D,new D,new D,new D,new D],Qi=new D,Yo=new oi,yr=new D,_r=new D,br=new D,ss=new D,rs=new D,Ls=new D,ga=new D,Ko=new D,Zo=new D,Ds=new D;function Hh(n,t,e,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){Ds.fromArray(n,r);let o=s.x*Math.abs(Ds.x)+s.y*Math.abs(Ds.y)+s.z*Math.abs(Ds.z),l=t.dot(Ds),c=e.dot(Ds),u=i.dot(Ds);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}var Ye=new D,Jo=new dt,jm=0,ni=class extends vn{constructor(t,e,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:jm++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=Ld,this.updateRanges=[],this.gpuType=qi,this.version=0,this._normalizationScale=t!==void 0?Hc(t):void 0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this._normalizationScale=t._normalizationScale,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Jo.fromBufferAttribute(this,e),Jo.applyMatrix3(t),this.setXY(e,Jo.x,Jo.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Ye.fromBufferAttribute(this,e),Ye.applyMatrix3(t),this.setXYZ(e,Ye.x,Ye.y,Ye.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Ye.fromBufferAttribute(this,e),Ye.applyMatrix4(t),this.setXYZ(e,Ye.x,Ye.y,Ye.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Ye.fromBufferAttribute(this,e),Ye.applyNormalMatrix(t),this.setXYZ(e,Ye.x,Ye.y,Ye.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Ye.fromBufferAttribute(this,e),Ye.transformDirection(t),this.setXYZ(e,Ye.x,Ye.y,Ye.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=this._denormalize(i)),i}setComponent(t,e,i){return this.normalized&&(i=this._normalize(i)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=this._denormalize(e)),e}setX(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=this._denormalize(e)),e}setY(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=this._denormalize(e)),e}setZ(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=this._denormalize(e)),e}setW(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),i=this._normalize(i)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,s){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),i=this._normalize(i),s=this._normalize(s)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,e,i,s,r){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),i=this._normalize(i),s=this._normalize(s),r=this._normalize(r)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(t){let e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):Fd(t,this.array)}_normalize(t){let e=this._normalizationScale;return e!==void 0?Math.round(t*e):Od(t,this.array)}};var Ua=class extends ni{constructor(t,e,i){super(new Uint16Array(t),e,i)}};var Fa=class extends ni{constructor(t,e,i){super(new Uint32Array(t),e,i)}};var Wt=class extends ni{constructor(t,e,i){super(new Float32Array(t),e,i)}},Qm=new oi,xa=new D,Gh=new D,Ui=class{constructor(t=new D,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):Qm.setFromPoints(t).getCenter(i);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;xa.subVectors(t,this.center);let e=xa.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),s=(i-this.radius)*.5;this.center.addScaledVector(xa,s/i),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Gh.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(xa.copy(t.center).add(Gh)),this.expandByPoint(xa.copy(t.center).sub(Gh))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},tg=0,Hi=new ge,Vh=new Ze,Mr=new D,Ni=new oi,va=new oi,ei=new D,ve=class n extends vn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:tg++}),this.uuid=Xn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Em(t)?Fa:Ua)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new Kt().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Hi.makeRotationFromQuaternion(t),this.applyMatrix4(Hi),this}rotateX(t){return Hi.makeRotationX(t),this.applyMatrix4(Hi),this}rotateY(t){return Hi.makeRotationY(t),this.applyMatrix4(Hi),this}rotateZ(t){return Hi.makeRotationZ(t),this.applyMatrix4(Hi),this}translate(t,e,i){return Hi.makeTranslation(t,e,i),this.applyMatrix4(Hi),this}scale(t,e,i){return Hi.makeScale(t,e,i),this.applyMatrix4(Hi),this}lookAt(t){return Vh.lookAt(t),Vh.updateMatrix(),this.applyMatrix4(Vh.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Mr).negate(),this.translate(Mr.x,Mr.y,Mr.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Wt(i,3))}else{let i=Math.min(t.length,e.count);for(let s=0;s<i;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&qt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new oi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Yt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,s=e.length;i<s;i++){let r=e[i];Ni.setFromBufferAttribute(r),this.morphTargetsRelative?(ei.addVectors(this.boundingBox.min,Ni.min),this.boundingBox.expandByPoint(ei),ei.addVectors(this.boundingBox.max,Ni.max),this.boundingBox.expandByPoint(ei)):(this.boundingBox.expandByPoint(Ni.min),this.boundingBox.expandByPoint(Ni.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Yt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ui);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Yt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(t){let i=this.boundingSphere.center;if(Ni.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];va.setFromBufferAttribute(o),this.morphTargetsRelative?(ei.addVectors(Ni.min,va.min),Ni.expandByPoint(ei),ei.addVectors(Ni.max,va.max),Ni.expandByPoint(ei)):(Ni.expandByPoint(va.min),Ni.expandByPoint(va.max))}Ni.getCenter(i);let s=0;for(let r=0,a=t.count;r<a;r++)ei.fromBufferAttribute(t,r),s=Math.max(s,i.distanceToSquared(ei));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)ei.fromBufferAttribute(o,c),l&&(Mr.fromBufferAttribute(t,c),ei.add(Mr)),s=Math.max(s,i.distanceToSquared(ei))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Yt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Yt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,s=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new ni(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));let o=[],l=[],c=new Uint8Array(i.count);for(let U=0;U<i.count;U++)o[U]=new D,l[U]=new D;let u=new D,h=new D,d=new D,f=new dt,p=new dt,x=new dt,m=new D,g=new D;function _(U,P,C){c[U]=c[P]=c[C]=1,u.fromBufferAttribute(i,U),h.fromBufferAttribute(i,P),d.fromBufferAttribute(i,C),f.fromBufferAttribute(r,U),p.fromBufferAttribute(r,P),x.fromBufferAttribute(r,C),h.sub(u),d.sub(u),p.sub(f),x.sub(f);let N=1/(p.x*x.y-x.x*p.y);isFinite(N)&&(m.copy(h).multiplyScalar(x.y).addScaledVector(d,-p.y).multiplyScalar(N),g.copy(d).multiplyScalar(p.x).addScaledVector(h,-x.x).multiplyScalar(N),o[U].add(m),o[P].add(m),o[C].add(m),l[U].add(g),l[P].add(g),l[C].add(g))}let b=this.groups;b.length===0&&(b=[{start:0,count:t.count}]);for(let U=0,P=b.length;U<P;++U){let C=b[U],N=C.start,O=C.count;for(let L=N,k=N+O;L<k;L+=3)_(t.getX(L+0),t.getX(L+1),t.getX(L+2))}let v=new D,E=new D,T=new D,y=new D;function M(U){T.fromBufferAttribute(s,U),y.copy(T);let P=o[U];v.copy(P),v.sub(T.multiplyScalar(T.dot(P))).normalize(),E.crossVectors(y,P);let N=E.dot(l[U])<0?-1:1;a.setXYZW(U,v.x,v.y,v.z,N)}for(let U=0,P=i.count;U<P;++U)c[U]&&M(U);this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new ni(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let s=new D,r=new D,a=new D,o=new D,l=new D,c=new D,u=new D,h=new D;if(t)for(let d=0,f=t.count;d<f;d+=3){let p=t.getX(d+0),x=t.getX(d+1),m=t.getX(d+2);s.fromBufferAttribute(e,p),r.fromBufferAttribute(e,x),a.fromBufferAttribute(e,m),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),o.fromBufferAttribute(i,p),l.fromBufferAttribute(i,x),c.fromBufferAttribute(i,m),o.add(u),l.add(u),c.add(u),i.setXYZ(p,o.x,o.y,o.z),i.setXYZ(x,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),a.fromBufferAttribute(e,d+2),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),i.setXYZ(d+0,u.x,u.y,u.z),i.setXYZ(d+1,u.x,u.y,u.z),i.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)ei.fromBufferAttribute(t,e),ei.normalize(),t.setXYZ(e,ei.x,ei.y,ei.z)}toNonIndexed(){function t(o,l){let c=o.array,u=o.itemSize,h=o.normalized,d=new c.constructor(l.length*u),f=0,p=0;for(let x=0,m=l.length;x<m;x++){o.isInterleavedBufferAttribute?f=l[x]*o.data.stride+o.offset:f=l[x]*u;for(let g=0;g<u;g++)d[p++]=c[f++]}return new ni(d,u,h)}if(this.index===null)return qt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new n,i=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,i);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let u=0,h=c.length;u<h;u++){let d=c[u],f=t(d,i);l.push(f)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){let f=c[h];u.push(f.toJSON(t.data))}u.length>0&&(s[l]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let s=t.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(e))}let r=t.morphAttributes;for(let c in r){let u=[],h=r[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,u=a.length;c<u;c++){let h=a[c];this.addGroup(h.start,h.count,h.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Il=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Ld,this.updateRanges=[],this.version=0,this.uuid=Xn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,i){t*=this.stride,i*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[i+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={});let e=df(this.array);t.arrayBuffers[e]===void 0&&(t.arrayBuffers[e]=this.array.slice(0).buffer);let i=new this.array.constructor(t.arrayBuffers[e]),s=new this.constructor(i,this.stride);return s.setUsage(this.usage),s}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={});let e=df(this.array);t.arrayBuffers[e]===void 0&&(t.arrayBuffers[e]=Array.from(new Uint32Array(this.array.slice(0).buffer)));let i={uuid:this.uuid,buffer:e,type:this.array.constructor.name,stride:this.stride};return i.usage=this.usage,i}};function df(n){return n.buffer._uuid===void 0&&(n.buffer._uuid=Xn()),n.byteOffset===0&&n.byteLength===n.buffer.byteLength?n.buffer._uuid:n.buffer._uuid+":"+n.byteOffset+":"+n.byteLength}var Ei=new D,sn=class n{constructor(t,e,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=i,this.normalized=s,this._normalizationScale=t!==void 0?Hc(t.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,i=this.data.count;e<i;e++)Ei.fromBufferAttribute(this,e),Ei.applyMatrix4(t),this.setXYZ(e,Ei.x,Ei.y,Ei.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Ei.fromBufferAttribute(this,e),Ei.applyNormalMatrix(t),this.setXYZ(e,Ei.x,Ei.y,Ei.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Ei.fromBufferAttribute(this,e),Ei.transformDirection(t),this.setXYZ(e,Ei.x,Ei.y,Ei.z);return this}getComponent(t,e){let i=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(i=this._denormalize(i)),i}setComponent(t,e,i){return this.normalized&&(i=this._normalize(i)),this.data.array[t*this.data.stride+this.offset+e]=i,this}setX(t,e){return this.normalized&&(e=this._normalize(e)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=this._normalize(e)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=this._normalize(e)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=this._normalize(e)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=this._denormalize(e)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=this._denormalize(e)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=this._denormalize(e)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=this._denormalize(e)),e}setXY(t,e,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=this._normalize(e),i=this._normalize(i)),this.data.array[t+0]=e,this.data.array[t+1]=i,this}setXYZ(t,e,i,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=this._normalize(e),i=this._normalize(i),s=this._normalize(s)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=s,this}setXYZW(t,e,i,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=this._normalize(e),i=this._normalize(i),s=this._normalize(s),r=this._normalize(r)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){Ia("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new ni(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new n(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){Ia("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(t){let e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):Fd(t,this.data.array)}_normalize(t){let e=this._normalizationScale;return e!==void 0?Math.round(t*e):Od(t,this.data.array)}},Wh=new D,eg=new D,ig=new Kt,tn=class{constructor(t=new D(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,s){return this.normal.set(t,e,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let s=Wh.subVectors(i,e).cross(eg.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let s=t.delta(Wh),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||ig.getNormalMatrix(t),s=this.coplanarPoint(Wh).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},ng=0,zn=class extends vn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ng++}),this.uuid=Xn(),this.name="",this.type="Material",this.blending=Vr,this.side=gs,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=fd,this.blendDst=pd,this.blendEquation=Vs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Lt(0,0,0),this.blendAlpha=0,this.depthFunc=Pr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=op,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=vl,this.stencilZFail=vl,this.stencilZPass=vl,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){qt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){qt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(i.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(i.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(t).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(i.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(i.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Lt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.diffuseRoughness!==void 0&&(this.diffuseRoughness=t.diffuseRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum),t.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=t.iridescenceThicknessRange[1]),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new tn().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new dt().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new dt().fromArray(t.clearcoatNormalScale)),t.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=e[t.diffuseRoughnessMap]||null),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let s=e.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var Fn=new D,Xh=new D,jo=new D,Qo=new D,Oa=class{constructor(t=new D,e=new D(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Fn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Fn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Fn.copy(this.origin).addScaledVector(this.direction,e),Fn.distanceToSquared(t))}distanceSqToSegment(t,e,i,s){Xh.copy(t).add(e).multiplyScalar(.5),jo.copy(e).sub(t).normalize(),Qo.copy(this.origin).sub(Xh);let r=t.distanceTo(e)*.5,a=-this.direction.dot(jo),o=Qo.dot(this.direction),l=-Qo.dot(jo),c=Qo.lengthSq(),u=Math.abs(1-a*a),h,d,f,p;if(u>0)if(h=a*l-o,d=a*o-l,p=r*u,h>=0)if(d>=-p)if(d<=p){let x=1/u;h*=x,d*=x,f=h*(h+a*d+2*o)+d*(a*h+d+2*l)+c}else d=r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;else d<=-p?(h=Math.max(0,-(-a*r+o)),d=h>0?-r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c):d<=p?(h=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(h=Math.max(0,-(a*r+o)),d=h>0?r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c);else d=a>0?-r:r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(Xh).addScaledVector(jo,d),f}intersectSphere(t,e){if(t.radius<0)return null;Fn.subVectors(t.center,this.origin);let i=Fn.dot(this.direction),s=Fn.dot(Fn)-i*i,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,s,r,a,o,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(i=(t.min.x-d.x)*c,s=(t.max.x-d.x)*c):(i=(t.max.x-d.x)*c,s=(t.min.x-d.x)*c),u>=0?(r=(t.min.y-d.y)*u,a=(t.max.y-d.y)*u):(r=(t.max.y-d.y)*u,a=(t.min.y-d.y)*u),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),h>=0?(o=(t.min.z-d.z)*h,l=(t.max.z-d.z)*h):(o=(t.max.z-d.z)*h,l=(t.min.z-d.z)*h),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,e)}intersectsBox(t){return this.intersectBox(t,Fn)!==null}intersectTriangle(t,e,i,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,h=t.x-a.x,d=t.y-a.y,f=t.z-a.z,p=e.x-a.x,x=e.y-a.y,m=e.z-a.z,g=i.x-a.x,_=i.y-a.y,b=i.z-a.z,v=Math.abs(l),E=Math.abs(c),T=Math.abs(u),y,M,U,P,C,N,O,L,k,G,V,at;if(v>=E&&v>=T?(U=l,N=h,k=p,at=g,l>=0?(y=c,M=u,P=d,C=f,O=x,L=m,G=_,V=b):(y=u,M=c,P=f,C=d,O=m,L=x,G=b,V=_)):E>=T?(U=c,N=d,k=x,at=_,c>=0?(y=u,M=l,P=f,C=h,O=m,L=p,G=b,V=g):(y=l,M=u,P=h,C=f,O=p,L=m,G=g,V=b)):(U=u,N=f,k=m,at=b,u>=0?(y=l,M=c,P=h,C=d,O=p,L=x,G=g,V=_):(y=c,M=l,P=d,C=h,O=x,L=p,G=_,V=g)),U===0)return null;let $=y/U,nt=M/U,rt=1/U,Dt=P-$*N,Gt=C-nt*N,j=O-$*k,wt=L-nt*k,Nt=G-$*at,Y=V-nt*at,H=Nt*wt-Y*j,Z=Dt*Y-Gt*Nt,At=j*Gt-wt*Dt;if(s){if(H<0||Z<0||At<0)return null}else if((H<0||Z<0||At<0)&&(H>0||Z>0||At>0))return null;let Pt=H+Z+At;if(Pt===0)return null;let $t=rt*(H*N+Z*k+At*at);return(Pt>0?$t<0:$t>0)?null:this.at($t/Pt,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Wi=class extends zn{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Lt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new nn,this.combine=md,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},uf=new ge,Ns=new Oa,tl=new Ui,ff=new D,el=new D,il=new D,nl=new D,qh=new D,sl=new D,pf=new D,rl=new D,Rt=class extends Ze{constructor(t=new ve,e=new Wi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){sl.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=o[l],h=r[l];u!==0&&(qh.fromBufferAttribute(h,t),a?sl.addScaledVector(qh,u):sl.addScaledVector(qh.sub(e),u))}e.add(sl)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),tl.copy(i.boundingSphere),tl.applyMatrix4(r),Ns.copy(t.ray).recast(t.near),!(tl.containsPoint(Ns.origin)===!1&&(Ns.intersectSphere(tl,ff)===null||Ns.origin.distanceToSquared(ff)>(t.far-t.near)**2))&&(uf.copy(r).invert(),Ns.copy(t.ray).applyMatrix4(uf),!(i.boundingBox!==null&&Ns.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,Ns)))}_computeIntersections(t,e,i){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let p=0,x=d.length;p<x;p++){let m=d[p],g=a[m.materialIndex],_=Math.max(m.start,f.start),b=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let v=_,E=b;v<E;v+=3){let T=o.getX(v),y=o.getX(v+1),M=o.getX(v+2);s=al(this,g,t,i,c,u,h,T,y,M),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let p=Math.max(0,f.start),x=Math.min(o.count,f.start+f.count);for(let m=p,g=x;m<g;m+=3){let _=o.getX(m),b=o.getX(m+1),v=o.getX(m+2);s=al(this,a,t,i,c,u,h,_,b,v),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let p=0,x=d.length;p<x;p++){let m=d[p],g=a[m.materialIndex],_=Math.max(m.start,f.start),b=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let v=_,E=b;v<E;v+=3){let T=v,y=v+1,M=v+2;s=al(this,g,t,i,c,u,h,T,y,M),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let p=Math.max(0,f.start),x=Math.min(l.count,f.start+f.count);for(let m=p,g=x;m<g;m+=3){let _=m,b=m+1,v=m+2;s=al(this,a,t,i,c,u,h,_,b,v),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function sg(n,t,e,i,s,r,a,o){let l;if(t.side===li?l=i.intersectTriangle(a,r,s,!0,o):l=i.intersectTriangle(s,r,a,t.side===gs,o),l===null)return null;rl.copy(o),rl.applyMatrix4(n.matrixWorld);let c=e.ray.origin.distanceTo(rl);return c<e.near||c>e.far?null:{distance:c,point:rl.clone(),object:n}}function al(n,t,e,i,s,r,a,o,l,c){n.getVertexPosition(o,el),n.getVertexPosition(l,il),n.getVertexPosition(c,nl);let u=sg(n,t,e,i,el,il,nl,pf);if(u){let h=new D;os.getBarycoord(pf,el,il,nl,h),s&&(u.uv=os.getInterpolatedAttribute(s,o,l,c,h,new dt)),r&&(u.uv1=os.getInterpolatedAttribute(r,o,l,c,h,new dt)),a&&(u.normal=os.getInterpolatedAttribute(a,o,l,c,h,new D),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let d={a:o,b:l,c,normal:new D,materialIndex:0};os.getNormal(el,il,nl,d.normal),u.face=d,u.barycoord=h}return u}var Bn=class extends Ti{constructor(t=null,e=1,i=1,s,r,a,o,l,c=We,u=We,h,d){super(null,a,o,l,c,u,s,r,h,d),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ka=class extends ni{constructor(t,e,i,s=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Sr=new ge,mf=new ge,ol=[],gf=new oi,rg=new ge,ya=new Rt,_a=new Ui,za=class extends Rt{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new ka(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,rg)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new oi),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Sr),gf.copy(t.boundingBox).applyMatrix4(Sr),this.boundingBox.union(gf)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ui),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Sr),_a.copy(t.boundingSphere).applyMatrix4(Sr),this.boundingSphere.union(_a)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),this.morphTexture=t.morphTexture!==null?t.morphTexture.clone():null,this.instanceColor=t.instanceColor!==null?t.instanceColor.clone():null,this.count=t.count,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,a=t*r+1;for(let o=0;o<i.length;o++)i[o]=s[a+o]}raycast(t,e){let i=this.matrixWorld,s=this.count;if(ya.geometry=this.geometry,ya.material=this.material,ya.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),_a.copy(this.boundingSphere),_a.applyMatrix4(i),t.ray.intersectsSphere(_a)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Sr),mf.multiplyMatrices(i,Sr),ya.matrixWorld=mf,ya.raycast(t,ol);for(let a=0,o=ol.length;a<o;a++){let l=ol[a];l.instanceId=r,l.object=this,e.push(l)}ol.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new ka(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let i=e.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new Bn(new Float32Array(s*this.count),s,this.count,ac,qi));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<i.length;c++)a+=i[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*t;return r[l]=o,r.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Us=new Ui,ag=new dt(.5,.5),ll=new D,ls=class{constructor(t=new tn,e=new tn,i=new tn,s=new tn,r=new tn,a=new tn){this.planes=[t,e,i,s,r,a]}set(t,e,i,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=Vi,i=!1){let s=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],h=r[5],d=r[6],f=r[7],p=r[8],x=r[9],m=r[10],g=r[11],_=r[12],b=r[13],v=r[14],E=r[15];if(s[0].setComponents(c-a,f-u,g-p,E-_).normalize(),s[1].setComponents(c+a,f+u,g+p,E+_).normalize(),s[2].setComponents(c+o,f+h,g+x,E+b).normalize(),s[3].setComponents(c-o,f-h,g-x,E-b).normalize(),i)s[4].setComponents(l,d,m,v).normalize(),s[5].setComponents(c-l,f-d,g-m,E-v).normalize();else if(s[4].setComponents(c-l,f-d,g-m,E-v).normalize(),e===Vi)s[5].setComponents(c+l,f+d,g+m,E+v).normalize();else if(e===Ir)s[5].setComponents(l,d,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Us.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Us.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Us)}intersectsSprite(t){Us.center.set(0,0,0);let e=ag.distanceTo(t.center);return Us.radius=.7071067811865476+e,Us.applyMatrix4(t.matrixWorld),this.intersectsSphere(Us)}intersectsSphere(t){let e=this.planes,i=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let s=e[i];if(ll.x=s.normal.x>0?t.max.x:t.min.x,ll.y=s.normal.y>0?t.max.y:t.min.y,ll.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(ll)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},xf=new ge,Ll=class n{constructor(){this.coordinateSystem=Vi,this._frustums=[],this._count=0}setFromArrayCamera(t){let e=t.cameras,i=this._frustums;for(let s=0;s<e.length;s++){let r=e[s];xf.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),i[s]===void 0&&(i[s]=new ls),i[s].setFromProjectionMatrix(xf,r.coordinateSystem,r.reversedDepth)}return this._count=e.length,this}getFrustum(t){return this._frustums[t]}intersectsObject(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsObject(t))return!0;return!1}intersectsSprite(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsSprite(t))return!0;return!1}intersectsSphere(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsSphere(t))return!0;return!1}intersectsBox(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsBox(t))return!0;return!1}containsPoint(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].containsPoint(t))return!0;return!1}copy(t){this.coordinateSystem=t.coordinateSystem;let e=this._frustums,i=t._frustums;for(let s=0;s<t._count;s++)e[s]===void 0&&(e[s]=new ls),e[s].copy(i[s]);return this._count=t._count,this}clone(){return new n().copy(this)}};var Fr=class extends zn{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Lt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},vf=new ge,id=new Oa,cl=new Ui,hl=new D,Ba=class extends Ze{constructor(t=new ve,e=new Fr){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),cl.copy(i.boundingSphere),cl.applyMatrix4(s),cl.radius+=r,t.ray.intersectsSphere(cl)===!1)return;vf.copy(s).invert(),id.copy(t.ray).applyMatrix4(vf);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,h=i.attributes.position;if(c!==null){let d=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let p=d,x=f;p<x;p++){let m=c.getX(p);hl.fromBufferAttribute(h,m),yf(hl,m,l,s,t,e,this)}}else{let d=Math.max(0,a.start),f=Math.min(h.count,a.start+a.count);for(let p=d,x=f;p<x;p++)hl.fromBufferAttribute(h,p),yf(hl,p,l,s,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function yf(n,t,e,i,s,r,a){let o=id.distanceSqToPoint(n);if(o<e){let l=new D;id.closestPointToPoint(n,l),l.applyMatrix4(i);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}var Ha=class extends Ti{constructor(t=[],e=Xs,i,s,r,a,o,l,c,u){super(t,e,i,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},yn=class extends Ti{constructor(t,e,i,s,r,a,o,l,c){super(t,e,i,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Hn=class extends Ti{constructor(t,e,i=rn,s,r,a,o=We,l=We,c,u=kn,h=1){if(u!==kn&&u!==Wn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:t,height:e,depth:h};super(d,s,r,a,o,l,u,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Nr(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},Ga=class extends Hn{constructor(t,e=rn,i=Xs,s,r,a=We,o=We,l,c=kn){let u={width:t,height:t,depth:1},h=[u,u,u,u,u,u];super(t,t,e,i,s,r,a,o,l,c),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Va=class extends Ti{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},cs=class n extends ve{constructor(t=1,e=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],u=[],h=[],d=0,f=0;p("z","y","x",-1,-1,i,e,t,a,r,0),p("z","y","x",1,-1,i,e,-t,a,r,1),p("x","z","y",1,1,t,i,e,s,a,2),p("x","z","y",1,-1,t,i,-e,s,a,3),p("x","y","z",1,-1,t,e,i,s,r,4),p("x","y","z",-1,-1,t,e,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new Wt(c,3)),this.setAttribute("normal",new Wt(u,3)),this.setAttribute("uv",new Wt(h,2));function p(x,m,g,_,b,v,E,T,y,M,U){let P=v/y,C=E/M,N=v/2,O=E/2,L=T/2,k=y+1,G=M+1,V=0,at=0,$=new D;for(let nt=0;nt<G;nt++){let rt=nt*C-O;for(let Dt=0;Dt<k;Dt++){let Gt=Dt*P-N;$[x]=Gt*_,$[m]=rt*b,$[g]=L,c.push($.x,$.y,$.z),$[x]=0,$[m]=0,$[g]=T>0?1:-1,u.push($.x,$.y,$.z),h.push(Dt/y),h.push(1-nt/M),V+=1}}for(let nt=0;nt<M;nt++)for(let rt=0;rt<y;rt++){let Dt=d+rt+k*nt,Gt=d+rt+k*(nt+1),j=d+(rt+1)+k*(nt+1),wt=d+(rt+1)+k*nt;l.push(Dt,Gt,wt),l.push(Gt,j,wt),at+=6}o.addGroup(f,at,U),f+=at,d+=V}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Fi=class n extends ve{constructor(t=1,e=1,i=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],d=[],f=[],p=0,x=[],m=i/2,g=0;_(),a===!1&&(t>0&&b(!0),e>0&&b(!1)),this.setIndex(u),this.setAttribute("position",new Wt(h,3)),this.setAttribute("normal",new Wt(d,3)),this.setAttribute("uv",new Wt(f,2));function _(){let v=new D,E=new D,T=0,y=(e-t)/i;for(let M=0;M<=r;M++){let U=[],P=M/r,C=P*(e-t)+t;for(let N=0;N<=s;N++){let O=N/s,L=O*l+o,k=Math.sin(L),G=Math.cos(L);E.x=C*k,E.y=-P*i+m,E.z=C*G,h.push(E.x,E.y,E.z),v.set(k,y,G).normalize(),d.push(v.x,v.y,v.z),f.push(O,1-P),U.push(p++)}x.push(U)}for(let M=0;M<s;M++)for(let U=0;U<r;U++){let P=x[U][M],C=x[U+1][M],N=x[U+1][M+1],O=x[U][M+1];(t>0||U!==0)&&(u.push(P,C,O),T+=3),(e>0||U!==r-1)&&(u.push(C,N,O),T+=3)}c.addGroup(g,T,0),g+=T}function b(v){let E=p,T=new dt,y=new D,M=0,U=v===!0?t:e,P=v===!0?1:-1;for(let N=1;N<=s;N++)h.push(0,m*P,0),d.push(0,P,0),f.push(.5,.5),p++;let C=p;for(let N=0;N<=s;N++){let L=N/s*l+o,k=Math.cos(L),G=Math.sin(L);y.x=U*G,y.y=m*P,y.z=U*k,h.push(y.x,y.y,y.z),d.push(0,P,0),T.x=k*.5+.5,T.y=G*.5*P+.5,f.push(T.x,T.y),p++}for(let N=0;N<s;N++){let O=E+N,L=C+N;v===!0?u.push(L,L+1,O):u.push(L+1,L,O),M+=3}c.addGroup(g,M,v===!0?1:2),g+=M}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Os=class n extends Fi{constructor(t=1,e=1,i=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,i,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new n(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Dl=class n extends ve{constructor(t=[],e=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:i,detail:s};let r=[],a=[];o(s),c(i),u(),this.setAttribute("position",new Wt(r,3)),this.setAttribute("normal",new Wt(r.slice(),3)),this.setAttribute("uv",new Wt(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(_){let b=new D,v=new D,E=new D;for(let T=0;T<e.length;T+=3)f(e[T+0],b),f(e[T+1],v),f(e[T+2],E),l(b,v,E,_)}function l(_,b,v,E){let T=E+1,y=[];for(let M=0;M<=T;M++){y[M]=[];let U=_.clone().lerp(v,M/T),P=b.clone().lerp(v,M/T),C=T-M;for(let N=0;N<=C;N++)N===0&&M===T?y[M][N]=U:y[M][N]=U.clone().lerp(P,N/C)}for(let M=0;M<T;M++)for(let U=0;U<2*(T-M)-1;U++){let P=Math.floor(U/2);U%2===0?(d(y[M][P+1]),d(y[M+1][P]),d(y[M][P])):(d(y[M][P+1]),d(y[M+1][P+1]),d(y[M+1][P]))}}function c(_){let b=new D;for(let v=0;v<r.length;v+=3)b.x=r[v+0],b.y=r[v+1],b.z=r[v+2],b.normalize().multiplyScalar(_),r[v+0]=b.x,r[v+1]=b.y,r[v+2]=b.z}function u(){let _=new D;for(let b=0;b<r.length;b+=3){_.x=r[b+0],_.y=r[b+1],_.z=r[b+2];let v=m(_)/2/Math.PI+.5,E=g(_)/Math.PI+.5;a.push(v,1-E)}p(),h()}function h(){for(let _=0;_<a.length;_+=6){let b=a[_+0],v=a[_+2],E=a[_+4],T=Math.max(b,v,E),y=Math.min(b,v,E);T>.9&&y<.1&&(b<.2&&(a[_+0]+=1),v<.2&&(a[_+2]+=1),E<.2&&(a[_+4]+=1))}}function d(_){r.push(_.x,_.y,_.z)}function f(_,b){let v=_*3;b.x=t[v+0],b.y=t[v+1],b.z=t[v+2]}function p(){let _=new D,b=new D,v=new D,E=new D,T=new dt,y=new dt,M=new dt;for(let U=0,P=0;U<r.length;U+=9,P+=6){_.set(r[U+0],r[U+1],r[U+2]),b.set(r[U+3],r[U+4],r[U+5]),v.set(r[U+6],r[U+7],r[U+8]),T.set(a[P+0],a[P+1]),y.set(a[P+2],a[P+3]),M.set(a[P+4],a[P+5]),E.copy(_).add(b).add(v).divideScalar(3);let C=m(E);x(T,P+0,_,C),x(y,P+2,b,C),x(M,P+4,v,C)}}function x(_,b,v,E){E<0&&_.x===1&&(a[b]=_.x-1),v.x===0&&v.z===0&&(a[b]=E/2/Math.PI+.5)}function m(_){return Math.atan2(_.z,-_.x)}function g(_){return Math.atan2(-_.y,Math.sqrt(_.x*_.x+_.z*_.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.vertices,t.indices,t.radius,t.detail)}};var Oi=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){qt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let i=this.getUtoTmapping(t);return this.getPoint(i,e)}getPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return e}getSpacedPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPointAt(i/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],i,s=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)i=this.getPoint(a/t),r+=i.distanceTo(s),e.push(r),s=i;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let i=this.getLengths(),s=0,r=i.length,a;e?a=e:a=t*i[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=i[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===a)return s/(r-1);let u=i[s],d=i[s+1]-u,f=(a-u)/d;return(s+f)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=e||(a.isVector2?new dt:new D);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){let i=this.getUtoTmapping(t);return this.getTangent(i,e)}computeFrenetFrames(t,e=!1){let i=new D,s=[],r=[],a=[],o=new D,l=new ge;for(let f=0;f<=t;f++){let p=f/t;s[f]=this.getTangentAt(p,new D)}r[0]=new D,a[0]=new D;let c=Number.MAX_VALUE,u=Math.abs(s[0].x),h=Math.abs(s[0].y),d=Math.abs(s[0].z);u<=c&&(c=u,i.set(1,0,0)),h<=c&&(c=h,i.set(0,1,0)),d<=c&&i.set(0,0,1),o.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();let p=Math.acos(ee(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,p))}a[f].crossVectors(s[f],r[f])}if(e===!0){let f=Math.acos(ee(r[0].dot(r[t]),-1,1));f/=t,s[0].dot(o.crossVectors(r[0],r[t]))>0&&(f=-f);for(let p=1;p<=t;p++)r[p].applyMatrix4(l.makeRotationAxis(s[p],f*p)),a[p].crossVectors(s[p],r[p])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}},Or=class extends Oi{constructor(t=0,e=0,i=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new dt){let i=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*u-f*h+this.aX,c=d*h+f*u+this.aY}return i.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Nl=class extends Or{constructor(t,e,i,s,r,a){super(t,e,i,i,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function zd(){let n=0,t=0,e=0,i=0;function s(r,a,o,l){n=r,t=o,e=-3*r+3*a-2*o-l,i=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,u,h){let d=(a-r)/c-(o-r)/(c+u)+(o-a)/u,f=(o-a)/u-(l-a)/(u+h)+(l-o)/h;d*=u,f*=u,s(a,o,d,f)},calc:function(r){let a=r*r,o=a*r;return n+t*r+e*a+i*o}}}var _f=new D,bf=new D,$h=new zd,Yh=new zd,Kh=new zd,kr=class extends Oi{constructor(t=[],e=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=i,this.tension=s}getPoint(t,e=new D){let i=e,s=this.points,r=s.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,u;this.closed||o>0?c=s[(o-1)%r]:(bf.subVectors(s[0],s[1]).add(s[0]),c=bf);let h=s[o%r],d=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(_f.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=_f),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,p=Math.pow(c.distanceToSquared(h),f),x=Math.pow(h.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(u),f);x<1e-4&&(x=1),p<1e-4&&(p=x),m<1e-4&&(m=x),$h.initNonuniformCatmullRom(c.x,h.x,d.x,u.x,p,x,m),Yh.initNonuniformCatmullRom(c.y,h.y,d.y,u.y,p,x,m),Kh.initNonuniformCatmullRom(c.z,h.z,d.z,u.z,p,x,m)}else this.curveType==="catmullrom"&&($h.initCatmullRom(c.x,h.x,d.x,u.x,this.tension),Yh.initCatmullRom(c.y,h.y,d.y,u.y,this.tension),Kh.initCatmullRom(c.z,h.z,d.z,u.z,this.tension));return i.set($h.calc(l),Yh.calc(l),Kh.calc(l)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(new D().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function Mf(n,t,e,i,s){let r=(i-t)*.5,a=(s-e)*.5,o=n*n,l=n*o;return(2*e-2*i+r+a)*l+(-3*e+3*i-2*r-a)*o+r*n+e}function og(n,t){let e=1-n;return e*e*t}function lg(n,t){return 2*(1-n)*n*t}function cg(n,t){return n*n*t}function Ea(n,t,e,i){return og(n,t)+lg(n,e)+cg(n,i)}function hg(n,t){let e=1-n;return e*e*e*t}function dg(n,t){let e=1-n;return 3*e*e*n*t}function ug(n,t){return 3*(1-n)*n*n*t}function fg(n,t){return n*n*n*t}function Ta(n,t,e,i,s){return hg(n,t)+dg(n,e)+ug(n,i)+fg(n,s)}var Wa=class extends Oi{constructor(t=new dt,e=new dt,i=new dt,s=new dt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=i,this.v3=s}getPoint(t,e=new dt){let i=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(Ta(t,s.x,r.x,a.x,o.x),Ta(t,s.y,r.y,a.y,o.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Ul=class extends Oi{constructor(t=new D,e=new D,i=new D,s=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=i,this.v3=s}getPoint(t,e=new D){let i=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(Ta(t,s.x,r.x,a.x,o.x),Ta(t,s.y,r.y,a.y,o.y),Ta(t,s.z,r.z,a.z,o.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Xa=class extends Oi{constructor(t=new dt,e=new dt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new dt){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new dt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Fl=class extends Oi{constructor(t=new D,e=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new D){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new D){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},qa=class extends Oi{constructor(t=new dt,e=new dt,i=new dt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new dt){let i=e,s=this.v0,r=this.v1,a=this.v2;return i.set(Ea(t,s.x,r.x,a.x),Ea(t,s.y,r.y,a.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},$a=class extends Oi{constructor(t=new D,e=new D,i=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new D){let i=e,s=this.v0,r=this.v1,a=this.v2;return i.set(Ea(t,s.x,r.x,a.x),Ea(t,s.y,r.y,a.y),Ea(t,s.z,r.z,a.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Ya=class extends Oi{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new dt){let i=e,s=this.points,r=(s.length-1)*t,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],u=s[a>s.length-2?s.length-1:a+1],h=s[a>s.length-3?s.length-1:a+2];return i.set(Mf(o,l.x,c.x,u.x,h.x),Mf(o,l.y,c.y,u.y,h.y)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(new dt().fromArray(s))}return this}},Ol=Object.freeze({__proto__:null,ArcCurve:Nl,CatmullRomCurve3:kr,CubicBezierCurve:Wa,CubicBezierCurve3:Ul,EllipseCurve:Or,LineCurve:Xa,LineCurve3:Fl,QuadraticBezierCurve:qa,QuadraticBezierCurve3:$a,SplineCurve:Ya}),kl=class extends Oi{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let i=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ol[i](e,t))}return this}getPoint(t,e){let i=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=i){let a=s[r]-i,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let i=0,s=this.curves.length;i<s;i++)e+=this.curves[i].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],i;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){let u=l[c];i&&i.equals(u)||(e.push(u),i=u)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this.cacheLengths=null,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,i=this.curves.length;e<i;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let s=t.curves[e];this.curves.push(new Ol[s.type]().fromJSON(s))}return this.cacheLengths=null,this}},Ka=class extends kl{constructor(t){super(),this.type="Path",this.currentPoint=new dt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,i=t.length;e<i;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let i=new Xa(this.currentPoint.clone(),new dt(t,e));return this.curves.push(i),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,i,s){let r=new qa(this.currentPoint.clone(),new dt(t,e),new dt(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(t,e,i,s,r,a){let o=new Wa(this.currentPoint.clone(),new dt(t,e),new dt(i,s),new dt(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),i=new Ya(e);return this.curves.push(i),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,i,s,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,i,s,r,a),this}absarc(t,e,i,s,r,a){return this.absellipse(t,e,i,i,s,r,a),this}ellipse(t,e,i,s,r,a,o,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(t+c,e+u,i,s,r,a,o,l),this}absellipse(t,e,i,s,r,a,o,l){let c=new Or(t,e,i,s,r,a,o,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},Gn=class extends Ka{constructor(t){super(t),this.uuid=Xn(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let i=0,s=this.holes.length;i<s;i++)e[i]=this.holes[i].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,i=this.holes.length;e<i;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let s=t.holes[e];this.holes.push(new Ka().fromJSON(s))}return this}};function pg(n,t,e=2){let i=t&&t.length,s=i?t[0]*e:n.length,r=vp(n,0,s,e,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(i&&(r=yg(n,t,r,e)),n.length>80*e){o=n[0],l=n[1];let u=o,h=l;for(let d=e;d<s;d+=e){let f=n[d],p=n[d+1];f<o&&(o=f),p<l&&(l=p),f>u&&(u=f),p>h&&(h=p)}c=Math.max(u-o,h-l),c=c!==0?32767/c:0}return Za(r,a,e,o,l,c,0),a}function vp(n,t,e,i,s){let r;if(s===Pg(n,t,e,i)>0)for(let a=t;a<e;a+=i)r=Sf(a/i|0,n[a],n[a+1],r);else for(let a=e-i;a>=t;a-=i)r=Sf(a/i|0,n[a],n[a+1],r);return r&&zr(r,r.next)&&(ja(r),r=r.next),r}function ks(n,t){if(!n)return n;t||(t=n);let e=n,i;do if(i=!1,!e.steiner&&(zr(e,e.next)||Be(e.prev,e,e.next)===0)){if(ja(e),e=t=e.prev,e===e.next)break;i=!0}else e=e.next;while(i||e!==t);return t}function Za(n,t,e,i,s,r,a){if(!n)return;!a&&r&&wg(n,i,s,r);let o=n;for(;n.prev!==n.next;){let l=n.prev,c=n.next;if(r?gg(n,i,s,r):mg(n)){t.push(l.i,n.i,c.i),ja(n),n=c.next,o=c.next;continue}if(n=c,n===o){a?a===1?(n=xg(ks(n),t),Za(n,t,e,i,s,r,2)):a===2&&vg(n,t,e,i,s,r):Za(ks(n),t,e,i,s,r,1);break}}}function mg(n){let t=n.prev,e=n,i=n.next;if(Be(t,e,i)>=0)return!1;let s=t.x,r=e.x,a=i.x,o=t.y,l=e.y,c=i.y,u=Math.min(s,r,a),h=Math.min(o,l,c),d=Math.max(s,r,a),f=Math.max(o,l,c),p=i.next;for(;p!==t;){if(p.x>=u&&p.x<=d&&p.y>=h&&p.y<=f&&ba(s,o,r,l,a,c,p.x,p.y)&&Be(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function gg(n,t,e,i){let s=n.prev,r=n,a=n.next;if(Be(s,r,a)>=0)return!1;let o=s.x,l=r.x,c=a.x,u=s.y,h=r.y,d=a.y,f=Math.min(o,l,c),p=Math.min(u,h,d),x=Math.max(o,l,c),m=Math.max(u,h,d),g=nd(f,p,t,e,i),_=nd(x,m,t,e,i),b=n.prevZ,v=n.nextZ;for(;b&&b.z>=g&&v&&v.z<=_;){if(b.x>=f&&b.x<=x&&b.y>=p&&b.y<=m&&b!==s&&b!==a&&ba(o,u,l,h,c,d,b.x,b.y)&&Be(b.prev,b,b.next)>=0||(b=b.prevZ,v.x>=f&&v.x<=x&&v.y>=p&&v.y<=m&&v!==s&&v!==a&&ba(o,u,l,h,c,d,v.x,v.y)&&Be(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;b&&b.z>=g;){if(b.x>=f&&b.x<=x&&b.y>=p&&b.y<=m&&b!==s&&b!==a&&ba(o,u,l,h,c,d,b.x,b.y)&&Be(b.prev,b,b.next)>=0)return!1;b=b.prevZ}for(;v&&v.z<=_;){if(v.x>=f&&v.x<=x&&v.y>=p&&v.y<=m&&v!==s&&v!==a&&ba(o,u,l,h,c,d,v.x,v.y)&&Be(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function xg(n,t){let e=n;do{let i=e.prev,s=e.next.next;!zr(i,s)&&_p(i,e,e.next,s)&&Ja(i,s)&&Ja(s,i)&&(t.push(i.i,e.i,s.i),ja(e),ja(e.next),e=n=s),e=e.next}while(e!==n);return ks(e)}function vg(n,t,e,i,s,r){let a=n;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Ag(a,o)){let l=bp(a,o);a=ks(a,a.next),l=ks(l,l.next),Za(a,t,e,i,s,r,0),Za(l,t,e,i,s,r,0);return}o=o.next}a=a.next}while(a!==n)}function yg(n,t,e,i){let s=[];for(let r=0,a=t.length;r<a;r++){let o=t[r]*i,l=r<a-1?t[r+1]*i:n.length,c=vp(n,o,l,i,!1);c===c.next&&(c.steiner=!0),s.push(Tg(c))}s.sort(_g);for(let r=0;r<s.length;r++)e=bg(s[r],e);return e}function _g(n,t){let e=n.x-t.x;if(e===0&&(e=n.y-t.y,e===0)){let i=(n.next.y-n.y)/(n.next.x-n.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=i-s}return e}function bg(n,t){let e=Mg(n,t);if(!e)return t;let i=bp(e,n);return ks(i,i.next),ks(e,e.next)}function Mg(n,t){let e=t,i=n.x,s=n.y,r=-1/0,a;if(zr(n,e))return e;do{if(zr(n,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){let h=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(h<=i&&h>r&&(r=h,a=e.x<e.next.x?e:e.next,h===i))return a}e=e.next}while(e!==t);if(!a)return null;let o=a,l=a.x,c=a.y,u=1/0;e=a;do{if(i>=e.x&&e.x>=l&&i!==e.x&&yp(s<c?i:r,s,l,c,s<c?r:i,s,e.x,e.y)){let h=Math.abs(s-e.y)/(i-e.x);Ja(e,n)&&(h<u||h===u&&(e.x>a.x||e.x===a.x&&Sg(a,e)))&&(a=e,u=h)}e=e.next}while(e!==o);return a}function Sg(n,t){return Be(n.prev,n,t.prev)<0&&Be(t.next,n,n.next)<0}function wg(n,t,e,i){let s=n;do s.z===0&&(s.z=nd(s.x,s.y,t,e,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,Eg(s)}function Eg(n){let t,e=1;do{let i=n,s;n=null;let r=null;for(t=0;i;){t++;let a=i,o=0;for(let c=0;c<e&&(o++,a=a.nextZ,!!a);c++);let l=e;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||i.z<=a.z)?(s=i,i=i.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;i=a}r.nextZ=null,e*=2}while(t>1);return n}function nd(n,t,e,i,s){return n=(n-e)*s|0,t=(t-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,n|t<<1}function Tg(n){let t=n,e=n;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==n);return e}function yp(n,t,e,i,s,r,a,o){return(s-a)*(t-o)>=(n-a)*(r-o)&&(n-a)*(i-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(s-a)*(i-o)}function ba(n,t,e,i,s,r,a,o){return!(n===a&&t===o)&&yp(n,t,e,i,s,r,a,o)}function Ag(n,t){return n.next.i!==t.i&&n.prev.i!==t.i&&!Rg(n,t)&&(Ja(n,t)&&Ja(t,n)&&Cg(n,t)&&(Be(n.prev,n,t.prev)||Be(n,t.prev,t))||zr(n,t)&&Be(n.prev,n,n.next)>0&&Be(t.prev,t,t.next)>0)}function Be(n,t,e){return(t.y-n.y)*(e.x-t.x)-(t.x-n.x)*(e.y-t.y)}function zr(n,t){return n.x===t.x&&n.y===t.y}function _p(n,t,e,i){let s=ul(Be(n,t,e)),r=ul(Be(n,t,i)),a=ul(Be(e,i,n)),o=ul(Be(e,i,t));return!!(s!==r&&a!==o||s===0&&dl(n,e,t)||r===0&&dl(n,i,t)||a===0&&dl(e,n,i)||o===0&&dl(e,t,i))}function dl(n,t,e){return t.x<=Math.max(n.x,e.x)&&t.x>=Math.min(n.x,e.x)&&t.y<=Math.max(n.y,e.y)&&t.y>=Math.min(n.y,e.y)}function ul(n){return n>0?1:n<0?-1:0}function Rg(n,t){let e=n;do{if(e.i!==n.i&&e.next.i!==n.i&&e.i!==t.i&&e.next.i!==t.i&&_p(e,e.next,n,t))return!0;e=e.next}while(e!==n);return!1}function Ja(n,t){return Be(n.prev,n,n.next)<0?Be(n,t,n.next)>=0&&Be(n,n.prev,t)>=0:Be(n,t,n.prev)<0||Be(n,n.next,t)<0}function Cg(n,t){let e=n,i=!1,s=(n.x+t.x)/2,r=(n.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(i=!i),e=e.next;while(e!==n);return i}function bp(n,t){let e=sd(n.i,n.x,n.y),i=sd(t.i,t.x,t.y),s=n.next,r=t.prev;return n.next=t,t.prev=n,e.next=s,s.prev=e,i.next=e,e.prev=i,r.next=i,i.prev=r,i}function Sf(n,t,e,i){let s=sd(n,t,e);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function ja(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function sd(n,t,e){return{i:n,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Pg(n,t,e,i){let s=0;for(let r=t,a=e-i;r<e;r+=i)s+=(n[a]-n[r])*(n[r+1]+n[a+1]),a=r;return s}var rd=class{static triangulate(t,e,i=2){return pg(t,e,i)}},xn=class n{static area(t){let e=t.length,i=0;for(let s=e-1,r=0;r<e;s=r++)i+=t[s].x*t[r].y-t[r].x*t[s].y;return i*.5}static isClockWise(t){return n.area(t)<0}static triangulateShape(t,e){let i=[],s=[],r=[];wf(t),Ef(i,t);let a=t.length;e.forEach(wf);for(let l=0;l<e.length;l++)s.push(a),a+=e[l].length,Ef(i,e[l]);let o=rd.triangulate(i,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function wf(n){let t=n.length;t>2&&n[t-1].equals(n[0])&&n.pop()}function Ef(n,t){for(let e=0;e<t.length;e++)n.push(t[e].x),n.push(t[e].y)}var Qa=class n extends ve{constructor(t=new Gn([new dt(.5,.5),new dt(-.5,.5),new dt(-.5,-.5),new dt(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let i=this,s=[],r=[];for(let o=0,l=t.length;o<l;o++){let c=t[o];a(c)}this.setAttribute("position",new Wt(s,3)),this.setAttribute("uv",new Wt(r,2)),this.computeVertexNormals();function a(o){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,u=e.steps!==void 0?e.steps:1,h=e.depth!==void 0?e.depth:1,d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,p=e.bevelSize!==void 0?e.bevelSize:f-.1,x=e.bevelOffset!==void 0?e.bevelOffset:0,m=e.bevelSegments!==void 0?e.bevelSegments:3,g=e.extrudePath,_=e.UVGenerator!==void 0?e.UVGenerator:Ig,b,v=!1,E,T,y,M;if(g){b=g.getSpacedPoints(u),v=!0,d=!1;let et=g.isCatmullRomCurve3?g.closed:!1;E=g.computeFrenetFrames(u,et),T=new D,y=new D,M=new D}d||(m=0,f=0,p=0,x=0);let U=o.extractPoints(c),P=U.shape,C=U.holes;if(!xn.isClockWise(P)){P=P.reverse();for(let et=0,ct=C.length;et<ct;et++){let ft=C[et];xn.isClockWise(ft)&&(C[et]=ft.reverse())}}function O(et){let ft=10000000000000001e-36,It=et[0];for(let Et=1;Et<=et.length;Et++){let ie=Et%et.length,Bt=et[ie],de=Bt.x-It.x,ue=Bt.y-It.y,ye=de*de+ue*ue,B=Math.max(Math.abs(Bt.x),Math.abs(Bt.y),Math.abs(It.x),Math.abs(It.y)),qe=ft*B*B;if(ye<=qe){et.splice(ie,1),Et--;continue}It=Bt}}O(P),C.forEach(O);let L=C.length,k=P;for(let et=0;et<L;et++){let ct=C[et];P=P.concat(ct)}function G(et,ct,ft){return ct||Yt("ExtrudeGeometry: vec does not exist"),et.clone().addScaledVector(ct,ft)}let V=P.length;function at(et,ct,ft){let It,Et,ie,Bt=et.x-ct.x,de=et.y-ct.y,ue=ft.x-et.x,ye=ft.y-et.y,B=Bt*Bt+de*de,qe=Bt*ye-de*ue;if(Math.abs(qe)>Number.EPSILON){let ce=Math.sqrt(B),Re=Math.sqrt(ue*ue+ye*ye),yt=ct.x-de/ce,He=ct.y+Bt/ce,Xt=ft.x-ye/Re,Zt=ft.y+ue/Re,I=((Xt-yt)*ye-(Zt-He)*ue)/(Bt*ye-de*ue);It=yt+Bt*I-et.x,Et=He+de*I-et.y;let S=It*It+Et*Et;if(S<=2)return new dt(It,Et);ie=Math.sqrt(S/2)}else{let ce=!1;Bt>Number.EPSILON?ue>Number.EPSILON&&(ce=!0):Bt<-Number.EPSILON?ue<-Number.EPSILON&&(ce=!0):Math.sign(de)===Math.sign(ye)&&(ce=!0),ce?(It=-de,Et=Bt,ie=Math.sqrt(B)):(It=Bt,Et=de,ie=Math.sqrt(B/2))}return new dt(It/ie,Et/ie)}let $=[];for(let et=0,ct=k.length,ft=ct-1,It=et+1;et<ct;et++,ft++,It++)ft===ct&&(ft=0),It===ct&&(It=0),$[et]=at(k[et],k[ft],k[It]);let nt=[],rt,Dt=$.concat();for(let et=0,ct=L;et<ct;et++){let ft=C[et];rt=[];for(let It=0,Et=ft.length,ie=Et-1,Bt=It+1;It<Et;It++,ie++,Bt++)ie===Et&&(ie=0),Bt===Et&&(Bt=0),rt[It]=at(ft[It],ft[ie],ft[Bt]);nt.push(rt),Dt=Dt.concat(rt)}let Gt;if(m===0)Gt=xn.triangulateShape(k,C);else{let et=[],ct=[];for(let ft=0;ft<m;ft++){let It=ft/m,Et=f*Math.cos(It*Math.PI/2),ie=p*Math.sin(It*Math.PI/2)+x;for(let Bt=0,de=k.length;Bt<de;Bt++){let ue=G(k[Bt],$[Bt],ie);Z(ue.x,ue.y,-Et),It===0&&et.push(ue)}for(let Bt=0,de=L;Bt<de;Bt++){let ue=C[Bt];rt=nt[Bt];let ye=[];for(let B=0,qe=ue.length;B<qe;B++){let ce=G(ue[B],rt[B],ie);Z(ce.x,ce.y,-Et),It===0&&ye.push(ce)}It===0&&ct.push(ye)}}Gt=xn.triangulateShape(et,ct)}let j=Gt.length,wt=p+x;for(let et=0;et<V;et++){let ct=d?G(P[et],Dt[et],wt):P[et];v?(y.copy(E.normals[0]).multiplyScalar(ct.x),T.copy(E.binormals[0]).multiplyScalar(ct.y),M.copy(b[0]).add(y).add(T),Z(M.x,M.y,M.z)):Z(ct.x,ct.y,0)}for(let et=1;et<=u;et++)for(let ct=0;ct<V;ct++){let ft=d?G(P[ct],Dt[ct],wt):P[ct];v?(y.copy(E.normals[et]).multiplyScalar(ft.x),T.copy(E.binormals[et]).multiplyScalar(ft.y),M.copy(b[et]).add(y).add(T),Z(M.x,M.y,M.z)):Z(ft.x,ft.y,h/u*et)}for(let et=m-1;et>=0;et--){let ct=et/m,ft=f*Math.cos(ct*Math.PI/2),It=p*Math.sin(ct*Math.PI/2)+x;for(let Et=0,ie=k.length;Et<ie;Et++){let Bt=G(k[Et],$[Et],It);Z(Bt.x,Bt.y,h+ft)}for(let Et=0,ie=C.length;Et<ie;Et++){let Bt=C[Et];rt=nt[Et];for(let de=0,ue=Bt.length;de<ue;de++){let ye=G(Bt[de],rt[de],It);v?Z(ye.x,ye.y+b[u-1].y,b[u-1].x+ft):Z(ye.x,ye.y,h+ft)}}}Nt(),Y();function Nt(){let et=s.length/3;if(d){let ct=0,ft=V*ct;for(let It=0;It<j;It++){let Et=Gt[It];At(Et[2]+ft,Et[1]+ft,Et[0]+ft)}ct=u+m*2,ft=V*ct;for(let It=0;It<j;It++){let Et=Gt[It];At(Et[0]+ft,Et[1]+ft,Et[2]+ft)}}else{for(let ct=0;ct<j;ct++){let ft=Gt[ct];At(ft[2],ft[1],ft[0])}for(let ct=0;ct<j;ct++){let ft=Gt[ct];At(ft[0]+V*u,ft[1]+V*u,ft[2]+V*u)}}i.addGroup(et,s.length/3-et,0)}function Y(){let et=s.length/3,ct=0;H(k,ct),ct+=k.length;for(let ft=0,It=C.length;ft<It;ft++){let Et=C[ft];H(Et,ct),ct+=Et.length}i.addGroup(et,s.length/3-et,1)}function H(et,ct){let ft=et.length;for(;--ft>=0;){let It=ft,Et=ft-1;Et<0&&(Et=et.length-1);for(let ie=0,Bt=u+m*2;ie<Bt;ie++){let de=V*ie,ue=V*(ie+1),ye=ct+It+de,B=ct+Et+de,qe=ct+Et+ue,ce=ct+It+ue;Pt(ye,B,qe,ce)}}}function Z(et,ct,ft){l.push(et),l.push(ct),l.push(ft)}function At(et,ct,ft){$t(et),$t(ct),$t(ft);let It=s.length/3,Et=_.generateTopUV(i,s,It-3,It-2,It-1);Jt(Et[0]),Jt(Et[1]),Jt(Et[2])}function Pt(et,ct,ft,It){$t(et),$t(ct),$t(It),$t(ct),$t(ft),$t(It);let Et=s.length/3,ie=_.generateSideWallUV(i,s,Et-6,Et-3,Et-2,Et-1);Jt(ie[0]),Jt(ie[1]),Jt(ie[3]),Jt(ie[1]),Jt(ie[2]),Jt(ie[3])}function $t(et){s.push(l[et*3+0]),s.push(l[et*3+1]),s.push(l[et*3+2])}function Jt(et){r.push(et.x),r.push(et.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,i=this.parameters.options;return Lg(e,i,t)}static fromJSON(t,e){let i=[];for(let r=0,a=t.shapes.length;r<a;r++){let o=e[t.shapes[r]];i.push(o)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new Ol[s.type]().fromJSON(s)),new n(i,t.options)}},Ig={generateTopUV:function(n,t,e,i,s){let r=t[e*3],a=t[e*3+1],o=t[i*3],l=t[i*3+1],c=t[s*3],u=t[s*3+1];return[new dt(r,a),new dt(o,l),new dt(c,u)]},generateSideWallUV:function(n,t,e,i,s,r){let a=t[e*3],o=t[e*3+1],l=t[e*3+2],c=t[i*3],u=t[i*3+1],h=t[i*3+2],d=t[s*3],f=t[s*3+1],p=t[s*3+2],x=t[r*3],m=t[r*3+1],g=t[r*3+2];return Math.abs(o-u)<Math.abs(a-c)?[new dt(a,1-l),new dt(c,1-h),new dt(d,1-p),new dt(x,1-g)]:[new dt(o,1-l),new dt(u,1-h),new dt(f,1-p),new dt(m,1-g)]}};function Lg(n,t,e){if(e.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){let r=n[i];e.shapes.push(r.uuid)}else e.shapes.push(n.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var zs=class n extends Dl{constructor(t=1,e=0){let i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new n(t.radius,t.detail)}};var Ai=class n extends ve{constructor(t=1,e=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(i),l=Math.floor(s),c=o+1,u=l+1,h=t/o,d=e/l,f=[],p=[],x=[],m=[];for(let g=0;g<u;g++){let _=g*d-a;for(let b=0;b<c;b++){let v=b*h-r;p.push(v,-_,0),x.push(0,0,1),m.push(b/o),m.push(1-g/l)}}for(let g=0;g<l;g++)for(let _=0;_<o;_++){let b=_+c*g,v=_+c*(g+1),E=_+1+c*(g+1),T=_+1+c*g;f.push(b,v,T),f.push(v,E,T)}this.setIndex(f),this.setAttribute("position",new Wt(p,3)),this.setAttribute("normal",new Wt(x,3)),this.setAttribute("uv",new Wt(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.width,t.height,t.widthSegments,t.heightSegments)}},to=class n extends ve{constructor(t=.5,e=1,i=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:a},i=Math.max(3,i),s=Math.max(1,s);let o=[],l=[],c=[],u=[],h=t,d=(e-t)/s,f=new D,p=new dt;for(let x=0;x<=s;x++){for(let m=0;m<=i;m++){let g=r+m/i*a;f.x=h*Math.cos(g),f.y=h*Math.sin(g),l.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/e+1)/2,p.y=(f.y/e+1)/2,u.push(p.x,p.y)}h+=d}for(let x=0;x<s;x++){let m=x*(i+1);for(let g=0;g<i;g++){let _=g+m,b=_,v=_+i+1,E=_+i+2,T=_+1;o.push(b,v,T),o.push(v,E,T)}}this.setIndex(o),this.setAttribute("position",new Wt(l,3)),this.setAttribute("normal",new Wt(c,3)),this.setAttribute("uv",new Wt(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},eo=class n extends ve{constructor(t=new Gn([new dt(0,.5),new dt(-.5,-.5),new dt(.5,-.5)]),e=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:e};let i=[],s=[],r=[],a=[],o=0,l=0;if(Array.isArray(t)===!1)c(t);else for(let u=0;u<t.length;u++)c(t[u]),this.addGroup(o,l,u),o+=l,l=0;this.setIndex(i),this.setAttribute("position",new Wt(s,3)),this.setAttribute("normal",new Wt(r,3)),this.setAttribute("uv",new Wt(a,2));function c(u){let h=s.length/3,d=u.extractPoints(e),f=d.shape,p=d.holes;xn.isClockWise(f)===!1&&(f=f.reverse());for(let m=0,g=p.length;m<g;m++){let _=p[m];xn.isClockWise(_)===!0&&(p[m]=_.reverse())}let x=xn.triangulateShape(f,p);for(let m=0,g=p.length;m<g;m++){let _=p[m];f=f.concat(_)}for(let m=0,g=f.length;m<g;m++){let _=f[m];s.push(_.x,_.y,0),r.push(0,0,1),a.push(_.x,_.y)}for(let m=0,g=x.length;m<g;m++){let _=x[m],b=_[0]+h,v=_[1]+h,E=_[2]+h;i.push(b,v,E),l+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes;return Dg(e,t)}static fromJSON(t,e){let i=[];for(let s=0,r=t.shapes.length;s<r;s++){let a=e[t.shapes[s]];i.push(a)}return new n(i,t.curveSegments)}};function Dg(n,t){if(t.shapes=[],Array.isArray(n))for(let e=0,i=n.length;e<i;e++){let s=n[e];t.shapes.push(s.uuid)}else t.shapes.push(n.uuid);return t}var xi=class n extends ve{constructor(t=1,e=32,i=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let l=Math.min(a+o,Math.PI),c=0,u=[],h=new D,d=new D,f=[],p=[],x=[],m=[];for(let g=0;g<=i;g++){let _=[],b=g/i,v=a+b*o,E=t*Math.cos(v),T=Math.sqrt(t*t-E*E),y=0;g===0&&a===0?y=.5/e:g===i&&l===Math.PI&&(y=-.5/e);for(let M=0;M<=e;M++){let U=M/e,P=s+U*r;h.x=-T*Math.cos(P),h.y=E,h.z=T*Math.sin(P),p.push(h.x,h.y,h.z),d.copy(h).normalize(),x.push(d.x,d.y,d.z),m.push(U+y,1-b),_.push(c++)}u.push(_)}for(let g=0;g<i;g++)for(let _=0;_<e;_++){let b=u[g][_+1],v=u[g][_],E=u[g+1][_],T=u[g+1][_+1];(g!==0||a>0)&&f.push(b,v,T),(g!==i-1||l<Math.PI)&&f.push(v,E,T)}this.setIndex(f),this.setAttribute("position",new Wt(p,3)),this.setAttribute("normal",new Wt(x,3)),this.setAttribute("uv",new Wt(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var hs=class n extends ve{constructor(t=1,e=.4,i=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},i=Math.floor(i),s=Math.floor(s);let l=[],c=[],u=[],h=[],d=new D,f=new D,p=new D;for(let x=0;x<=i;x++){let m=a+x/i*o;for(let g=0;g<=s;g++){let _=g/s*r;f.x=(t+e*Math.cos(m))*Math.cos(_),f.y=(t+e*Math.cos(m))*Math.sin(_),f.z=e*Math.sin(m),c.push(f.x,f.y,f.z),d.x=t*Math.cos(_),d.y=t*Math.sin(_),p.subVectors(f,d).normalize(),u.push(p.x,p.y,p.z),h.push(g/s),h.push(x/i)}}for(let x=1;x<=i;x++)for(let m=1;m<=s;m++){let g=(s+1)*x+m-1,_=(s+1)*(x-1)+m-1,b=(s+1)*(x-1)+m,v=(s+1)*x+m;l.push(g,_,v),l.push(_,b,v)}this.setIndex(l),this.setAttribute("position",new Wt(c,3)),this.setAttribute("normal",new Wt(u,3)),this.setAttribute("uv",new Wt(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};var io=class n extends ve{constructor(t=new $a(new D(-1,-1,0),new D(-1,1,0),new D(1,1,0)),e=64,i=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:i,radialSegments:s,closed:r};let a=t.computeFrenetFrames(e,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new D,l=new D,c=new dt,u=new D,h=[],d=[],f=[],p=[];x(),this.setIndex(p),this.setAttribute("position",new Wt(h,3)),this.setAttribute("normal",new Wt(d,3)),this.setAttribute("uv",new Wt(f,2));function x(){for(let b=0;b<e;b++)m(b);m(r===!1?e:0),_(),g()}function m(b){u=t.getPointAt(b/e,u);let v=a.normals[b],E=a.binormals[b];for(let T=0;T<=s;T++){let y=T/s*Math.PI*2,M=Math.sin(y),U=-Math.cos(y);l.x=U*v.x+M*E.x,l.y=U*v.y+M*E.y,l.z=U*v.z+M*E.z,l.normalize(),d.push(l.x,l.y,l.z),o.x=u.x+i*l.x,o.y=u.y+i*l.y,o.z=u.z+i*l.z,h.push(o.x,o.y,o.z)}}function g(){for(let b=1;b<=e;b++)for(let v=1;v<=s;v++){let E=(s+1)*(b-1)+(v-1),T=(s+1)*b+(v-1),y=(s+1)*b+v,M=(s+1)*(b-1)+v;p.push(E,T,M),p.push(T,y,M)}}function _(){for(let b=0;b<=e;b++)for(let v=0;v<=s;v++)c.x=b/e,c.y=v/s,f.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new n(new Ol[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}},no=class extends ve{constructor(t=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:t},t!==null){let e=[],i=new Set,s=new D,r=new D;if(t.index!==null){let a=t.attributes.position,o=t.index,l=t.groups;l.length===0&&(l=[{start:0,count:o.count,materialIndex:0}]);for(let c=0,u=l.length;c<u;++c){let h=l[c],d=h.start,f=h.count;for(let p=d,x=d+f;p<x;p+=3)for(let m=0;m<3;m++){let g=o.getX(p+m),_=o.getX(p+(m+1)%3);s.fromBufferAttribute(a,g),r.fromBufferAttribute(a,_),Tf(s,r,i)===!0&&(e.push(s.x,s.y,s.z),e.push(r.x,r.y,r.z))}}}else{let a=t.attributes.position;for(let o=0,l=a.count/3;o<l;o++)for(let c=0;c<3;c++){let u=3*o+c,h=3*o+(c+1)%3;s.fromBufferAttribute(a,u),r.fromBufferAttribute(a,h),Tf(s,r,i)===!0&&(e.push(s.x,s.y,s.z),e.push(r.x,r.y,r.z))}}this.setAttribute("position",new Wt(e,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}};function Tf(n,t,e){let i=`${n.x},${n.y},${n.z}-${t.x},${t.y},${t.z}`,s=`${t.x},${t.y},${t.z}-${n.x},${n.y},${n.z}`;return e.has(i)===!0||e.has(s)===!0?!1:(e.add(i),e.add(s),!0)}function $s(n){let t={};for(let e in n){t[e]={};for(let i in n[e]){let s=n[e][i];if(Af(s))s.isRenderTargetTexture?(qt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=s.clone();else if(Array.isArray(s))if(Af(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();t[e][i]=r}else t[e][i]=s.slice();else t[e][i]=s}}return t}function vi(n){let t={};for(let e=0;e<n.length;e++){let i=$s(n[e]);for(let s in i)t[s]=i[s]}return t}function Af(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function Ng(n){let t=[];for(let e=0;e<n.length;e++)t.push(n[e].clone());return t}function Bd(n){let t=n.getRenderTarget();return t===null?n.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:me.workingColorSpace}var yo={clone:$s,merge:vi},Ug=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Fg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ge=class extends zn{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ug,this.fragmentShader=Fg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=$s(t.uniforms),this.uniformsGroups=Ng(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let i in t.uniforms){let s=t.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=e[s.value]||null;break;case"c":this.uniforms[i].value=new Lt().setHex(s.value);break;case"v2":this.uniforms[i].value=new dt().fromArray(s.value);break;case"v3":this.uniforms[i].value=new D().fromArray(s.value);break;case"v4":this.uniforms[i].value=new _e().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Kt().fromArray(s.value);break;case"m4":this.uniforms[i].value=new ge().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},zl=class extends Ge{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Me=class extends zn{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Lt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Lt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Bc,this.normalScale=new dt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new nn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var Bl=class extends zn{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=rp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Hl=class extends zn{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function wr(n,t){return!n||n.constructor===t?n:typeof t.BYTES_PER_ELEMENT=="number"?new t(n):Array.prototype.slice.call(n)}function fl(n){return n!==void 0&&n.inTangents!==void 0&&n.outTangents!==void 0}var ds=class{constructor(t,e,i,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,s=e[i],r=e[i-1];i:{t:{let a;e:{n:if(!(t<s)){for(let o=i+2;;){if(s===void 0){if(t<r)break n;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(r=s,s=e[++i],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(i=2,r=o);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=e[--i-1],t>=r)break t}a=i,i=0;break e}break i}for(;i<a;){let o=i+a>>>1;t<e[o]?a=o:i=o+1}if(s=e[i],r=e[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=i[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Gl=class extends ds{constructor(t,e,i,s){super(t,e,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Qh,endingEnd:Qh}}intervalChanged_(t,e,i){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case td:r=t,o=2*e-i;break;case ed:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case td:a=t,l=2*i-e;break;case ed:a=1,l=i+s[1]-s[0];break;default:a=t-1,l=e}let c=(i-e)*.5,u=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-i),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(i-e)/(s-e),x=p*p,m=x*p,g=-d*m+2*d*x-d*p,_=(1+d)*m+(-1.5-2*d)*x+(-.5+d)*p+1,b=(-1-f)*m+(1.5+f)*x+.5*p,v=f*m-f*x;for(let E=0;E!==o;++E)r[E]=g*a[u+E]+_*a[c+E]+b*a[l+E]+v*a[h+E];return r}},Vl=class extends ds{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=(i-e)/(s-e),h=1-u;for(let d=0;d!==o;++d)r[d]=a[c+d]*h+a[l+d]*u;return r}},Wl=class extends ds{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t){return this.copySampleValue_(t-1)}},Xl=class extends ds{interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=this.inTangents,h=this.outTangents;if(!u||!h){let p=(i-e)/(s-e),x=1-p;for(let m=0;m!==o;++m)r[m]=a[c+m]*x+a[l+m]*p;return r}let d=o*2,f=t-1;for(let p=0;p!==o;++p){let x=a[c+p],m=a[l+p],g=f*d+p*2,_=h[g],b=h[g+1],v=t*d+p*2,E=u[v],T=u[v+1],y=kg(i,e,_,E,s);r[p]=Mp(y,x,b,T,m)}return r}};function Mp(n,t,e,i,s){let r=1-n;return r*r*r*t+3*r*r*n*e+3*r*n*n*i+n*n*n*s}function Og(n,t,e,i,s){let r=1-n;return 3*r*r*(e-t)+6*r*n*(i-e)+3*n*n*(s-i)}function kg(n,t,e,i,s){let r=(n-t)/(s-t);for(let a=0;a<8;a++){let o=Mp(r,t,e,i,s)-n;if(Math.abs(o)<1e-10)break;let l=Og(r,t,e,i,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var ki=class{constructor(t,e,i,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=wr(e,this.TimeBufferType),this.values=wr(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:wr(t.times,Array),values:wr(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(i.interpolation=s),fl(t.settings)&&(i.settings={inTangents:wr(t.settings.inTangents,Array),outTangents:wr(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new Wl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Vl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Gl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new Xl(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case Aa:e=this.InterpolantFactoryMethodDiscrete;break;case Al:e=this.InterpolantFactoryMethodLinear;break;case xl:e=this.InterpolantFactoryMethodSmooth;break;case jh:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return qt("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Aa;case this.InterpolantFactoryMethodLinear:return Al;case this.InterpolantFactoryMethodSmooth:return xl;case this.InterpolantFactoryMethodBezier:return jh}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]+=t;fl(this.settings)&&(Rf(this.settings.inTangents,t),Rf(this.settings.outTangents,t))}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]*=t;fl(this.settings)&&(Cf(this.settings.inTangents,t),Cf(this.settings.outTangents,t))}return this}trim(t,e){let i=this.times,s=i.length,r=0,a=s-1;for(;r!==s&&i[r]<t;)++r;for(;a!==-1&&i[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Yt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,s=this.values,r=i.length;r===0&&(Yt("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){Yt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){Yt("KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(s!==void 0&&Tm(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Yt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===xl,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],u=t[o+1];if(c!==u&&(o!==1||c!==t[0]))if(s)l=!0;else{let h=o*i,d=h-i,f=h+i;for(let p=0;p!==i;++p){let x=e[h+p];if(x!==e[d+p]||x!==e[f+p]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let h=o*i,d=a*i;for(let f=0;f!==i;++f)e[d+f]=e[h+f]}++a}}if(r>0){t[a]=t[r];for(let o=r*i,l=a*i,c=0;c!==i;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,s=new i(this.name,t,e);return s.createInterpolant=this.createInterpolant,fl(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Rf(n,t){for(let e=0,i=n.length;e!==i;e+=2)n[e]+=t}function Cf(n,t){for(let e=0,i=n.length;e!==i;e+=2)n[e]*=t}ki.prototype.ValueTypeName="";ki.prototype.TimeBufferType=Float32Array;ki.prototype.ValueBufferType=Float32Array;ki.prototype.DefaultInterpolation=Al;var us=class extends ki{constructor(t,e,i){super(t,e,i)}};us.prototype.ValueTypeName="bool";us.prototype.ValueBufferType=Array;us.prototype.DefaultInterpolation=Aa;us.prototype.InterpolantFactoryMethodLinear=void 0;us.prototype.InterpolantFactoryMethodSmooth=void 0;var ql=class extends ki{constructor(t,e,i,s){super(t,e,i,s)}};ql.prototype.ValueTypeName="color";var $l=class extends ki{constructor(t,e,i,s){super(t,e,i,s)}};$l.prototype.ValueTypeName="number";var Yl=class extends ds{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(i-e)/(s-e),c=t*o;for(let u=c+o;c!==u;c+=4)si.slerpFlat(r,0,a,c-o,a,c,l);return r}},so=class extends ki{constructor(t,e,i,s){super(t,e,i,s)}InterpolantFactoryMethodLinear(t){return new Yl(this.times,this.values,this.getValueSize(),t)}};so.prototype.ValueTypeName="quaternion";so.prototype.InterpolantFactoryMethodSmooth=void 0;var fs=class extends ki{constructor(t,e,i){super(t,e,i)}};fs.prototype.ValueTypeName="string";fs.prototype.ValueBufferType=Array;fs.prototype.DefaultInterpolation=Aa;fs.prototype.InterpolantFactoryMethodLinear=void 0;fs.prototype.InterpolantFactoryMethodSmooth=void 0;var Kl=class extends ki{constructor(t,e,i,s){super(t,e,i,s)}};Kl.prototype.ValueTypeName="vector";var Zl=class{constructor(t,e,i){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=c.length;h<d;h+=2){let f=c[h],p=c[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return p}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Sp=new Zl,Jl=class{constructor(t){this.manager=t!==void 0?t:Sp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(s,r){i.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}setPriority(t){return this.priority=t,this}setCache(t){return this.cache=t,this}abort(){return this}};Jl.DEFAULT_MATERIAL_NAME="__DEFAULT";var Br=class extends Ze{static registerNode(t){this.prototype._lightNode=t}constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Lt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Bs=class extends Br{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ze.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Lt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Zh=new ge,Pf=new D,If=new D,ro=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new dt(512,512),this.mapType=Ii,this.map=null,this.mapPass=null,this.matrix=new ge,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ls,this._frameExtents=new dt(1,1),this._viewportCount=1,this._viewports=[new _e(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Pf.setFromMatrixPosition(t.matrixWorld),e.position.copy(Pf),If.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(If),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,s){Zh.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(Zh,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;t.coordinateSystem===Ir||t.reversedDepth?e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),e.multiply(Zh)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.mapType=t.mapType,this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.mapType=this.mapType,t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},pl=new D,ml=new si,gn=new D,ao=class extends Ze{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ge,this.projectionMatrix=new ge,this.projectionMatrixInverse=new ge,this.coordinateSystem=Vi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(pl,ml,gn),gn.x===1&&gn.y===1&&gn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(pl,ml,gn.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose(pl,ml,gn),gn.x===1&&gn.y===1&&gn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(pl,ml,gn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},as=new D,Lf=new dt,Df=new dt,ii=class extends ao{constructor(t=50,e=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Dr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Sa*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Dr*2*Math.atan(Math.tan(Sa*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){as.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(as.x,as.y).multiplyScalar(-t/as.z),as.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(as.x,as.y).multiplyScalar(-t/as.z)}getViewSize(t,e){return this.getViewBounds(t,Lf,Df),e.subVectors(Df,Lf)}setViewOffset(t,e,i,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Sa*.5*this.fov)/this.zoom,i=2*e,s=this.aspect*i,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*i/c,s*=a.width/l,i*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var ad=class extends ro{constructor(){super(new ii(90,1,.5,500)),this.isPointLightShadow=!0}},oo=class extends Br{constructor(t,e,i=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new ad}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},Vn=class extends ao{constructor(t=-1,e=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-t,a=i+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},od=class extends ro{constructor(){super(new Vn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ps=class extends Br{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ze.DEFAULT_UP),this.updateMatrix(),this.target=new Ze,this.shadow=new od}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var lo=class extends ve{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){let t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}};var Er=-90,Tr=1,Hr=class extends Ze{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new ii(Er,Tr,t,e);s.layers=this.layers,this.add(s);let r=new ii(Er,Tr,t,e);r.layers=this.layers,this.add(r);let a=new ii(Er,Tr,t,e);a.layers=this.layers,this.add(a);let o=new ii(Er,Tr,t,e);o.layers=this.layers,this.add(o);let l=new ii(Er,Tr,t,e);l.layers=this.layers,this.add(l);let c=new ii(Er,Tr,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,s,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===Vi)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Ir)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,u]=this.children,h=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),p=t.xr.enabled;t.xr.enabled=!1;let x=i.texture.mipmapsAutoUpdate;i.texture.mipmapsAutoUpdate=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(i,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(i,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(i,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(i,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(i,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),i.texture.mipmapsAutoUpdate=x,t.setRenderTarget(i,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,u),t.setRenderTarget(h,d,f),t.xr.enabled=p,i.texture.needsPMREMUpdate=!0}},jl=class extends ii{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t,this.perCameraFrustumCulled=!1}};var Hd="\\[\\]\\.:\\/",zg=new RegExp("["+Hd+"]","g"),Gd="[^"+Hd+"]",Bg="[^"+Hd.replace("\\.","")+"]",Hg=/((?:WC+[\/:])*)/.source.replace("WC",Gd),Gg=/(WCOD+)?/.source.replace("WCOD",Bg),Vg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Gd),Wg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Gd),Xg=new RegExp("^"+Hg+Gg+Vg+Wg+"$"),qg=["material","materials","bones","map"],ld=class{constructor(t,e,i){let s=i||Le.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},Le=class n{constructor(t,e,i){this.path=e,this.parsedPath=i||n.parseTrackName(e),this.node=n.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new n.Composite(t,e,i):new n(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(zg,"")}static parseTrackName(t){let e=Xg.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);qg.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=i(o.children);if(l)return l}return null},s=i(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)t[e++]=i[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=n.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){qt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=e.objectIndex;switch(i){case"materials":if(!t.material){Yt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Yt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Yt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===c){c=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Yt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Yt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Yt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){Yt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[s];if(a===void 0){let c=e.nodeName;Yt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Yt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Yt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Le.Composite=ld;Le.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Le.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Le.prototype.GetterByBindingType=[Le.prototype._getValue_direct,Le.prototype._getValue_array,Le.prototype._getValue_arrayElement,Le.prototype._getValue_toArray];Le.prototype.SetterByBindingTypeAndVersioning=[[Le.prototype._setValue_direct,Le.prototype._setValue_direct_setNeedsUpdate,Le.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Le.prototype._setValue_array,Le.prototype._setValue_array_setNeedsUpdate,Le.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Le.prototype._setValue_arrayElement,Le.prototype._setValue_arrayElement_setNeedsUpdate,Le.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Le.prototype._setValue_fromArray,Le.prototype._setValue_fromArray_setNeedsUpdate,Le.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var sM=new Float32Array(1);var ms=class extends Il{constructor(t,e,i=1){super(t,e),this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}clone(t){let e=super.clone(t);return e.meshPerAttribute=this.meshPerAttribute,e}toJSON(t){let e=super.toJSON(t);return e.isInstancedInterleavedBuffer=!0,e.meshPerAttribute=this.meshPerAttribute,e}};var Yd=class Yd{constructor(t,e,i,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=i,r[3]=s,this}};Yd.prototype.isMatrix2=!0;var cd=Yd;var Nf=new D,gl=new D,Ar=new D,Rr=new D,Jh=new D,$g=new D,Yg=new D,co=class{constructor(t=new D,e=new D){this.start=t,this.end=e}set(t,e){return this.start.copy(t),this.end.copy(e),this}copy(t){return this.start.copy(t.start),this.end.copy(t.end),this}getCenter(t){return t.addVectors(this.start,this.end).multiplyScalar(.5)}delta(t){return t.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(t,e){return this.delta(e).multiplyScalar(t).add(this.start)}closestPointToPointParameter(t,e){Nf.subVectors(t,this.start),gl.subVectors(this.end,this.start);let i=gl.dot(gl);if(i===0)return 0;let r=gl.dot(Nf)/i;return e&&(r=ee(r,0,1)),r}closestPointToPoint(t,e,i){let s=this.closestPointToPointParameter(t,e);return this.delta(i).multiplyScalar(s).add(this.start)}distanceSqToLine3(t,e=$g,i=Yg){let s=10000000000000001e-32,r,a,o=this.start,l=t.start,c=this.end,u=t.end;Ar.subVectors(c,o),Rr.subVectors(u,l),Jh.subVectors(o,l);let h=Ar.dot(Ar),d=Rr.dot(Rr),f=Rr.dot(Jh);if(h<=s&&d<=s)return e.copy(o),i.copy(l),e.distanceToSquared(i);if(h<=s)r=0,a=f/d,a=ee(a,0,1);else{let p=Ar.dot(Jh);if(d<=s)a=0,r=ee(-p/h,0,1);else{let x=Ar.dot(Rr),m=h*d-x*x;m!==0?r=ee((x*f-p*d)/m,0,1):r=0,a=(x*r+f)/d,a<0?(a=0,r=ee(-p/h,0,1)):a>1&&(a=1,r=ee((x-p)/h,0,1))}}return e.copy(o).addScaledVector(Ar,r),i.copy(l).addScaledVector(Rr,a),e.distanceToSquared(i)}applyMatrix4(t){return this.start.applyMatrix4(t),this.end.applyMatrix4(t),this}equals(t){return t.start.equals(this.start)&&t.end.equals(this.end)}clone(){return new this.constructor().copy(this)}};function Vd(n,t,e,i){let s=Kg(i);switch(e){case Ad:return n*t;case ac:return n*t/s.components*s.byteLength;case oc:return n*t/s.components*s.byteLength;case xs:return n*t*2/s.components*s.byteLength;case lc:return n*t*2/s.components*s.byteLength;case Rd:return n*t*3/s.components*s.byteLength;case Ri:return n*t*4/s.components*s.byteLength;case cc:return n*t*4/s.components*s.byteLength;case fo:case po:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case mo:case go:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case dc:case fc:return Math.max(n,16)*Math.max(t,8)/4;case hc:case uc:return Math.max(n,8)*Math.max(t,8)/2;case pc:case mc:case xc:case vc:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case gc:case xo:case yc:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case _c:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case bc:return Math.floor((n+4)/5)*Math.floor((t+3)/4)*16;case Mc:return Math.floor((n+4)/5)*Math.floor((t+4)/5)*16;case Sc:return Math.floor((n+5)/6)*Math.floor((t+4)/5)*16;case wc:return Math.floor((n+5)/6)*Math.floor((t+5)/6)*16;case Ec:return Math.floor((n+7)/8)*Math.floor((t+4)/5)*16;case Tc:return Math.floor((n+7)/8)*Math.floor((t+5)/6)*16;case Ac:return Math.floor((n+7)/8)*Math.floor((t+7)/8)*16;case Rc:return Math.floor((n+9)/10)*Math.floor((t+4)/5)*16;case Cc:return Math.floor((n+9)/10)*Math.floor((t+5)/6)*16;case Pc:return Math.floor((n+9)/10)*Math.floor((t+7)/8)*16;case Ic:return Math.floor((n+9)/10)*Math.floor((t+9)/10)*16;case Lc:return Math.floor((n+11)/12)*Math.floor((t+9)/10)*16;case Dc:return Math.floor((n+11)/12)*Math.floor((t+11)/12)*16;case Nc:case Uc:case Fc:return Math.ceil(n/4)*Math.ceil(t/4)*16;case Oc:case kc:return Math.ceil(n/4)*Math.ceil(t/4)*8;case vo:case zc:return Math.ceil(n/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Kg(n){switch(n){case Ii:case Sd:return{byteLength:1,components:1};case Xr:case wd:case Li:return{byteLength:2,components:1};case sc:case rc:return{byteLength:2,components:4};case rn:case nc:case qi:return{byteLength:4,components:1};case Ed:case Td:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window<"u"&&(window.__THREE__?qt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");function Xp(){let n=null,t=!1,e=null,i=null;function s(r,a){i=n.requestAnimationFrame(s),e(r,a)}return{start:function(){t!==!0&&e!==null&&n!==null&&(i=n.requestAnimationFrame(s),t=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){n=r}}}function Jg(n){let t=new WeakMap;function e(o,l){let c=o.array,u=o.usage,h=c.byteLength,d=n.createBuffer();n.bindBuffer(l,d),n.bufferData(l,c,u),o.onUploadCallback();let f;if(c instanceof Float32Array)f=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=n.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=n.SHORT;else if(c instanceof Uint32Array)f=n.UNSIGNED_INT;else if(c instanceof Int32Array)f=n.INT;else if(c instanceof Int8Array)f=n.BYTE;else if(c instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:h}}function i(o,l,c){let u=l.array,h=l.updateRanges;if(n.bindBuffer(c,o),h.length===0)n.bufferSubData(c,0,u);else{h.sort((f,p)=>f.start-p.start);let d=0;for(let f=1;f<h.length;f++){let p=h[d],x=h[f];x.start<=p.start+p.count+1?p.count=Math.max(p.count,x.start+x.count-p.start):(++d,h[d]=x)}h.length=d+1;for(let f=0,p=h.length;f<p;f++){let x=h[f];n.bufferSubData(c,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(n.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=t.get(o);(!u||u.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var jg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Qg=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,tx=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,ex=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ix=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,nx=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,sx=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,rx=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,ax=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,ox=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,lx=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,cx=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,hx=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,dx=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,ux=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,fx=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,px=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,mx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,gx=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,xx=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,vx=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,yx=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,_x=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,bx=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Mx=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Sx=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,wx=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Ex=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Tx=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Ax="gl_FragColor = linearToOutputTexel( gl_FragColor );",Rx=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Cx=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Px=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Ix=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Lx=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Dx=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Nx=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Ux=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Fx=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Ox=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,kx=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,zx=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Bx=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Hx=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Gx=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Vx=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Wx=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Xx=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,qx=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,$x=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Yx=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Kx=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Zx=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Jx=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,jx=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Qx=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,t1=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,e1=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,i1=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,n1=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,s1=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,r1=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,a1=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,o1=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,l1=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,c1=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,h1=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,d1=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,u1=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,f1=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,p1=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,m1=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,g1=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,x1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,v1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,y1=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,_1=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,b1=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,M1=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,S1=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,w1=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,E1=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,T1=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,A1=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,R1=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,C1=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,P1=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,I1=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,L1=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,D1=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,N1=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,U1=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,F1=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,O1=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,k1=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,z1=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,B1=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,H1=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,G1=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,V1=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,W1=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,X1=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,q1=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,$1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Y1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,K1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Z1=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,J1=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,j1=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Q1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,tv=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ev=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,iv=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,nv=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,sv=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,rv=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,av=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,ov=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,lv=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cv=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,hv=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,dv=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,uv=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fv=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,pv=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mv=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,gv=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xv=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,vv=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,yv=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,_v=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bv=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Mv=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sv=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,wv=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ev=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Tv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Av=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Rv=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Cv=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Pv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,oe={alphahash_fragment:jg,alphahash_pars_fragment:Qg,alphamap_fragment:tx,alphamap_pars_fragment:ex,alphatest_fragment:ix,alphatest_pars_fragment:nx,aomap_fragment:sx,aomap_pars_fragment:rx,batching_pars_vertex:ax,batching_vertex:ox,begin_vertex:lx,beginnormal_vertex:cx,bsdfs:hx,iridescence_fragment:dx,bumpmap_pars_fragment:ux,clipping_planes_fragment:fx,clipping_planes_pars_fragment:px,clipping_planes_pars_vertex:mx,clipping_planes_vertex:gx,color_fragment:xx,color_pars_fragment:vx,color_pars_vertex:yx,color_vertex:_x,common:bx,defaultnormal_vertex:Mx,displacementmap_pars_vertex:Sx,displacementmap_vertex:wx,emissivemap_fragment:Ex,emissivemap_pars_fragment:Tx,colorspace_fragment:Ax,colorspace_pars_fragment:Rx,envmap_fragment:Cx,envmap_common_pars_fragment:Px,envmap_pars_fragment:Ix,envmap_pars_vertex:Lx,envmap_physical_pars_fragment:Vx,envmap_vertex:Dx,fog_vertex:Nx,fog_pars_vertex:Ux,fog_fragment:Fx,fog_pars_fragment:Ox,gradientmap_pars_fragment:kx,lightmap_pars_fragment:zx,lights_lambert_fragment:Bx,lights_lambert_pars_fragment:Hx,lights_pars_begin:Gx,lights_toon_fragment:Wx,lights_toon_pars_fragment:Xx,lights_phong_fragment:qx,lights_phong_pars_fragment:$x,lights_physical_fragment:Yx,lights_physical_pars_fragment:Kx,lights_fragment_begin:Zx,lights_fragment_maps:Jx,lights_fragment_end:jx,lightprobes_pars_fragment:Qx,logdepthbuf_fragment:t1,logdepthbuf_pars_fragment:e1,logdepthbuf_pars_vertex:i1,logdepthbuf_vertex:n1,map_fragment:s1,map_pars_fragment:r1,map_particle_fragment:a1,map_particle_pars_fragment:o1,metalnessmap_fragment:l1,metalnessmap_pars_fragment:c1,morphinstance_vertex:h1,morphcolor_vertex:d1,morphnormal_vertex:u1,morphtarget_pars_vertex:f1,morphtarget_vertex:p1,normal_fragment_begin:m1,normal_fragment_maps:g1,normal_pars_fragment:x1,normal_pars_vertex:v1,normal_vertex:y1,normalmap_pars_fragment:_1,clearcoat_normal_fragment_begin:b1,clearcoat_normal_fragment_maps:M1,clearcoat_pars_fragment:S1,iridescence_pars_fragment:w1,opaque_fragment:E1,packing:T1,premultiplied_alpha_fragment:A1,project_vertex:R1,dithering_fragment:C1,dithering_pars_fragment:P1,roughnessmap_fragment:I1,roughnessmap_pars_fragment:L1,shadowmap_pars_fragment:D1,shadowmap_pars_vertex:N1,shadowmap_vertex:U1,shadowmask_pars_fragment:F1,skinbase_vertex:O1,skinning_pars_vertex:k1,skinning_vertex:z1,skinnormal_vertex:B1,specularmap_fragment:H1,specularmap_pars_fragment:G1,tonemapping_fragment:V1,tonemapping_pars_fragment:W1,transmission_fragment:X1,transmission_pars_fragment:q1,uv_pars_fragment:$1,uv_pars_vertex:Y1,uv_vertex:K1,worldpos_vertex:Z1,background_vert:J1,background_frag:j1,backgroundCube_vert:Q1,backgroundCube_frag:tv,cube_vert:ev,cube_frag:iv,depth_vert:nv,depth_frag:sv,distance_vert:rv,distance_frag:av,equirect_vert:ov,equirect_frag:lv,linedashed_vert:cv,linedashed_frag:hv,meshbasic_vert:dv,meshbasic_frag:uv,meshlambert_vert:fv,meshlambert_frag:pv,meshmatcap_vert:mv,meshmatcap_frag:gv,meshnormal_vert:xv,meshnormal_frag:vv,meshphong_vert:yv,meshphong_frag:_v,meshphysical_vert:bv,meshphysical_frag:Mv,meshtoon_vert:Sv,meshtoon_frag:wv,points_vert:Ev,points_frag:Tv,shadow_vert:Av,shadow_frag:Rv,sprite_vert:Cv,sprite_frag:Pv},St={common:{diffuse:{value:new Lt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Kt},alphaMap:{value:null},alphaMapTransform:{value:new Kt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Kt}},envmap:{envMap:{value:null},envMapRotation:{value:new Kt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Kt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Kt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Kt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Kt},normalScale:{value:new dt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Kt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Kt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Kt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Kt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Lt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Lt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Kt},alphaTest:{value:0},uvTransform:{value:new Kt}},sprite:{diffuse:{value:new Lt(16777215)},opacity:{value:1},center:{value:new dt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Kt},alphaMap:{value:null},alphaMapTransform:{value:new Kt},alphaTest:{value:0}}},Ci={basic:{uniforms:vi([St.common,St.specularmap,St.envmap,St.aomap,St.lightmap,St.fog]),vertexShader:oe.meshbasic_vert,fragmentShader:oe.meshbasic_frag},lambert:{uniforms:vi([St.common,St.specularmap,St.envmap,St.aomap,St.lightmap,St.emissivemap,St.bumpmap,St.normalmap,St.displacementmap,St.fog,St.lights,{emissive:{value:new Lt(0)},envMapIntensity:{value:1}}]),vertexShader:oe.meshlambert_vert,fragmentShader:oe.meshlambert_frag},phong:{uniforms:vi([St.common,St.specularmap,St.envmap,St.aomap,St.lightmap,St.emissivemap,St.bumpmap,St.normalmap,St.displacementmap,St.fog,St.lights,{emissive:{value:new Lt(0)},specular:{value:new Lt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:oe.meshphong_vert,fragmentShader:oe.meshphong_frag},standard:{uniforms:vi([St.common,St.envmap,St.aomap,St.lightmap,St.emissivemap,St.bumpmap,St.normalmap,St.displacementmap,St.roughnessmap,St.metalnessmap,St.fog,St.lights,{emissive:{value:new Lt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:oe.meshphysical_vert,fragmentShader:oe.meshphysical_frag},toon:{uniforms:vi([St.common,St.aomap,St.lightmap,St.emissivemap,St.bumpmap,St.normalmap,St.displacementmap,St.gradientmap,St.fog,St.lights,{emissive:{value:new Lt(0)}}]),vertexShader:oe.meshtoon_vert,fragmentShader:oe.meshtoon_frag},matcap:{uniforms:vi([St.common,St.bumpmap,St.normalmap,St.displacementmap,St.fog,{matcap:{value:null}}]),vertexShader:oe.meshmatcap_vert,fragmentShader:oe.meshmatcap_frag},points:{uniforms:vi([St.points,St.fog]),vertexShader:oe.points_vert,fragmentShader:oe.points_frag},dashed:{uniforms:vi([St.common,St.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:oe.linedashed_vert,fragmentShader:oe.linedashed_frag},depth:{uniforms:vi([St.common,St.displacementmap]),vertexShader:oe.depth_vert,fragmentShader:oe.depth_frag},normal:{uniforms:vi([St.common,St.bumpmap,St.normalmap,St.displacementmap,{opacity:{value:1}}]),vertexShader:oe.meshnormal_vert,fragmentShader:oe.meshnormal_frag},sprite:{uniforms:vi([St.sprite,St.fog]),vertexShader:oe.sprite_vert,fragmentShader:oe.sprite_frag},background:{uniforms:{uvTransform:{value:new Kt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:oe.background_vert,fragmentShader:oe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Kt}},vertexShader:oe.backgroundCube_vert,fragmentShader:oe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:oe.cube_vert,fragmentShader:oe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:oe.equirect_vert,fragmentShader:oe.equirect_frag},distance:{uniforms:vi([St.common,St.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:oe.distance_vert,fragmentShader:oe.distance_frag},shadow:{uniforms:vi([St.lights,St.fog,{color:{value:new Lt(0)},opacity:{value:1}}]),vertexShader:oe.shadow_vert,fragmentShader:oe.shadow_frag}};Ci.physical={uniforms:vi([Ci.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Kt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Kt},clearcoatNormalScale:{value:new dt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Kt},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Kt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Kt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Kt},sheen:{value:0},sheenColor:{value:new Lt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Kt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Kt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Kt},transmissionSamplerSize:{value:new dt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Kt},attenuationDistance:{value:0},attenuationColor:{value:new Lt(0)},specularColor:{value:new Lt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Kt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Kt},anisotropyVector:{value:new dt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Kt}}]),vertexShader:oe.meshphysical_vert,fragmentShader:oe.meshphysical_frag};var Gc={r:0,b:0,g:0},Iv=new ge,qp=new Kt;qp.set(-1,0,0,0,1,0,0,0,1);function Lv(n,t,e,i,s,r){let a=new Lt(0),o=s===!0?0:1,l,c,u=null,h=0,d=null;function f(_){let b=_.isScene===!0?_.background:null;if(b&&b.isTexture){let v=_.backgroundBlurriness>0;b=t.get(b,v)}return b}function p(_){let b=!1,v=f(_);v===null?m(a,o):v&&v.isColor&&(m(v,1),b=!0);let E=n.xr.getEnvironmentBlendMode();E==="additive"?e.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(n.autoClear||b)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function x(_,b){let v=f(b);v&&v.isCubeTexture?(c===void 0&&(c=new Rt(new cs(1,1,1),new Ge({name:"BackgroundCubeMaterial",uniforms:$s(Ci.backgroundCube.uniforms),vertexShader:Ci.backgroundCube.vertexShader,fragmentShader:Ci.backgroundCube.fragmentShader,side:li,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,T,y){this.matrixWorld.copyPosition(y.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Iv.makeRotationFromEuler(b.backgroundRotation)).transpose(),v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(qp),c.material.toneMapped=me.getTransfer(v.colorSpace)!==we,(u!==v||h!==v.version||d!==n.toneMapping)&&(c.material.needsUpdate=!0,u=v,h=v.version,d=n.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new Rt(new Ai(2,2),new Ge({name:"BackgroundMaterial",uniforms:$s(Ci.background.uniforms),vertexShader:Ci.background.vertexShader,fragmentShader:Ci.background.fragmentShader,side:gs,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.toneMapped=me.getTransfer(v.colorSpace)!==we,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(u!==v||h!==v.version||d!==n.toneMapping)&&(l.material.needsUpdate=!0,u=v,h=v.version,d=n.toneMapping),l.layers.enableAll(),_.unshift(l,l.geometry,l.material,0,0,null))}function m(_,b){_.getRGB(Gc,Bd(n)),e.buffers.color.setClear(Gc.r,Gc.g,Gc.b,b,r)}function g(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(_,b=1){a.set(_),o=b,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(_){o=_,m(a,o)},render:p,addToRenderList:x,dispose:g}}function Dv(n,t){let e=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=d(null),r=s,a=!1;function o(C,N,O,L,k){let G=!1,V=h(C,L,O,N);r!==V&&(r=V,c(r.object)),G=f(C,L,O,k),G&&p(C,L,O,k),k!==null&&t.update(k,n.ELEMENT_ARRAY_BUFFER),(G||a)&&(a=!1,v(C,N,O,L),k!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(k).buffer))}function l(){return n.createVertexArray()}function c(C){return n.bindVertexArray(C)}function u(C){return n.deleteVertexArray(C)}function h(C,N,O,L){let k=L.wireframe===!0,G=i[N.id];G===void 0&&(G={},i[N.id]=G);let V=C.isInstancedMesh===!0?C.id:0,at=G[V];at===void 0&&(at={},G[V]=at);let $=at[O.id];$===void 0&&($={},at[O.id]=$);let nt=$[k];return nt===void 0&&(nt=d(l()),$[k]=nt),nt}function d(C){let N=[],O=[],L=[];for(let k=0;k<e;k++)N[k]=0,O[k]=0,L[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:N,enabledAttributes:O,attributeDivisors:L,object:C,attributes:{},index:null}}function f(C,N,O,L){let k=r.attributes,G=N.attributes,V=0,at=O.getAttributes();for(let $ in at)if(at[$].location>=0){let rt=k[$],Dt=G[$];if(Dt===void 0&&($==="instanceMatrix"&&C.instanceMatrix&&(Dt=C.instanceMatrix),$==="instanceColor"&&C.instanceColor&&(Dt=C.instanceColor)),rt===void 0||rt.attribute!==Dt||Dt&&rt.data!==Dt.data)return!0;V++}return r.attributesNum!==V||r.index!==L}function p(C,N,O,L){let k={},G=N.attributes,V=0,at=O.getAttributes();for(let $ in at)if(at[$].location>=0){let rt=G[$];rt===void 0&&($==="instanceMatrix"&&C.instanceMatrix&&(rt=C.instanceMatrix),$==="instanceColor"&&C.instanceColor&&(rt=C.instanceColor));let Dt={};Dt.attribute=rt,rt&&rt.data&&(Dt.data=rt.data),k[$]=Dt,V++}r.attributes=k,r.attributesNum=V,r.index=L}function x(){let C=r.newAttributes;for(let N=0,O=C.length;N<O;N++)C[N]=0}function m(C){g(C,0)}function g(C,N){let O=r.newAttributes,L=r.enabledAttributes,k=r.attributeDivisors;O[C]=1,L[C]===0&&(n.enableVertexAttribArray(C),L[C]=1),k[C]!==N&&(n.vertexAttribDivisor(C,N),k[C]=N)}function _(){let C=r.newAttributes,N=r.enabledAttributes;for(let O=0,L=N.length;O<L;O++)N[O]!==C[O]&&(n.disableVertexAttribArray(O),N[O]=0)}function b(C,N,O,L,k,G,V){V===!0?n.vertexAttribIPointer(C,N,O,k,G):n.vertexAttribPointer(C,N,O,L,k,G)}function v(C,N,O,L){x();let k=L.attributes,G=O.getAttributes(),V=N.defaultAttributeValues;for(let at in G){let $=G[at];if($.location>=0){let nt=k[at];if(nt===void 0&&(at==="instanceMatrix"&&C.instanceMatrix&&(nt=C.instanceMatrix),at==="instanceColor"&&C.instanceColor&&(nt=C.instanceColor)),nt!==void 0){let rt=nt.normalized,Dt=nt.itemSize,Gt=t.get(nt);if(Gt===void 0)continue;let j=Gt.buffer,wt=Gt.type,Nt=Gt.bytesPerElement,Y=wt===n.INT||wt===n.UNSIGNED_INT||nt.gpuType===nc;if(nt.isInterleavedBufferAttribute){let H=nt.data,Z=H.isInterleavedBuffer===!0?H.stride:H.itemSize,At=nt.offset;if(H.isInstancedInterleavedBuffer||H.isInstancedBufferAttribute){for(let Pt=0;Pt<$.locationSize;Pt++)g($.location+Pt,H.meshPerAttribute);C.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=H.meshPerAttribute*H.count)}else for(let Pt=0;Pt<$.locationSize;Pt++)m($.location+Pt);n.bindBuffer(n.ARRAY_BUFFER,j);for(let Pt=0;Pt<$.locationSize;Pt++)b($.location+Pt,Dt/$.locationSize,wt,rt,Z*Nt,(At+Dt/$.locationSize*Pt)*Nt,Y)}else{if(nt.isInstancedBufferAttribute){for(let H=0;H<$.locationSize;H++)g($.location+H,nt.meshPerAttribute);C.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=nt.meshPerAttribute*nt.count)}else for(let H=0;H<$.locationSize;H++)m($.location+H);n.bindBuffer(n.ARRAY_BUFFER,j);for(let H=0;H<$.locationSize;H++)b($.location+H,Dt/$.locationSize,wt,rt,Dt*Nt,Dt/$.locationSize*H*Nt,Y)}}else if(V!==void 0){let rt=V[at];if(rt!==void 0)switch(rt.length){case 2:n.vertexAttrib2fv($.location,rt);break;case 3:n.vertexAttrib3fv($.location,rt);break;case 4:n.vertexAttrib4fv($.location,rt);break;default:n.vertexAttrib1fv($.location,rt)}}}}_()}function E(){U();for(let C in i){let N=i[C];for(let O in N){let L=N[O];for(let k in L){let G=L[k];for(let V in G)u(G[V].object),delete G[V];delete L[k]}}delete i[C]}}function T(C){if(i[C.id]===void 0)return;let N=i[C.id];for(let O in N){let L=N[O];for(let k in L){let G=L[k];for(let V in G)u(G[V].object),delete G[V];delete L[k]}}delete i[C.id]}function y(C){for(let N in i){let O=i[N];for(let L in O){let k=O[L];if(k[C.id]===void 0)continue;let G=k[C.id];for(let V in G)u(G[V].object),delete G[V];delete k[C.id]}}}function M(C){for(let N in i){let O=i[N],L=C.isInstancedMesh===!0?C.id:0,k=O[L];if(k!==void 0){for(let G in k){let V=k[G];for(let at in V)u(V[at].object),delete V[at];delete k[G]}delete O[L],Object.keys(O).length===0&&delete i[N]}}}function U(){P(),a=!0,r!==s&&(r=s,c(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:U,resetDefaultState:P,dispose:E,releaseStatesOfGeometry:T,releaseStatesOfObject:M,releaseStatesOfProgram:y,initAttributes:x,enableAttribute:m,disableUnusedAttributes:_}}function Nv(n,t,e){let i;function s(l){i=l}function r(l,c){n.drawArrays(i,l,c),e.update(c,i,1)}function a(l,c,u){u!==0&&(n.drawArraysInstanced(i,l,c,u),e.update(c,i,u))}function o(l,c,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,u);let d=0;for(let f=0;f<u;f++)d+=c[f];e.update(d,i,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Uv(n,t,e,i){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let y=t.get("EXT_texture_filter_anisotropic");s=n.getParameter(y.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(y){return!(y!==Ri&&i.convert(y)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(y){let M=y===Li&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(y!==Ii&&y!==qi&&!M&&i.convert(y)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE))}function l(y){if(y==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";y="mediump"}return y==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",u=l(c);u!==c&&(qt("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let h=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),d=e.logarithmicDepthBuffer===!0&&h===!1;e.reversedDepthBuffer===!0&&h===!1&&qt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),e.logarithmicDepthBuffer===!0&&h===!0&&qt("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),p=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),g=n.getParameter(n.MAX_VERTEX_ATTRIBS),_=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),b=n.getParameter(n.MAX_VARYING_VECTORS),v=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),E=n.getParameter(n.MAX_SAMPLES),T=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:h,maxTextures:f,maxVertexTextures:p,maxTextureSize:x,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:_,maxVaryings:b,maxFragmentUniforms:v,maxSamples:E,samples:T}}function Fv(n){let t=this,e=null,i=0,s=!1,r=!1,a=new tn,o=new Kt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let f=h.length!==0||d||i!==0||s;return s=d,i=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){e=u(h,d,0)},this.setState=function(h,d,f){let p=h.clippingPlanes,x=h.clipIntersection,m=h.clipShadows,g=n.get(h);if(!s||p===null||p.length===0||r&&!m)r?u(null):c();else{let _=r?0:i,b=_*4,v=g.clippingState||null;l.value=v,v=u(p,d,b,f);for(let E=0;E!==b;++E)v[E]=e[E];g.clippingState=v,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function u(h,d,f,p){let x=h!==null?h.length:0,m=null;if(x!==0){if(m=l.value,p!==!0||m===null){let g=f+x*4,_=d.matrixWorldInverse;o.getNormalMatrix(_),(m===null||m.length<g)&&(m=new Float32Array(g));for(let b=0,v=f;b!==x;++b,v+=4)a.copy(h[b]).applyMatrix4(_,o),a.normal.toArray(m,v),m[v+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,m}}var Mo=class extends ai{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new Ha(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new cs(5,5,5),r=new Ge({name:"CubemapFromEquirect",uniforms:$s(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:li,blending:Gs});r.uniforms.tEquirect.value=e;let a=new Rt(s,r),o=e.minFilter;return e.minFilter===Xi&&(e.minFilter=Ke),new Hr(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,i=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,i,s);t.setRenderTarget(r)}},wp=256,Ov=3,kv=20,$p=256,Yp=16,zv=3,Bv=new D,Hv=new Lt,Wc=class n{constructor(t){this._renderer=t,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Hr(1,10,null),this._boxMesh=new Rt(new cs(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(t,e=0,i=.1,s=100,r={}){let{size:a=256,position:o=Bv}=r,l=this._renderer;this._setSize(a);let c=this._allocateTarget(),u=this._getSourceTarget(!0);e>0&&(u.texture.mipmapsAutoUpdate=!1);let h=l.autoClear,d=l.autoClearColor,f=l.autoClearDepth,p=l.autoClearStencil,x=t.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,x===null&&(t.background=l.getClearColor(Hv));let m=new Hr(i,s,u);return m.position.copy(o),m.update(l,t),l.autoClear=h,l.autoClearColor=d,l.autoClearDepth=f,l.autoClearStencil=p,t.background=x,e>0&&(u.texture.mipmapsAutoUpdate=!0,this._blur(c,e)),this._applyPMREM(c),c}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ap(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Tp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(t,e){return e>0?1-Math.sqrt(1-t/e):0}_setSize(t){this._cubeSize=Math.max(wp,Ud(t))}_fromTexture(t,e){t.mapping===Xs||t.mapping===Wr?this._setSize(t.image.length===0?wp:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4);let i=e||this._allocateTarget();return this._textureToCubemap(t),this._applyPMREM(i),i}_allocateTarget(){let t=this._cubeSize,e=Ep(t,!1,!1),i=Math.log2(t)-Ov;for(let s=0;s<=i;s++)e.texture.mipmaps.push({width:t>>s,height:t>>s});return e.texture.name="PMREM",e.texture.isPMREMTexture=!0,e}_getSourceTarget(t=!1){let e=this._cubeSize,i=this._sourceTarget;return(i===null||i.width!==e||t&&i.depthBuffer===!1)&&(i!==null&&i.dispose(),this._sourceTarget=Ep(e,!0,t)),this._sourceTarget}_compileMaterial(t){this._boxMesh.material=t,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(t,e,i){let s=this._boxMesh,r=this._cubeCamera;s.material=i,r.renderTarget=t,r.activeMipmapLevel=e;let a=t.width>>e;t.viewport.set(0,0,a,a),r.update(this._renderer,s),t.viewport.set(0,0,t.width,t.height)}_textureToCubemap(t){let e;t.mapping===Xs||t.mapping===Wr?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ap()),e=this._cubemapMaterial,e.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Tp()),e=this._equirectMaterial),e.uniforms.envMap.value=t,this._renderCube(this._getSourceTarget(),0,e)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=Gv(),this._integrationMaterial=Vv());let e=this._cubeSize,i=t.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(e/Yp);for(let a=0;a<=i;a++){let o=n.lodToRoughness(a,i);if(a>i-zv)r.roughness.value=o,this._renderCube(t,a,this._integrationMaterial);else{let l=o>0?Math.log2(e)+.5*Math.log2(6/($p*Math.pow(o,4)))+.5:0;s.roughness.value=o,s.lodBias.value=l,this._renderCube(t,a,this._ggxMaterial)}}}_blur(t,e){this._blurMaterial===null&&(this._blurMaterial=Wv());let i=this._blurMaterial,s=i.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(e,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(t,0,i),s.envMap.value=t.texture,this._renderCube(r,0,i)}};function Ep(n,t,e){return new Mo(n,{minFilter:Xi,generateMipmaps:t,type:Li,colorSpace:Ra,depthBuffer:e})}function So(n,t,e){return new Ge({name:n,uniforms:t,vertexShader:oe.cube_vert,fragmentShader:e,side:li,blending:Gs,depthTest:!1,depthWrite:!1})}function Gv(){return So("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${$p}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Vv(){return So("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Yp}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Wv(){return So("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${kv}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function Tp(){return So("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function Ap(){return So("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function Xv(n){let t=new WeakMap,e=new WeakMap,i=null;function s(d,f=!1){return d==null?null:f?a(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===tc||f===ec)if(t.has(d)){let p=t.get(d).texture;return o(p,d.mapping)}else{let p=d.image;if(p&&p.height>0){let x=new Mo(p.height);return x.fromEquirectangularTexture(n,d),t.set(d,x),d.addEventListener("dispose",c),o(x.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture&&d.isPMREMTexture!==!0){let f=d.mapping,p=f===tc||f===ec,x=f===Xs||f===Wr;if(p||x){let m=e.get(d),g=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==g)return i===null&&(i=new Wc(n)),m=p?i.fromEquirectangular(d,m):i.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,e.set(d,m),m.texture;if(m!==void 0)return m.texture;{let _=d.image;return p&&_&&_.height>0||x&&_&&l(_)?(i===null&&(i=new Wc(n)),m=p?i.fromEquirectangular(d):i.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,e.set(d,m),d.addEventListener("dispose",u),m.texture):null}}}return d}function o(d,f){return f===tc?d.mapping=Xs:f===ec&&(d.mapping=Wr),d}function l(d){let f=0,p=6;for(let x=0;x<p;x++)d[x]!==void 0&&f++;return f===p}function c(d){let f=d.target;f.removeEventListener("dispose",c);let p=t.get(f);p!==void 0&&(t.delete(f),p.dispose())}function u(d){let f=d.target;f.removeEventListener("dispose",u);let p=e.get(f);p!==void 0&&(e.delete(f),p.dispose())}function h(){t=new WeakMap,e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:h}}function qv(n){let t={};function e(i){if(t[i]!==void 0)return t[i];let s=n.getExtension(i);return t[i]=s,s}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let s=e(i);return s===null&&Ma("WebGLRenderer: "+i+" extension not supported."),s}}}function $v(n,t,e,i){let s={},r=new WeakMap,a=new FinalizationRegistry(p=>delete s[p]);function o(p){l(p.target)}function l(p){p.index!==null&&t.remove(p.index);for(let m in p.attributes)t.remove(p.attributes[m]);p.removeEventListener("dispose",o),delete s[p.id],a.unregister(p);let x=r.get(p);x&&(t.remove(x),r.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,e.memory.geometries--}function c(p,x){return s[x.id]!==void 0||(x.addEventListener("dispose",o),s[x.id]=new WeakRef(x),a.register(x,x.id,x),e.memory.geometries++),x}function u(p){let x=p.attributes;for(let m in x)t.update(x[m],n.ARRAY_BUFFER)}function h(p){let x=p.index,m=p.attributes.position,g=0;if(m===void 0)return;let _=x!==null?x.array.length:m.array.length/3-1,b=m.count>=65535?Fa:Ua,v=new b(Math.ceil(_/3)*6,1),E=v.array;if(x!==null){let y=x.array;g=x.version;for(let M=0,U=0;M<_;M+=3){let P=y[M+0],C=y[M+1],N=y[M+2];E[U++]=P,E[U++]=C,E[U++]=C,E[U++]=N,E[U++]=N,E[U++]=P}}else{g=m.version;for(let y=0,M=0;y<_;y+=3){let U=y+0,P=y+1,C=y+2;E[M++]=U,E[M++]=P,E[M++]=P,E[M++]=C,E[M++]=C,E[M++]=U}}v.version=g;let T=r.get(p);T&&t.remove(T),r.set(p,v)}function d(p){let x=r.get(p);if(x){let m=p.index;m!==null&&x.version<m.version&&h(p)}else h(p);return r.get(p)}function f(){for(let p in s){let x=s[p].deref();x!==void 0&&l(x)}}return{get:c,update:u,getWireframeAttribute:d,dispose:f}}function Yv(n,t,e){let i;function s(h){i=h}let r,a;function o(h){r=h.type,a=h.bytesPerElement}function l(h,d){n.drawElements(i,d,r,h*a),e.update(d,i,1)}function c(h,d,f){f!==0&&(n.drawElementsInstanced(i,d,r,h*a,f),e.update(d,i,f))}function u(h,d,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,h,0,f);let x=0;for(let m=0;m<f;m++)x+=d[m];e.update(x,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Kv(n){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(e.calls++,a){case n.TRIANGLES:e.triangles+=o*(r/3);break;case n.LINES:e.lines+=o*(r/2);break;case n.LINE_STRIP:e.lines+=o*(r-1);break;case n.LINE_LOOP:e.lines+=o*r;break;case n.POINTS:e.points+=o*r;break;default:Yt("WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:i}}function Zv(n,t,e){let i=new WeakMap,s=new _e;function r(a,o,l){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0,d=i.get(o);if(d===void 0||d.count!==h){let U=function(){y.dispose(),i.delete(o),o.removeEventListener("dispose",U)};d!==void 0&&d.texture.dispose();let f=o.morphAttributes.position!==void 0,p=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],_=o.morphAttributes.color||[],b=0;f===!0&&(b=1),p===!0&&(b=2),x===!0&&(b=3);let v=o.attributes.position.count*b,E=1;v>t.maxTextureSize&&(E=Math.ceil(v/t.maxTextureSize),v=t.maxTextureSize);let T=new Float32Array(v*E*4*h),y=new La(T,v,E,h);y.type=qi,y.needsUpdate=!0;let M=b*4;for(let P=0;P<h;P++){let C=m[P],N=g[P],O=_[P],L=v*E*4*P;for(let k=0;k<C.count;k++){let G=k*M;f===!0&&(s.fromBufferAttribute(C,k),T[L+G+0]=s.x,T[L+G+1]=s.y,T[L+G+2]=s.z,T[L+G+3]=0),p===!0&&(s.fromBufferAttribute(N,k),T[L+G+4]=s.x,T[L+G+5]=s.y,T[L+G+6]=s.z,T[L+G+7]=0),x===!0&&(s.fromBufferAttribute(O,k),T[L+G+8]=s.x,T[L+G+9]=s.y,T[L+G+10]=s.z,T[L+G+11]=O.itemSize===4?s.w:1)}}d={count:h,texture:y,size:new dt(v,E)},i.set(o,d),o.addEventListener("dispose",U)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,e);else{let f=0;for(let x=0;x<c.length;x++)f+=c[x];let p=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(n,"morphTargetBaseInfluence",p),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(n,"morphTargetsTextureSize",d.size)}return{update:r}}function Jv(n,t,e,i,s){let r=new WeakMap;function a(c){let u=s.render.frame,h=c.geometry,d=t.get(c,h);if(r.get(d)!==u&&(t.update(d),r.set(d,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(e.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,n.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return d}function o(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),i.releaseStatesOfObject(u),e.remove(u.instanceMatrix),u.instanceColor!==null&&e.remove(u.instanceColor)}return{update:a,dispose:o}}var jv={[gd]:"LINEAR_TONE_MAPPING",[xd]:"REINHARD_TONE_MAPPING",[vd]:"CINEON_TONE_MAPPING",[yd]:"ACES_FILMIC_TONE_MAPPING",[bd]:"AGX_TONE_MAPPING",[Ws]:"NEUTRAL_TONE_MAPPING",[_d]:"CUSTOM_TONE_MAPPING"};function Qv(n,t,e,i,s,r){let a=new ai(t,e,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=null,u=new ve;u.setAttribute("position",new Wt([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new Wt([0,2,0,0,2,0],2));let h=new zl({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new Rt(u,h),f=new Vn(-1,1,1,-1,0,1),p=null,x=null,m=!1,g,_=null,b=[],v=!1;this.setSize=function(E,T){a.setSize(E,T),o!==null&&o.setSize(E,T),l!==null&&l.setSize(E,T);for(let y=0;y<b.length;y++){let M=b[y];M.setSize&&M.setSize(E,T)}},this.setEffects=function(E){b=E,v=b.length>0&&b[0].isRenderPass===!0;let T=a.width,y=a.height;b.length>0&&o===null&&(o=new ai(T,y,{type:Li,depthBuffer:!1,stencilBuffer:!1}),l=new ai(T,y,{type:Li,depthBuffer:!1,stencilBuffer:!1}));let M=s===!0&&b.some(U=>U.needsDepthTexture===!0);M!==(a.depthTexture!==null)&&(M===!0&&c===null&&(c=new Hn(T,y),r===!0&&(c.format=Wn,c.type=qs)),a.dispose(),a.depthTexture=M?c:null,a.resolveDepthBuffer=M,a.storeMultisampledDepthBuffer=M);for(let U=0;U<b.length;U++){let P=b[U];P.setSize&&P.setSize(T,y),M&&P.needsDepthTexture===!0&&P.setDepthTexture&&P.setDepthTexture(c)}},this.begin=function(E,T){if(m||E.toneMapping===_n&&b.length===0)return!1;if(_=T,T!==null){let y=T.width,M=T.height;(a.width!==y||a.height!==M)&&this.setSize(y,M)}return v===!1&&E.setRenderTarget(a),g=E.toneMapping,E.toneMapping=_n,!0},this.hasRenderPass=function(){return v},this.end=function(E,T){E.toneMapping=g,m=!0;let y=a,M=o;for(let U=0;U<b.length;U++){let P=b[U];P.enabled!==!1&&(P.render(E,M,y,T),P.needsSwap!==!1&&(y=M,M=M===o?l:o))}if(p!==E.outputColorSpace||x!==E.toneMapping){p=E.outputColorSpace,x=E.toneMapping,h.defines={},me.getTransfer(p)===we&&(h.defines.SRGB_TRANSFER="");let U=jv[x];U&&(h.defines[U]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=y.texture,E.setRenderTarget(_),E.render(d,f),_=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),u.dispose(),h.dispose()}}var Kp=new Ti,Zp=new Hn(1,1),Jp=new Ga(1),jp=new La,Qp=new Pl,t0=new Ha,Rp=[],Cp=[],Pp=new Float32Array(16),Ip=new Float32Array(9),Lp=new Float32Array(4);function Yr(n,t,e){let i=n[0];if(i<=0||i>0)return n;let s=t*e,r=Rp[s];if(r===void 0&&(r=new Float32Array(s),Rp[s]=r),t!==0){i.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,n[a].toArray(r,o)}return r}function Je(n,t){if(n.length!==t.length)return!1;for(let e=0,i=n.length;e<i;e++)if(n[e]!==t[e])return!1;return!0}function je(n,t){for(let e=0,i=t.length;e<i;e++)n[e]=t[e]}function Xc(n,t){let e=Cp[t];e===void 0&&(e=new Int32Array(t),Cp[t]=e);for(let i=0;i!==t;++i)e[i]=n.allocateTextureUnit();return e}function ty(n,t){let e=this.cache;e[0]!==t&&(n.uniform1f(this.addr,t),e[0]=t)}function ey(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Je(e,t))return;n.uniform2fv(this.addr,t),je(e,t)}}function iy(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(n.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Je(e,t))return;n.uniform3fv(this.addr,t),je(e,t)}}function ny(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Je(e,t))return;n.uniform4fv(this.addr,t),je(e,t)}}function sy(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(Je(e,t))return;n.uniformMatrix2fv(this.addr,!1,t),je(e,t)}else{if(Je(e,i))return;Lp.set(i),n.uniformMatrix2fv(this.addr,!1,Lp),je(e,i)}}function ry(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(Je(e,t))return;n.uniformMatrix3fv(this.addr,!1,t),je(e,t)}else{if(Je(e,i))return;Ip.set(i),n.uniformMatrix3fv(this.addr,!1,Ip),je(e,i)}}function ay(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(Je(e,t))return;n.uniformMatrix4fv(this.addr,!1,t),je(e,t)}else{if(Je(e,i))return;Pp.set(i),n.uniformMatrix4fv(this.addr,!1,Pp),je(e,i)}}function oy(n,t){let e=this.cache;e[0]!==t&&(n.uniform1i(this.addr,t),e[0]=t)}function ly(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Je(e,t))return;n.uniform2iv(this.addr,t),je(e,t)}}function cy(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Je(e,t))return;n.uniform3iv(this.addr,t),je(e,t)}}function hy(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Je(e,t))return;n.uniform4iv(this.addr,t),je(e,t)}}function dy(n,t){let e=this.cache;e[0]!==t&&(n.uniform1ui(this.addr,t),e[0]=t)}function uy(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Je(e,t))return;n.uniform2uiv(this.addr,t),je(e,t)}}function fy(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Je(e,t))return;n.uniform3uiv(this.addr,t),je(e,t)}}function py(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Je(e,t))return;n.uniform4uiv(this.addr,t),je(e,t)}}function qc(n){return n.version===0&&(n.compareFunction=Id,n.needsUpdate=!0),n}function my(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?r=qc(Zp):r=Kp,e.setTexture2D(t||r,s)}function gy(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture3D(t||Qp,s)}function xy(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_CUBE_SHADOW?r=qc(Jp):r=t0,e.setTextureCube(t||r,s)}function vy(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture2DArray(t||jp,s)}function yy(n){switch(n){case 5126:return ty;case 35664:return ey;case 35665:return iy;case 35666:return ny;case 35674:return sy;case 35675:return ry;case 35676:return ay;case 5124:case 35670:return oy;case 35667:case 35671:return ly;case 35668:case 35672:return cy;case 35669:case 35673:return hy;case 5125:return dy;case 36294:return uy;case 36295:return fy;case 36296:return py;case 35678:case 36198:case 36298:case 36306:case 35682:return my;case 35679:case 36299:case 36307:return gy;case 35680:case 36300:case 36308:case 36293:return xy;case 36289:case 36303:case 36311:case 36292:return vy}}function _y(n,t){n.uniform1fv(this.addr,t)}function by(n,t){let e=Yr(t,this.size,2);n.uniform2fv(this.addr,e)}function My(n,t){let e=Yr(t,this.size,3);n.uniform3fv(this.addr,e)}function Sy(n,t){let e=Yr(t,this.size,4);n.uniform4fv(this.addr,e)}function wy(n,t){let e=Yr(t,this.size,4);n.uniformMatrix2fv(this.addr,!1,e)}function Ey(n,t){let e=Yr(t,this.size,9);n.uniformMatrix3fv(this.addr,!1,e)}function Ty(n,t){let e=Yr(t,this.size,16);n.uniformMatrix4fv(this.addr,!1,e)}function Ay(n,t){n.uniform1iv(this.addr,t)}function Ry(n,t){n.uniform2iv(this.addr,t)}function Cy(n,t){n.uniform3iv(this.addr,t)}function Py(n,t){n.uniform4iv(this.addr,t)}function Iy(n,t){n.uniform1uiv(this.addr,t)}function Ly(n,t){n.uniform2uiv(this.addr,t)}function Dy(n,t){n.uniform3uiv(this.addr,t)}function Ny(n,t){n.uniform4uiv(this.addr,t)}function Uy(n,t,e){let i=this.cache,s=t.length,r=Xc(e,s);Je(i,r)||(n.uniform1iv(this.addr,r),je(i,r));let a;this.type===n.SAMPLER_2D_SHADOW?a=qc(Zp):a=Kp;for(let o=0;o!==s;++o)e.setTexture2D(t[o]||a,r[o])}function Fy(n,t,e){let i=this.cache,s=t.length,r=Xc(e,s);Je(i,r)||(n.uniform1iv(this.addr,r),je(i,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||Qp,r[a])}function Oy(n,t,e){let i=this.cache,s=t.length,r=Xc(e,s);Je(i,r)||(n.uniform1iv(this.addr,r),je(i,r));let a;this.type===n.SAMPLER_CUBE_SHADOW?a=qc(Jp):a=t0;for(let o=0;o!==s;++o)e.setTextureCube(t[o]||a,r[o])}function ky(n,t,e){let i=this.cache,s=t.length,r=Xc(e,s);Je(i,r)||(n.uniform1iv(this.addr,r),je(i,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||jp,r[a])}function zy(n){switch(n){case 5126:return _y;case 35664:return by;case 35665:return My;case 35666:return Sy;case 35674:return wy;case 35675:return Ey;case 35676:return Ty;case 5124:case 35670:return Ay;case 35667:case 35671:return Ry;case 35668:case 35672:return Cy;case 35669:case 35673:return Py;case 5125:return Iy;case 36294:return Ly;case 36295:return Dy;case 36296:return Ny;case 35678:case 36198:case 36298:case 36306:case 35682:return Uy;case 35679:case 36299:case 36307:return Fy;case 35680:case 36300:case 36308:case 36293:return Oy;case 36289:case 36303:case 36311:case 36292:return ky}}var Jd=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=yy(e.type)}},jd=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=zy(e.type)}},Qd=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],i)}}},Kd=/(\w+)(\])?(\[|\.)?/g;function Dp(n,t){n.seq.push(t),n.map[t.id]=t}function By(n,t,e){let i=n.name,s=i.length;for(Kd.lastIndex=0;;){let r=Kd.exec(i),a=Kd.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Dp(e,c===void 0?new Jd(o,n,t):new jd(o,n,t));break}else{let h=e.map[o];h===void 0&&(h=new Qd(o),Dp(e,h)),e=h}}}var qr=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let o=t.getActiveUniform(e,a),l=t.getUniformLocation(e,o.name);By(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,i,s){let r=this.map[e];r!==void 0&&r.setValue(t,i,s)}setOptional(t,e,i){let s=e[i];s!==void 0&&this.setValue(t,i,s)}static upload(t,e,i,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=i[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){let i=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&i.push(a)}return i}};function Np(n,t,e){let i=n.createShader(t);return n.shaderSource(i,e),n.compileShader(i),i}var Hy=37297,Gy=0;function Vy(n,t){let e=n.split(`
`),i=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;i.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return i.join(`
`)}var Up=new Kt;function Wy(n){me._getMatrix(Up,me.workingColorSpace,n);let t=`mat3( ${Up.elements.map(e=>e.toFixed(4))} )`;switch(me.getTransfer(n)){case Ca:return[t,"LinearTransferOETF"];case we:return[t,"sRGBTransferOETF"];default:return qt("WebGLProgram: Unsupported color space: ",n),[t,"LinearTransferOETF"]}}function Fp(n,t,e){let i=n.getShaderParameter(t,n.COMPILE_STATUS),r=(n.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+Vy(n.getShaderSource(t),o)}else return r}function Xy(n,t){let e=Wy(t);return[`vec4 ${n}( vec4 value ) {`,`	return ${e[1]}( vec4( ${e[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var qy={[gd]:"Linear",[xd]:"Reinhard",[vd]:"Cineon",[yd]:"ACESFilmic",[bd]:"AgX",[Ws]:"Neutral",[_d]:"Custom"};function $y(n,t){let e=qy[t];return e===void 0?(qt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var Vc=new D;function Yy(){me.getLuminanceCoefficients(Vc);let n=Vc.x.toFixed(4),t=Vc.y.toFixed(4),e=Vc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Ky(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(bo).join(`
`)}function Zy(n){let t=[];for(let e in n){let i=n[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function Jy(n,t){let e={},i=n.getProgramParameter(t,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(t,s),a=r.name,o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:n.getAttribLocation(t,a),locationSize:o}}return e}function bo(n){return n!==""}function Op(n,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return n.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function kp(n,t){return n.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var jy=/^[ \t]*#include +<([\w\d./]+)>/gm;function tu(n){return n.replace(jy,Qy)}function Qy(n,t){let e=oe[t];if(e===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">");return tu(e)}var t_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function zp(n){return n.replace(t_,e_)}function e_(n,t,e,i){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Bp(n){let t=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?t+=`
#define HIGH_PRECISION`:n.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var i_={[Hs]:"SHADOWMAP_TYPE_PCF",[Gr]:"SHADOWMAP_TYPE_VSM"};function n_(n){return i_[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var s_={[Wr]:"ENVMAP_MODE_REFRACTION"};function r_(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":s_[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var a_={[md]:"ENVMAP_BLENDING_MULTIPLY",[ip]:"ENVMAP_BLENDING_MIX",[np]:"ENVMAP_BLENDING_ADD"};function o_(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":a_[n.combine]||"ENVMAP_BLENDING_NONE"}function l_(n,t,e,i){let s=n.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=n_(e),c=e.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",u=r_(e),h=o_(e),d=Ky(e),f=Zy(r),p=s.createProgram(),x,m,g=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(x=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,f].filter(bo).join(`
`),x.length>0&&(x+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,f].filter(bo).join(`
`),m.length>0&&(m+=`
`)):(x=[Bp(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,f,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+e.diffuseRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(bo).join(`
`),m=[Bp(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,f,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",e.envMap?"#define "+h:"",e.envMapPMREM?"#define ENVMAP_MAX_LOD "+e.envMapMaxLod+".0":"",e.envMapPMREM?"#define ENVMAP_SIZE "+e.envMapSize+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==_n?"#define TONE_MAPPING":"",e.toneMapping!==_n?oe.tonemapping_pars_fragment:"",e.toneMapping!==_n?$y("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",oe.colorspace_pars_fragment,Xy("linearToOutputTexel",e.outputColorSpace),Yy(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(bo).join(`
`)),a=tu(a),a=Op(a,e),a=kp(a,e),o=tu(o),o=Op(o,e),o=kp(o,e),a=zp(a),o=zp(o),e.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,x=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+x,m=["#define varying in",e.glslVersion===Dd?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Dd?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let _=g+x+a,b=g+m+o,v=Np(s,s.VERTEX_SHADER,_),E=Np(s,s.FRAGMENT_SHADER,b);s.attachShader(p,v),s.attachShader(p,E),e.index0AttributeName!==void 0?s.bindAttribLocation(p,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(p,0,"position"),s.linkProgram(p);function T(P){if(n.debug.checkShaderErrors){let C=s.getProgramInfoLog(p)||"",N=s.getShaderInfoLog(v)||"",O=s.getShaderInfoLog(E)||"",L=C.trim(),k=N.trim(),G=O.trim(),V=!0,at=!0;if(s.getProgramParameter(p,s.LINK_STATUS)===!1)if(V=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,p,v,E);else{let $=Fp(s,v,"vertex"),nt=Fp(s,E,"fragment");Yt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(p,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+L+`
`+$+`
`+nt)}else L!==""?qt("WebGLProgram: Program Info Log:",L):(k===""||G==="")&&(at=!1);at&&(P.diagnostics={runnable:V,programLog:L,vertexShader:{log:k,prefix:x},fragmentShader:{log:G,prefix:m}})}s.deleteShader(v),s.deleteShader(E),y=new qr(s,p),M=Jy(s,p)}let y;this.getUniforms=function(){return y===void 0&&T(this),y};let M;this.getAttributes=function(){return M===void 0&&T(this),M};let U=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return U===!1&&(U=s.getProgramParameter(p,Hy)),U},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(p),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Gy++,this.cacheKey=t,this.usedTimes=1,this.program=p,this.vertexShader=v,this.fragmentShader=E,this}var c_=0,eu=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new iu(t),e.set(t,i)),i}},iu=class{constructor(t){this.id=c_++,this.code=t,this.usedTimes=0}};function h_(n){return n===xs||n===xo||n===vo}function d_(n,t,e,i,s,r){let a=new Da,o=new eu,l=new Set,c=[],u=new Map,h=i.logarithmicDepthBuffer,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(y){return l.add(y),y===0?"uv":`uv${y}`}function p(y,M,U,P,C,N){let O=P.fog,L=C.geometry,k=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?P.environment:null,G=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap,V=t.get(y.envMap||k,G),at=d[y.type],$=i.precision;y.precision!==null&&($=i.getMaxPrecision(y.precision),$!==y.precision&&qt("WebGLProgram.getParameters:",y.precision,"not supported, using",$,"instead."));let nt=L.morphAttributes.position||L.morphAttributes.normal||L.morphAttributes.color,rt=nt!==void 0?nt.length:0,Dt=0;L.morphAttributes.position!==void 0&&(Dt=1),L.morphAttributes.normal!==void 0&&(Dt=2),L.morphAttributes.color!==void 0&&(Dt=3);let Gt,j,wt,Nt;if(at){let Tt=Ci[at];Gt=Tt.vertexShader,j=Tt.fragmentShader}else{Gt=y.vertexShader,j=y.fragmentShader;let Tt=o.getVertexShaderStage(y),Ee=o.getFragmentShaderStage(y);o.update(y,Tt,Ee),wt=Tt.id,Nt=Ee.id}let Y=n.getRenderTarget(),H=n.state.buffers.depth.getReversed(),Z=C.isInstancedMesh===!0,At=C.isBatchedMesh===!0,Pt=!!y.map,$t=!!y.matcap,Jt=!!V,et=Jt&&V.isPMREMTexture===!0,ct=!!y.aoMap,ft=!!y.lightMap,It=!!y.bumpMap&&y.wireframe===!1,Et=!!y.normalMap,ie=!!y.displacementMap,Bt=!!y.emissiveMap,de=!!y.metalnessMap,ue=!!y.roughnessMap,ye=y.anisotropy>0,B=y.clearcoat>0,qe=y.diffuseRoughness>0,ce=y.dispersion>0,Re=y.retroreflectivity>0,yt=y.iridescence>0,He=y.sheen>0,Xt=y.transmission>0,Zt=ye&&!!y.anisotropyMap,I=B&&!!y.clearcoatMap,S=B&&!!y.clearcoatNormalMap,X=B&&!!y.clearcoatRoughnessMap,lt=qe&&!!y.diffuseRoughnessMap,st=yt&&!!y.iridescenceMap,pt=yt&&!!y.iridescenceThicknessMap,_t=He&&!!y.sheenColorMap,Q=He&&!!y.sheenRoughnessMap,tt=!!y.specularMap,gt=!!y.specularColorMap,F=!!y.specularIntensityMap,it=Xt&&!!y.transmissionMap,J=Xt&&!!y.thicknessMap,xt=!!y.gradientMap,ut=!!y.alphaMap,mt=y.alphaTest>0,Ht=!!y.alphaHash,ae=!!y.extensions,ht=_n;y.toneMapped&&(Y===null||Y.isXRRenderTarget===!0)&&(ht=n.toneMapping);let Vt=et?V.isCompressedCubeTexture?V.image[0].mipmaps:V.mipmaps:null,re={shaderID:at,shaderType:y.type,shaderName:y.name,vertexShader:Gt,fragmentShader:j,defines:y.defines,customVertexShaderID:wt,customFragmentShaderID:Nt,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:$,batching:At,batchingColor:At&&C._colorsTexture!==null,instancing:Z,instancingColor:Z&&C.instanceColor!==null,instancingMorph:Z&&C.morphTexture!==null,outputColorSpace:Y===null?n.outputColorSpace:Y.isXRRenderTarget===!0?Y.texture.colorSpace:me.workingColorSpace,alphaToCoverage:!!y.alphaToCoverage,map:Pt,matcap:$t,envMap:Jt,envMapMode:Jt&&V.mapping,envMapPMREM:et,envMapMaxLod:et?Vt.length-1:null,envMapSize:et?Vt[0].width:null,aoMap:ct,lightMap:ft,bumpMap:It,normalMap:Et,displacementMap:ie,emissiveMap:Bt,normalMapObjectSpace:Et&&y.normalMapType===ap,normalMapTangentSpace:Et&&y.normalMapType===Bc,packedNormalMap:Et&&y.normalMapType===Bc&&h_(y.normalMap.format),metalnessMap:de,roughnessMap:ue,anisotropy:ye,anisotropyMap:Zt,clearcoat:B,clearcoatMap:I,clearcoatNormalMap:S,clearcoatRoughnessMap:X,diffuseRoughness:qe,diffuseRoughnessMap:lt,dispersion:ce,retroreflection:Re,iridescence:yt,iridescenceMap:st,iridescenceThicknessMap:pt,sheen:He,sheenColorMap:_t,sheenRoughnessMap:Q,specularMap:tt,specularColorMap:gt,specularIntensityMap:F,transmission:Xt,transmissionMap:it,thicknessMap:J,gradientMap:xt,opaque:y.transparent===!1&&y.blending===Vr&&y.alphaToCoverage===!1,alphaMap:ut,alphaTest:mt,alphaHash:Ht,combine:y.combine,mapUv:Pt&&f(y.map.channel),aoMapUv:ct&&f(y.aoMap.channel),lightMapUv:ft&&f(y.lightMap.channel),bumpMapUv:It&&f(y.bumpMap.channel),normalMapUv:Et&&f(y.normalMap.channel),displacementMapUv:ie&&f(y.displacementMap.channel),emissiveMapUv:Bt&&f(y.emissiveMap.channel),metalnessMapUv:de&&f(y.metalnessMap.channel),roughnessMapUv:ue&&f(y.roughnessMap.channel),anisotropyMapUv:Zt&&f(y.anisotropyMap.channel),clearcoatMapUv:I&&f(y.clearcoatMap.channel),clearcoatNormalMapUv:S&&f(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:X&&f(y.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:lt&&f(y.diffuseRoughnessMap.channel),iridescenceMapUv:st&&f(y.iridescenceMap.channel),iridescenceThicknessMapUv:pt&&f(y.iridescenceThicknessMap.channel),sheenColorMapUv:_t&&f(y.sheenColorMap.channel),sheenRoughnessMapUv:Q&&f(y.sheenRoughnessMap.channel),specularMapUv:tt&&f(y.specularMap.channel),specularColorMapUv:gt&&f(y.specularColorMap.channel),specularIntensityMapUv:F&&f(y.specularIntensityMap.channel),transmissionMapUv:it&&f(y.transmissionMap.channel),thicknessMapUv:J&&f(y.thicknessMap.channel),alphaMapUv:ut&&f(y.alphaMap.channel),vertexTangents:!!L.attributes.tangent&&(Et||ye),vertexNormals:!!L.attributes.normal,vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!L.attributes.color&&L.attributes.color.itemSize===4,pointsUvs:C.isPoints===!0&&!!L.attributes.uv&&(Pt||ut),fog:!!O,useFog:y.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:y.wireframe===!1&&(y.flatShading===!0||L.attributes.normal===void 0&&Et===!1&&(y.isMeshLambertMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isMeshPhysicalMaterial)),sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:H,skinning:C.isSkinnedMesh===!0,hasPositionAttribute:L.attributes.position!==void 0,morphTargets:L.morphAttributes.position!==void 0,morphNormals:L.morphAttributes.normal!==void 0,morphColors:L.morphAttributes.color!==void 0,morphTargetsCount:rt,morphTextureStride:Dt,numSunLights:M.sun.length,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numSunLightShadows:M.sunShadowMap.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numLightProbeGrids:N.filter(Tt=>Tt.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:y.dithering,shadowMapEnabled:n.shadowMap.enabled&&U.length>0,shadowMapType:n.shadowMap.type,toneMapping:ht,decodeVideoTexture:Pt&&y.map.isVideoTexture===!0&&me.getTransfer(y.map.colorSpace)===we,decodeVideoTextureEmissive:Bt&&y.emissiveMap.isVideoTexture===!0&&me.getTransfer(y.emissiveMap.colorSpace)===we,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Xe,flipSided:y.side===li,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:ae&&y.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ae&&y.extensions.multiDraw===!0||At)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return re.vertexUv1s=l.has(1),re.vertexUv2s=l.has(2),re.vertexUv3s=l.has(3),l.clear(),re}function x(y){let M=[];if(y.shaderID?M.push(y.shaderID):(M.push(y.customVertexShaderID),M.push(y.customFragmentShaderID)),y.defines!==void 0)for(let U in y.defines)M.push(U),M.push(y.defines[U]);return y.isRawShaderMaterial===!1&&(m(M,y),g(M,y),M.push(n.outputColorSpace)),M.push(y.customProgramCacheKey),M.join()}function m(y,M){y.push(M.precision),y.push(M.outputColorSpace),y.push(M.envMapMode),y.push(M.envMapPMREM),y.push(M.envMapMaxLod),y.push(M.envMapSize),y.push(M.mapUv),y.push(M.alphaMapUv),y.push(M.lightMapUv),y.push(M.aoMapUv),y.push(M.bumpMapUv),y.push(M.normalMapUv),y.push(M.displacementMapUv),y.push(M.emissiveMapUv),y.push(M.metalnessMapUv),y.push(M.roughnessMapUv),y.push(M.anisotropyMapUv),y.push(M.clearcoatMapUv),y.push(M.clearcoatNormalMapUv),y.push(M.clearcoatRoughnessMapUv),y.push(M.diffuseRoughnessMapUv),y.push(M.iridescenceMapUv),y.push(M.iridescenceThicknessMapUv),y.push(M.sheenColorMapUv),y.push(M.sheenRoughnessMapUv),y.push(M.specularMapUv),y.push(M.specularColorMapUv),y.push(M.specularIntensityMapUv),y.push(M.transmissionMapUv),y.push(M.thicknessMapUv),y.push(M.combine),y.push(M.fogExp2),y.push(M.sizeAttenuation),y.push(M.morphTargetsCount),y.push(M.numSunLights),y.push(M.numDirLights),y.push(M.numPointLights),y.push(M.numSpotLights),y.push(M.numSpotLightMaps),y.push(M.numHemiLights),y.push(M.numRectAreaLights),y.push(M.numSunLightShadows),y.push(M.numDirLightShadows),y.push(M.numPointLightShadows),y.push(M.numSpotLightShadows),y.push(M.numSpotLightShadowsWithMaps),y.push(M.numLightProbes),y.push(M.numLightProbeGrids),y.push(M.shadowMapType),y.push(M.toneMapping),y.push(M.numClippingPlanes),y.push(M.numClipIntersection),y.push(M.depthPacking)}function g(y,M){a.disableAll(),M.instancing&&a.enable(0),M.instancingColor&&a.enable(1),M.instancingMorph&&a.enable(2),M.matcap&&a.enable(3),M.envMap&&a.enable(4),M.normalMapObjectSpace&&a.enable(5),M.normalMapTangentSpace&&a.enable(6),M.clearcoat&&a.enable(7),M.iridescence&&a.enable(8),M.alphaTest&&a.enable(9),M.vertexColors&&a.enable(10),M.vertexAlphas&&a.enable(11),M.vertexUv1s&&a.enable(12),M.vertexUv2s&&a.enable(13),M.vertexUv3s&&a.enable(14),M.vertexTangents&&a.enable(15),M.anisotropy&&a.enable(16),M.alphaHash&&a.enable(17),M.batching&&a.enable(18),M.dispersion&&a.enable(19),M.retroreflection&&a.enable(24),M.diffuseRoughness&&a.enable(25),M.batchingColor&&a.enable(20),M.gradientMap&&a.enable(21),M.packedNormalMap&&a.enable(22),M.vertexNormals&&a.enable(23),y.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.reversedDepthBuffer&&a.enable(4),M.skinning&&a.enable(5),M.morphTargets&&a.enable(6),M.morphNormals&&a.enable(7),M.morphColors&&a.enable(8),M.premultipliedAlpha&&a.enable(9),M.shadowMapEnabled&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),M.decodeVideoTextureEmissive&&a.enable(20),M.alphaToCoverage&&a.enable(21),M.numLightProbeGrids>0&&a.enable(22),M.hasPositionAttribute&&a.enable(23),y.push(a.mask)}function _(y){let M=d[y.type],U;if(M){let P=Ci[M];U=yo.clone(P.uniforms)}else U=y.uniforms;return U}function b(y,M){let U=u.get(M);return U!==void 0?++U.usedTimes:(U=new l_(n,M,y,s),c.push(U),u.set(M,U)),U}function v(y){if(--y.usedTimes===0){let M=c.indexOf(y);c[M]=c[c.length-1],c.pop(),u.delete(y.cacheKey),y.destroy()}}function E(y){o.remove(y)}function T(){o.dispose()}return{getParameters:p,getProgramCacheKey:x,getUniforms:_,acquireProgram:b,releaseProgram:v,releaseShaderCache:E,programs:c,dispose:T}}function u_(){let n=new WeakMap;function t(a){return n.has(a)}function e(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,l){n.get(a)[o]=l}function r(){n=new WeakMap}return{has:t,get:e,remove:i,update:s,dispose:r}}function f_(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.material.id!==t.material.id?n.material.id-t.material.id:n.materialVariant!==t.materialVariant?n.materialVariant-t.materialVariant:n.z!==t.z?n.z-t.z:n.id-t.id}function Hp(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.z!==t.z?t.z-n.z:n.id-t.id}function Gp(){let n=[],t=0,e=[],i=[],s=[];function r(){t=0,e.length=0,i.length=0,s.length=0}function a(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function o(d,f,p,x,m,g){let _=n[t];return _===void 0?(_={id:d.id,object:d,geometry:f,material:p,materialVariant:a(d),groupOrder:x,renderOrder:d.renderOrder,z:m,group:g},n[t]=_):(_.id=d.id,_.object=d,_.geometry=f,_.material=p,_.materialVariant=a(d),_.groupOrder=x,_.renderOrder=d.renderOrder,_.z=m,_.group=g),t++,_}function l(d,f,p,x,m,g,_){_.reversedDepth===!0&&(m=-m);let b=o(d,f,p,x,m,g);p.transmission>0?i.push(b):p.transparent===!0?s.push(b):e.push(b)}function c(d,f,p,x,m,g){let _=o(d,f,p,x,m,g);p.transmission>0?i.unshift(_):p.transparent===!0?s.unshift(_):e.unshift(_)}function u(d,f){e.length>1&&e.sort(d||f_),i.length>1&&i.sort(f||Hp),s.length>1&&s.sort(f||Hp)}function h(){for(let d=t,f=n.length;d<f;d++){let p=n[d];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:i,transparent:s,init:r,push:l,unshift:c,finish:h,sort:u}}function p_(){let n=new WeakMap;function t(i,s){let r=n.get(i),a;return r===void 0?(a=new Gp,n.set(i,[a])):s>=r.length?(a=new Gp,r.push(a)):a=r[s],a}function e(){n=new WeakMap}return{get:t,dispose:e}}function m_(){let n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new D,color:new Lt};break;case"SpotLight":e={position:new D,direction:new D,color:new Lt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new D,color:new Lt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new D,skyColor:new Lt,groundColor:new Lt};break;case"RectAreaLight":e={color:new Lt,position:new D,halfWidth:new D,halfHeight:new D};break}return n[t.id]=e,e}}}function g_(){let n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[t.id]=e,e}}}var x_=0;function v_(n,t){return(t.castShadow?2:0)-(n.castShadow?2:0)+(t.map?1:0)-(n.map?1:0)}function y_(n){let t=new m_,e=g_(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new D);let s=new D,r=new ge,a=new ge;function o(c){let u=0,h=0,d=0;for(let N=0;N<9;N++)i.probe[N].set(0,0,0);let f=0,p=0,x=0,m=0,g=0,_=0,b=0,v=0,E=0,T=0,y=0,M=0,U=0,P=0;c.sort(v_);for(let N=0,O=c.length;N<O;N++){let L=c[N],k=L.color,G=L.intensity,V=L.distance,at=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===xs?at=L.shadow.map.texture:at=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)u+=k.r*G,h+=k.g*G,d+=k.b*G;else if(L.isLightProbe){for(let $=0;$<9;$++)i.probe[$].addScaledVector(L.sh.coefficients[$],G);P++}else if(L.isSunLight){let $=t.get(L);if($.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let nt=L.shadow,rt=e.get(L);rt.shadowIntensity=nt.intensity,rt.shadowBias=nt.bias,rt.shadowNormalBias=nt.normalBias,rt.shadowRadius=nt.radius,rt.shadowMapSize.copy(nt.mapSize).multiply(nt.getFrameExtents()),i.sunShadow[p]=rt,i.sunShadowMap[p]=at;let Dt=nt.getViewportCount();for(let Gt=0;Gt<Dt;Gt++)i.sunShadowMatrix[x+Gt]=nt.getMatrix(Gt),i.sunShadowCascade[x+Gt]=nt._cascadeData[Gt];x+=Dt,p++}i.sun[f]=$,f++}else if(L.isDirectionalLight){let $=t.get(L);if($.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let nt=L.shadow,rt=e.get(L);rt.shadowIntensity=nt.intensity,rt.shadowBias=nt.bias,rt.shadowNormalBias=nt.normalBias,rt.shadowRadius=nt.radius,rt.shadowMapSize=nt.mapSize,i.directionalShadow[m]=rt,i.directionalShadowMap[m]=at,i.directionalShadowMatrix[m]=L.shadow.matrix,E++}i.directional[m]=$,m++}else if(L.isSpotLight){let $=t.get(L);$.position.setFromMatrixPosition(L.matrixWorld),$.color.copy(k).multiplyScalar(G),$.distance=V,$.coneCos=Math.cos(L.angle),$.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),$.decay=L.decay,i.spot[_]=$;let nt=L.shadow;if(L.map&&(i.spotLightMap[M]=L.map,M++,nt.updateMatrices(L),L.castShadow&&U++),i.spotLightMatrix[_]=nt.matrix,L.castShadow){let rt=e.get(L);rt.shadowIntensity=nt.intensity,rt.shadowBias=nt.bias,rt.shadowNormalBias=nt.normalBias,rt.shadowRadius=nt.radius,rt.shadowMapSize=nt.mapSize,i.spotShadow[_]=rt,i.spotShadowMap[_]=at,y++}_++}else if(L.isRectAreaLight){let $=t.get(L);$.color.copy(k).multiplyScalar(G),$.halfWidth.set(L.width*.5,0,0),$.halfHeight.set(0,L.height*.5,0),i.rectArea[b]=$,b++}else if(L.isPointLight){let $=t.get(L);if($.color.copy(L.color).multiplyScalar(L.intensity),$.distance=L.distance,$.decay=L.decay,L.castShadow){let nt=L.shadow,rt=e.get(L);rt.shadowIntensity=nt.intensity,rt.shadowBias=nt.bias,rt.shadowNormalBias=nt.normalBias,rt.shadowRadius=nt.radius,rt.shadowMapSize=nt.mapSize,rt.shadowCameraNear=nt.camera.near,rt.shadowCameraFar=nt.camera.far,i.pointShadow[g]=rt,i.pointShadowMap[g]=at,i.pointShadowMatrix[g]=L.shadow.matrix,T++}i.point[g]=$,g++}else if(L.isHemisphereLight){let $=t.get(L);$.skyColor.copy(L.color).multiplyScalar(G),$.groundColor.copy(L.groundColor).multiplyScalar(G),i.hemi[v]=$,v++}}b>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=St.LTC_FLOAT_1,i.rectAreaLTC2=St.LTC_FLOAT_2):(i.rectAreaLTC1=St.LTC_HALF_1,i.rectAreaLTC2=St.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=d;let C=i.hash;(C.sunLength!==f||C.directionalLength!==m||C.pointLength!==g||C.spotLength!==_||C.rectAreaLength!==b||C.hemiLength!==v||C.numSunShadows!==p||C.numDirectionalShadows!==E||C.numPointShadows!==T||C.numSpotShadows!==y||C.numSpotMaps!==M||C.numLightProbes!==P)&&(i.sun.length=f,i.directional.length=m,i.spot.length=_,i.rectArea.length=b,i.point.length=g,i.hemi.length=v,i.sunShadow.length=p,i.sunShadowMap.length=p,i.sunShadowMatrix.length=x,i.sunShadowCascade.length=x,i.directionalShadow.length=E,i.directionalShadowMap.length=E,i.directionalShadowMatrix.length=E,i.pointShadow.length=T,i.pointShadowMap.length=T,i.pointShadowMatrix.length=T,i.spotShadow.length=y,i.spotShadowMap.length=y,i.spotLightMatrix.length=y+M-U,i.spotLightMap.length=M,i.numSpotLightShadowsWithMaps=U,i.numLightProbes=P,C.sunLength=f,C.directionalLength=m,C.pointLength=g,C.spotLength=_,C.rectAreaLength=b,C.hemiLength=v,C.numSunShadows=p,C.numDirectionalShadows=E,C.numPointShadows=T,C.numSpotShadows=y,C.numSpotMaps=M,C.numLightProbes=P,i.version=x_++)}function l(c,u){let h=0,d=0,f=0,p=0,x=0,m=0,g=u.matrixWorldInverse;for(let _=0,b=c.length;_<b;_++){let v=c[_];if(v.isSunLight){let E=i.sun[h];E.direction.setFromMatrixPosition(v.matrixWorld),E.direction.transformDirection(g),h++}else if(v.isDirectionalLight){let E=i.directional[d];E.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(g),d++}else if(v.isSpotLight){let E=i.spot[p];E.position.setFromMatrixPosition(v.matrixWorld),E.position.applyMatrix4(g),E.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(g),p++}else if(v.isRectAreaLight){let E=i.rectArea[x];E.position.setFromMatrixPosition(v.matrixWorld),E.position.applyMatrix4(g),a.identity(),r.copy(v.matrixWorld),r.premultiply(g),a.extractRotation(r),E.halfWidth.set(v.width*.5,0,0),E.halfHeight.set(0,v.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),x++}else if(v.isPointLight){let E=i.point[f];E.position.setFromMatrixPosition(v.matrixWorld),E.position.applyMatrix4(g),f++}else if(v.isHemisphereLight){let E=i.hemi[m];E.direction.setFromMatrixPosition(v.matrixWorld),E.direction.transformDirection(g),m++}}}return{setup:o,setupView:l,state:i}}function Vp(n){let t=new y_(n),e=[],i=[],s=[];function r(h){u.camera=h,e.length=0,i.length=0,s.length=0}function a(h){h.isLightProbeGrid?s.push(h):e.push(h)}function o(h){i.push(h)}function l(){t.setup(e),s.sort((h,d)=>h.priority-d.priority||h.id-d.id)}function c(h){t.setupView(e,h)}let u={lightsArray:e,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function __(n){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new Vp(n),t.set(s,[o])):r>=a.length?(o=new Vp(n),a.push(o)):o=a[r],o}function i(){t=new WeakMap}return{get:e,dispose:i}}var b_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,M_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,S_=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],w_=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],Wp=new ge,_o=new D,Zd=new D;function E_(n,t,e){let i=new ls,s=new dt,r=new dt,a=new _e,o=new Bl,l=new Hl,c={},u=e.maxTextureSize,h={[gs]:li,[li]:gs,[Xe]:Xe},d=new Ge({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new dt},radius:{value:4}},vertexShader:b_,fragmentShader:M_}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let p=new ve;p.setAttribute("position",new ni(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Rt(p,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Hs;let g=this.type;this.render=function(T,y,M){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;this.type===Of&&(qt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Hs);let U=n.getRenderTarget(),P=n.getActiveCubeFace(),C=n.getActiveMipmapLevel(),N=n.state;N.setBlending(Gs),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);let O=g!==this.type;O&&y.traverse(function(L){L.material&&(Array.isArray(L.material)?L.material.forEach(k=>k.needsUpdate=!0):L.material.needsUpdate=!0)});for(let L=0,k=T.length;L<k;L++){let G=T[L],V=G.shadow;if(V===void 0){qt("WebGLShadowMap:",G,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);let at=V.getFrameExtents();s.multiply(at),r.copy(V.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/at.x),s.x=r.x*at.x,V.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/at.y),s.y=r.y*at.y,V.mapSize.y=r.y));let $=n.state.buffers.depth.getReversed();if(V.camera._reversedDepth=$,V.map===null||O===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===Gr){if(G.isPointLight){qt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new ai(s.x,s.y,{format:xs,type:Li,minFilter:Ke,magFilter:Ke,generateMipmaps:!1}),V.map.texture.name=G.name+".shadowMap",V.map.depthTexture=new Hn(s.x,s.y,qi),V.map.depthTexture.name=G.name+".shadowMapDepth",V.map.depthTexture.format=kn,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=We,V.map.depthTexture.magFilter=We}else G.isPointLight?(V.map=new Mo(s.x),V.map.depthTexture=new Ga(s.x,rn)):(V.map=new ai(s.x,s.y),V.map.depthTexture=new Hn(s.x,s.y,rn)),V.map.depthTexture.name=G.name+".shadowMap",V.map.depthTexture.format=kn,this.type===Hs?(V.map.depthTexture.compareFunction=$?Pd:Cd,V.map.depthTexture.minFilter=Ke,V.map.depthTexture.magFilter=Ke):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=We,V.map.depthTexture.magFilter=We);V.camera.updateProjectionMatrix()}V.map.isWebGLCubeRenderTarget!==!0&&(V.map.width!==s.x||V.map.height!==s.y)&&V.map.setSize(s.x,s.y);let nt=V.map.isWebGLCubeRenderTarget?6:V.getViewportCount();G.isPointLight!==!0&&V.updateMatrices(G,M);let rt=(V.camera.layers.mask&4294967294)!==0?V.camera.layers:M.layers;for(let Dt=0;Dt<nt;Dt++){let Gt=V.getCamera(Dt);if(G.isPointLight){let j=V.camera,wt=V.matrix,Nt=G.distance||j.far;Nt!==j.far&&(j.far=Nt,j.updateProjectionMatrix()),_o.setFromMatrixPosition(G.matrixWorld),j.position.copy(_o),Zd.copy(j.position),Zd.add(S_[Dt]),j.up.copy(w_[Dt]),j.lookAt(Zd),j.updateMatrixWorld(),wt.makeTranslation(-_o.x,-_o.y,-_o.z),Wp.multiplyMatrices(j.projectionMatrix,j.matrixWorldInverse),V._frustum.setFromProjectionMatrix(Wp,j.coordinateSystem,j.reversedDepth)}if(V.map.isWebGLCubeRenderTarget)n.setRenderTarget(V.map,Dt),n.clear();else{Dt===0&&(n.setRenderTarget(V.map),n.clear());let j=V.getViewport(Dt);a.set(r.x*j.x,r.y*j.y,r.x*j.z,r.y*j.w),N.viewport(a)}i=V.getFrustum(Dt),v(y,M,Gt,G,rt,this.type)}V.isPointLightShadow!==!0&&this.type===Gr&&_(V,M),V.needsUpdate=!1}g=this.type,m.needsUpdate=!1,n.setRenderTarget(U,P,C)};function _(T,y){let M=t.update(x);d.defines.VSM_SAMPLES!==T.blurSamples&&(d.defines.VSM_SAMPLES=T.blurSamples,f.defines.VSM_SAMPLES=T.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),T.mapPass===null?T.mapPass=new ai(s.x,s.y,{format:xs,type:Li}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),d.uniforms.shadow_pass.value=T.map.depthTexture,d.uniforms.resolution.value.set(T.map.width,T.map.height),d.uniforms.radius.value=T.radius,n.setRenderTarget(T.mapPass),n.clear(),n.renderBufferDirect(y,null,M,d,x,null),f.uniforms.shadow_pass.value=T.mapPass.texture,f.uniforms.resolution.value.set(T.map.width,T.map.height),f.uniforms.radius.value=T.radius,n.setRenderTarget(T.map),n.clear(),n.renderBufferDirect(y,null,M,f,x,null)}function b(T,y,M,U){let P=null,C=M.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(C!==void 0)P=C;else if(P=M.isPointLight===!0?l:o,n.localClippingEnabled&&y.clipShadows===!0&&Array.isArray(y.clippingPlanes)&&y.clippingPlanes.length!==0||y.displacementMap&&y.displacementScale!==0||y.alphaMap&&y.alphaTest>0||y.map&&y.alphaTest>0||y.alphaToCoverage===!0){let N=P.uuid,O=y.uuid,L=c[N];L===void 0&&(L={},c[N]=L);let k=L[O];k===void 0&&(k=P.clone(),L[O]=k,y.addEventListener("dispose",E)),P=k}if(P.visible=y.visible,P.wireframe=y.wireframe,U===Gr?P.side=y.shadowSide!==null?y.shadowSide:y.side:P.side=y.shadowSide!==null?y.shadowSide:h[y.side],P.alphaMap=y.alphaMap,P.alphaTest=y.alphaToCoverage===!0?.5:y.alphaTest,P.map=y.map,P.clipShadows=y.clipShadows,P.clippingPlanes=y.clippingPlanes,P.clipIntersection=y.clipIntersection,P.displacementMap=y.displacementMap,P.displacementScale=y.displacementScale,P.displacementBias=y.displacementBias,P.wireframeLinewidth=y.wireframeLinewidth,P.linewidth=y.linewidth,M.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let N=n.properties.get(P);N.light=M}return P}function v(T,y,M,U,P,C){if(T.visible===!1)return;if(T.layers.test(P)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&C===Gr)&&(!T.frustumCulled||T.intersectsFrustum(i))){T.modelViewMatrix.multiplyMatrices(M.matrixWorldInverse,T.matrixWorld);let L=t.update(T),k=T.material;if(Array.isArray(k)){let G=L.groups;for(let V=0,at=G.length;V<at;V++){let $=G[V],nt=k[$.materialIndex];if(nt&&nt.visible){let rt=b(T,nt,U,C);T.onBeforeShadow(n,T,y,M,L,rt,$),n.renderBufferDirect(M,null,L,rt,T,$),T.onAfterShadow(n,T,y,M,L,rt,$)}}}else if(k.visible){let G=b(T,k,U,C);T.onBeforeShadow(n,T,y,M,L,G,null),n.renderBufferDirect(M,null,L,G,T,null),T.onAfterShadow(n,T,y,M,L,G,null)}}let O=T.children;for(let L=0,k=O.length;L<k;L++)v(O[L],y,M,U,P,C)}function E(T){T.target.removeEventListener("dispose",E);for(let M in c){let U=c[M],P=T.target.uuid;P in U&&(U[P].dispose(),delete U[P])}}}function T_(n,t){function e(){let F=!1,it=new _e,J=null,xt=new _e(0,0,0,0);return{setMask:function(ut){J!==ut&&!F&&(n.colorMask(ut,ut,ut,ut),J=ut)},setLocked:function(ut){F=ut},setClear:function(ut,mt,Ht,ae,ht){ht===!0&&(ut*=ae,mt*=ae,Ht*=ae),it.set(ut,mt,Ht,ae),xt.equals(it)===!1&&(n.clearColor(ut,mt,Ht,ae),xt.copy(it))},reset:function(){F=!1,J=null,xt.set(-1,0,0,0)}}}function i(){let F=!1,it=!1,J=null,xt=null,ut=null;return{setReversed:function(mt){if(it!==mt){let Ht=t.get("EXT_clip_control");mt?Ht.clipControlEXT(Ht.LOWER_LEFT_EXT,Ht.ZERO_TO_ONE_EXT):Ht.clipControlEXT(Ht.LOWER_LEFT_EXT,Ht.NEGATIVE_ONE_TO_ONE_EXT),it=mt;let ae=ut;ut=null,this.setClear(ae)}},getReversed:function(){return it},setTest:function(mt){mt?H(n.DEPTH_TEST):Z(n.DEPTH_TEST)},setMask:function(mt){J!==mt&&!F&&(n.depthMask(mt),J=mt)},setFunc:function(mt){if(it&&(mt=gp[mt]),xt!==mt){switch(mt){case yl:n.depthFunc(n.NEVER);break;case _l:n.depthFunc(n.ALWAYS);break;case bl:n.depthFunc(n.LESS);break;case Pr:n.depthFunc(n.LEQUAL);break;case Ml:n.depthFunc(n.EQUAL);break;case Sl:n.depthFunc(n.GEQUAL);break;case wl:n.depthFunc(n.GREATER);break;case El:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}xt=mt}},setLocked:function(mt){F=mt},setClear:function(mt){ut!==mt&&(ut=mt,it&&(mt=1-mt),n.clearDepth(mt))},reset:function(){F=!1,J=null,xt=null,ut=null,it=!1}}}function s(){let F=!1,it=null,J=null,xt=null,ut=null,mt=null,Ht=null,ae=null,ht=null;return{setTest:function(Vt){F||(Vt?H(n.STENCIL_TEST):Z(n.STENCIL_TEST))},setMask:function(Vt){it!==Vt&&!F&&(n.stencilMask(Vt),it=Vt)},setFunc:function(Vt,re,Tt){(J!==Vt||xt!==re||ut!==Tt)&&(n.stencilFunc(Vt,re,Tt),J=Vt,xt=re,ut=Tt)},setOp:function(Vt,re,Tt){(mt!==Vt||Ht!==re||ae!==Tt)&&(n.stencilOp(Vt,re,Tt),mt=Vt,Ht=re,ae=Tt)},setLocked:function(Vt){F=Vt},setClear:function(Vt){ht!==Vt&&(n.clearStencil(Vt),ht=Vt)},reset:function(){F=!1,it=null,J=null,xt=null,ut=null,mt=null,Ht=null,ae=null,ht=null}}}let r=new e,a=new i,o=new s,l={},c=new WeakMap,u={},h={},d={},f=new WeakMap,p=[],x=null,m=!1,g=null,_=null,b=null,v=null,E=null,T=null,y=null,M=new Lt(0,0,0),U=0,P=!1,C=null,N=null,O=null,L=null,k=null,G=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,at=0,$=n.getParameter(n.VERSION);$.indexOf("WebGL")!==-1?(at=parseFloat(/^WebGL (\d)/.exec($)[1]),V=at>=1):$.indexOf("OpenGL ES")!==-1&&(at=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),V=at>=2);let nt=null,rt={},Dt=n.getParameter(n.SCISSOR_BOX),Gt=n.getParameter(n.VIEWPORT),j=new _e().fromArray(Dt),wt=new _e().fromArray(Gt);function Nt(F,it,J,xt){let ut=new Uint8Array(4),mt=n.createTexture();n.bindTexture(F,mt),n.texParameteri(F,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(F,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ht=0;Ht<J;Ht++)F===n.TEXTURE_3D||F===n.TEXTURE_2D_ARRAY?n.texImage3D(it,0,n.RGBA,1,1,xt,0,n.RGBA,n.UNSIGNED_BYTE,ut):n.texImage2D(it+Ht,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,ut);return mt}let Y={};Y[n.TEXTURE_2D]=Nt(n.TEXTURE_2D,n.TEXTURE_2D,1),Y[n.TEXTURE_CUBE_MAP]=Nt(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),Y[n.TEXTURE_2D_ARRAY]=Nt(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Y[n.TEXTURE_3D]=Nt(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),H(n.DEPTH_TEST),a.setFunc(Pr),It(!1),Et(hd),H(n.CULL_FACE),ct(Gs);function H(F){u[F]!==!0&&(n.enable(F),u[F]=!0)}function Z(F){u[F]!==!1&&(n.disable(F),u[F]=!1)}function At(F,it){return d[F]!==it?(n.bindFramebuffer(F,it),d[F]=it,F===n.DRAW_FRAMEBUFFER&&(d[n.FRAMEBUFFER]=it),F===n.FRAMEBUFFER&&(d[n.DRAW_FRAMEBUFFER]=it),!0):!1}function Pt(F,it){let J=p,xt=!1;if(F){J=f.get(it),J===void 0&&(J=[],f.set(it,J));let ut=F.textures;if(J.length!==ut.length||J[0]!==n.COLOR_ATTACHMENT0){for(let mt=0,Ht=ut.length;mt<Ht;mt++)J[mt]=n.COLOR_ATTACHMENT0+mt;J.length=ut.length,xt=!0}}else J[0]!==n.BACK&&(J[0]=n.BACK,xt=!0);xt&&n.drawBuffers(J)}function $t(F){return x!==F?(n.useProgram(F),x=F,!0):!1}let Jt={[Vs]:n.FUNC_ADD,[zf]:n.FUNC_SUBTRACT,[Bf]:n.FUNC_REVERSE_SUBTRACT};Jt[Hf]=n.MIN,Jt[Gf]=n.MAX;let et={[Vf]:n.ZERO,[Wf]:n.ONE,[Xf]:n.SRC_COLOR,[fd]:n.SRC_ALPHA,[Jf]:n.SRC_ALPHA_SATURATE,[Kf]:n.DST_COLOR,[$f]:n.DST_ALPHA,[qf]:n.ONE_MINUS_SRC_COLOR,[pd]:n.ONE_MINUS_SRC_ALPHA,[Zf]:n.ONE_MINUS_DST_COLOR,[Yf]:n.ONE_MINUS_DST_ALPHA,[jf]:n.CONSTANT_COLOR,[Qf]:n.ONE_MINUS_CONSTANT_COLOR,[tp]:n.CONSTANT_ALPHA,[ep]:n.ONE_MINUS_CONSTANT_ALPHA};function ct(F,it,J,xt,ut,mt,Ht,ae,ht,Vt){if(F===Gs){m===!0&&(Z(n.BLEND),m=!1);return}if(m===!1&&(H(n.BLEND),m=!0),F!==kf){if(F!==g||Vt!==P){if((_!==Vs||E!==Vs)&&(n.blendEquation(n.FUNC_ADD),_=Vs,E=Vs),Vt)switch(F){case Vr:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case ho:n.blendFunc(n.ONE,n.ONE);break;case dd:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case ud:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Yt("WebGLState: Invalid blending: ",F);break}else switch(F){case Vr:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case ho:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case dd:Yt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case ud:Yt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Yt("WebGLState: Invalid blending: ",F);break}b=null,v=null,T=null,y=null,M.set(0,0,0),U=0,g=F,P=Vt}return}ut=ut||it,mt=mt||J,Ht=Ht||xt,(it!==_||ut!==E)&&(n.blendEquationSeparate(Jt[it],Jt[ut]),_=it,E=ut),(J!==b||xt!==v||mt!==T||Ht!==y)&&(n.blendFuncSeparate(et[J],et[xt],et[mt],et[Ht]),b=J,v=xt,T=mt,y=Ht),(ae.equals(M)===!1||ht!==U)&&(n.blendColor(ae.r,ae.g,ae.b,ht),M.copy(ae),U=ht),g=F,P=!1}function ft(F,it){F.side===Xe?Z(n.CULL_FACE):H(n.CULL_FACE);let J=F.side===li;it&&(J=!J),It(J),F.blending===Vr&&F.transparent===!1?ct(Gs):ct(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),a.setFunc(F.depthFunc),a.setTest(F.depthTest),a.setMask(F.depthWrite),r.setMask(F.colorWrite);let xt=F.stencilWrite;o.setTest(xt),xt&&(o.setMask(F.stencilWriteMask),o.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),o.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),Bt(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?H(n.SAMPLE_ALPHA_TO_COVERAGE):Z(n.SAMPLE_ALPHA_TO_COVERAGE)}function It(F){C!==F&&(F?n.frontFace(n.CW):n.frontFace(n.CCW),C=F)}function Et(F){F!==Uf?(H(n.CULL_FACE),F!==N&&(F===hd?n.cullFace(n.BACK):F===Ff?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Z(n.CULL_FACE),N=F}function ie(F){F!==O&&(V&&n.lineWidth(F),O=F)}function Bt(F,it,J){F?(H(n.POLYGON_OFFSET_FILL),(L!==it||k!==J)&&(L=it,k=J,a.getReversed()&&(it=-it,J=-J),n.polygonOffset(it,J))):Z(n.POLYGON_OFFSET_FILL)}function de(F){F?H(n.SCISSOR_TEST):Z(n.SCISSOR_TEST)}function ue(F){F===void 0&&(F=n.TEXTURE0+G-1),nt!==F&&(n.activeTexture(F),nt=F)}function ye(F,it,J){J===void 0&&(nt===null?J=n.TEXTURE0+G-1:J=nt);let xt=rt[J];xt===void 0&&(xt={type:void 0,texture:void 0},rt[J]=xt),(xt.type!==F||xt.texture!==it)&&(nt!==J&&(n.activeTexture(J),nt=J),n.bindTexture(F,it||Y[F]),xt.type=F,xt.texture=it)}function B(){let F=rt[nt];F!==void 0&&F.type!==void 0&&(n.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function qe(){try{n.compressedTexImage2D(...arguments)}catch(F){Yt("WebGLState:",F)}}function ce(){try{n.compressedTexImage3D(...arguments)}catch(F){Yt("WebGLState:",F)}}function Re(){try{n.texSubImage2D(...arguments)}catch(F){Yt("WebGLState:",F)}}function yt(){try{n.texSubImage3D(...arguments)}catch(F){Yt("WebGLState:",F)}}function He(){try{n.compressedTexSubImage2D(...arguments)}catch(F){Yt("WebGLState:",F)}}function Xt(){try{n.compressedTexSubImage3D(...arguments)}catch(F){Yt("WebGLState:",F)}}function Zt(){try{n.texStorage2D(...arguments)}catch(F){Yt("WebGLState:",F)}}function I(){try{n.texStorage3D(...arguments)}catch(F){Yt("WebGLState:",F)}}function S(){try{n.texImage2D(...arguments)}catch(F){Yt("WebGLState:",F)}}function X(){try{n.texImage3D(...arguments)}catch(F){Yt("WebGLState:",F)}}function lt(F){return h[F]!==void 0?h[F]:n.getParameter(F)}function st(F,it){h[F]!==it&&(n.pixelStorei(F,it),h[F]=it)}function pt(F){j.equals(F)===!1&&(n.scissor(F.x,F.y,F.z,F.w),j.copy(F))}function _t(F){wt.equals(F)===!1&&(n.viewport(F.x,F.y,F.z,F.w),wt.copy(F))}function Q(F,it){let J=c.get(it);J===void 0&&(J=new WeakMap,c.set(it,J));let xt=J.get(F);xt===void 0&&(xt=n.getUniformBlockIndex(it,F.name),n.uniformBlockBinding(it,xt,xt),J.set(F,xt))}function tt(F,it,J){let ut=c.get(it).get(F);l[ut]!==J&&(n.bindBufferBase(n.UNIFORM_BUFFER,ut,J),l[ut]=J)}function gt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),u={},h={},nt=null,rt={},d={},l={},f=new WeakMap,p=[],x=null,m=!1,g=null,_=null,b=null,v=null,E=null,T=null,y=null,M=new Lt(0,0,0),U=0,P=!1,C=null,N=null,O=null,L=null,k=null,j.set(0,0,n.canvas.width,n.canvas.height),wt.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:H,disable:Z,bindFramebuffer:At,drawBuffers:Pt,useProgram:$t,setBlending:ct,setMaterial:ft,setFlipSided:It,setCullFace:Et,setLineWidth:ie,setPolygonOffset:Bt,setScissorTest:de,activeTexture:ue,bindTexture:ye,unbindTexture:B,compressedTexImage2D:qe,compressedTexImage3D:ce,texImage2D:S,texImage3D:X,pixelStorei:st,getParameter:lt,updateUBOMapping:Q,uniformBlockBinding:tt,texStorage2D:Zt,texStorage3D:I,texSubImage2D:Re,texSubImage3D:yt,compressedTexSubImage2D:He,compressedTexSubImage3D:Xt,scissor:pt,viewport:_t,reset:gt}}function A_(n,t,e,i,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new dt,u=new WeakMap,h=new Set,d,f=new WeakMap,p=new Set,x=new FinalizationRegistry(I=>p.delete(I)),m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(I,S){return m?new OffscreenCanvas(I,S):Pa("canvas")}function _(I,S,X){let lt=1,st=Zt(I);if((st.width>X||st.height>X)&&(lt=X/Math.max(st.width,st.height)),lt<1)if(typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&I instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&I instanceof ImageBitmap||typeof VideoFrame<"u"&&I instanceof VideoFrame){let pt=Math.floor(lt*st.width),_t=Math.floor(lt*st.height);d===void 0&&(d=g(pt,_t));let Q=S?g(pt,_t):d;return Q.width=pt,Q.height=_t,Q.getContext("2d").drawImage(I,0,0,pt,_t),qt("WebGLRenderer: Texture has been resized from ("+st.width+"x"+st.height+") to ("+pt+"x"+_t+")."),Q}else return"data"in I&&qt("WebGLRenderer: Image in DataTexture is too big ("+st.width+"x"+st.height+")."),I;return I}function b(I){return I.generateMipmaps}function v(I){n.generateMipmap(I)}function E(I){return I.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:I.isWebGL3DRenderTarget?n.TEXTURE_3D:I.isWebGLArrayRenderTarget||I.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function T(I,S,X,lt,st,pt=!1){if(I!==null){if(n[I]!==void 0)return n[I];qt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+I+"'")}let _t;lt&&(_t=t.get("EXT_texture_norm16"),_t||qt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Q=S;if(S===n.RED&&(X===n.FLOAT&&(Q=n.R32F),X===n.HALF_FLOAT&&(Q=n.R16F),X===n.UNSIGNED_BYTE&&(Q=n.R8),X===n.UNSIGNED_SHORT&&_t&&(Q=_t.R16_EXT),X===n.SHORT&&_t&&(Q=_t.R16_SNORM_EXT)),S===n.RED_INTEGER&&(X===n.UNSIGNED_BYTE&&(Q=n.R8UI),X===n.UNSIGNED_SHORT&&(Q=n.R16UI),X===n.UNSIGNED_INT&&(Q=n.R32UI),X===n.BYTE&&(Q=n.R8I),X===n.SHORT&&(Q=n.R16I),X===n.INT&&(Q=n.R32I)),S===n.RG&&(X===n.FLOAT&&(Q=n.RG32F),X===n.HALF_FLOAT&&(Q=n.RG16F),X===n.UNSIGNED_BYTE&&(Q=n.RG8),X===n.UNSIGNED_SHORT&&_t&&(Q=_t.RG16_EXT),X===n.SHORT&&_t&&(Q=_t.RG16_SNORM_EXT)),S===n.RG_INTEGER&&(X===n.UNSIGNED_BYTE&&(Q=n.RG8UI),X===n.UNSIGNED_SHORT&&(Q=n.RG16UI),X===n.UNSIGNED_INT&&(Q=n.RG32UI),X===n.BYTE&&(Q=n.RG8I),X===n.SHORT&&(Q=n.RG16I),X===n.INT&&(Q=n.RG32I)),S===n.RGB_INTEGER&&(X===n.UNSIGNED_BYTE&&(Q=n.RGB8UI),X===n.UNSIGNED_SHORT&&(Q=n.RGB16UI),X===n.UNSIGNED_INT&&(Q=n.RGB32UI),X===n.BYTE&&(Q=n.RGB8I),X===n.SHORT&&(Q=n.RGB16I),X===n.INT&&(Q=n.RGB32I)),S===n.RGBA_INTEGER&&(X===n.UNSIGNED_BYTE&&(Q=n.RGBA8UI),X===n.UNSIGNED_SHORT&&(Q=n.RGBA16UI),X===n.UNSIGNED_INT&&(Q=n.RGBA32UI),X===n.BYTE&&(Q=n.RGBA8I),X===n.SHORT&&(Q=n.RGBA16I),X===n.INT&&(Q=n.RGBA32I)),S===n.RGB&&(X===n.UNSIGNED_SHORT&&_t&&(Q=_t.RGB16_EXT),X===n.SHORT&&_t&&(Q=_t.RGB16_SNORM_EXT),X===n.UNSIGNED_INT_5_9_9_9_REV&&(Q=n.RGB9_E5),X===n.UNSIGNED_INT_10F_11F_11F_REV&&(Q=n.R11F_G11F_B10F)),S===n.RGBA){let tt=pt?Ca:me.getTransfer(st);X===n.FLOAT&&(Q=n.RGBA32F),X===n.HALF_FLOAT&&(Q=n.RGBA16F),X===n.UNSIGNED_BYTE&&(Q=tt===we?n.SRGB8_ALPHA8:n.RGBA8),X===n.UNSIGNED_SHORT&&_t&&(Q=_t.RGBA16_EXT),X===n.SHORT&&_t&&(Q=_t.RGBA16_SNORM_EXT),X===n.UNSIGNED_SHORT_4_4_4_4&&(Q=n.RGBA4),X===n.UNSIGNED_SHORT_5_5_5_1&&(Q=n.RGB5_A1)}return(Q===n.R16F||Q===n.R32F||Q===n.RG16F||Q===n.RG32F||Q===n.RGBA16F||Q===n.RGBA32F)&&t.get("EXT_color_buffer_float"),Q}function y(I,S){let X;return I?S===null||S===rn||S===qs?X=n.DEPTH24_STENCIL8:S===qi?X=n.DEPTH32F_STENCIL8:S===Xr&&(X=n.DEPTH24_STENCIL8,qt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===rn||S===qs?X=n.DEPTH_COMPONENT24:S===qi?X=n.DEPTH_COMPONENT32F:S===Xr&&(X=n.DEPTH_COMPONENT16),X}function M(I,S){return b(I)===!0||I.isFramebufferTexture&&I.minFilter!==We&&I.minFilter!==Ke?Math.log2(Math.max(S.width,S.height))+1:I.mipmaps.length>0?I.mipmaps.length:I.isCompressedTexture&&Array.isArray(I.image)?S.mipmaps.length:1}function U(I){let S=new WeakRef(I);i.get(I).__ref=S,p.add(S),x.register(I,S,S)}function P(I){let S=i.get(I).__ref;S!==void 0&&(p.delete(S),x.unregister(S))}function C(I){O(I.target)}function N(I){L(I.target)}function O(I){I.removeEventListener("dispose",C),P(I),G(I),I.isVideoTexture&&u.delete(I),I.isHTMLTexture&&h.delete(I)}function L(I){I.removeEventListener("dispose",N),P(I),at(I)}function k(){for(let I of p){let S=I.deref();S!==void 0&&(S.isRenderTarget===!0?L(S):O(S))}p.clear(),h.clear()}function G(I){let S=i.get(I);if(S.__webglInit===void 0)return;let X=I.source,lt=f.get(X);if(lt){let st=lt[S.__cacheKey];st.usedTimes--,st.usedTimes===0&&V(I),Object.keys(lt).length===0&&f.delete(X)}i.remove(I)}function V(I){let S=i.get(I);n.deleteTexture(S.__webglTexture);let X=I.source,lt=f.get(X);delete lt[S.__cacheKey],a.memory.textures--}function at(I){let S=i.get(I);S.__depthDisposeCallback&&S.__depthDisposeCallback();let X=I.depthTexture;if(X&&X.renderTarget===I&&O(X),I.isWebGLCubeRenderTarget)for(let st=0;st<6;st++){if(Array.isArray(S.__webglFramebuffer[st]))for(let pt=0;pt<S.__webglFramebuffer[st].length;pt++)n.deleteFramebuffer(S.__webglFramebuffer[st][pt]);else n.deleteFramebuffer(S.__webglFramebuffer[st]);S.__webglDepthbuffer&&n.deleteRenderbuffer(S.__webglDepthbuffer[st])}else{if(Array.isArray(S.__webglFramebuffer))for(let st=0;st<S.__webglFramebuffer.length;st++)n.deleteFramebuffer(S.__webglFramebuffer[st]);else n.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&n.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&n.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let st=0;st<S.__webglColorRenderbuffer.length;st++)S.__webglColorRenderbuffer[st]&&n.deleteRenderbuffer(S.__webglColorRenderbuffer[st]);S.__webglDepthRenderbuffer&&n.deleteRenderbuffer(S.__webglDepthRenderbuffer)}let lt=I.textures;for(let st=0,pt=lt.length;st<pt;st++){let _t=i.get(lt[st]);_t.__webglTexture&&(n.deleteTexture(_t.__webglTexture),a.memory.textures--),i.remove(lt[st])}i.remove(I)}let $=0;function nt(){$=0}function rt(){return $}function Dt(I){$=I}function Gt(){let I=$;return I>=s.maxTextures&&qt("WebGLTextures: Trying to use "+(I+1)+" texture units while this GPU supports only "+s.maxTextures),$+=1,I}function j(I){let S=[];return S.push(I.wrapS),S.push(I.wrapT),S.push(I.wrapR||0),S.push(I.magFilter),S.push(I.minFilter),S.push(I.anisotropy),S.push(I.internalFormat),S.push(I.format),S.push(I.type),S.push(I.generateMipmaps),S.push(I.mipmapsAutoUpdate),S.push(I.premultiplyAlpha),S.push(I.flipY),S.push(I.unpackAlignment),S.push(I.colorSpace),S.join()}function wt(I,S){let X=i.get(I);if(I.isVideoTexture&&He(I),I.isRenderTargetTexture===!1&&I.isExternalTexture!==!0&&I.version>0&&X.__version!==I.version){let lt=I.image;if(lt===null)qt("WebGLRenderer: Texture marked for update but no image data found.");else if(lt.complete===!1)qt("WebGLRenderer: Texture marked for update but image is incomplete");else{ft(X,I,S);return}}else I.isExternalTexture&&(X.__webglTexture=I.sourceTexture?I.sourceTexture:null);e.bindTexture(n.TEXTURE_2D,X.__webglTexture,n.TEXTURE0+S)}function Nt(I,S){let X=i.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&X.__version!==I.version){ft(X,I,S);return}else I.isExternalTexture&&(X.__webglTexture=I.sourceTexture?I.sourceTexture:null);e.bindTexture(n.TEXTURE_2D_ARRAY,X.__webglTexture,n.TEXTURE0+S)}function Y(I,S){let X=i.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&X.__version!==I.version){ft(X,I,S);return}e.bindTexture(n.TEXTURE_3D,X.__webglTexture,n.TEXTURE0+S)}function H(I,S){let X=i.get(I);if(I.version>0&&X.__version!==I.version){It(X,I,S);return}e.bindTexture(n.TEXTURE_CUBE_MAP,X.__webglTexture,n.TEXTURE0+S)}let Z={[en]:n.REPEAT,[Gi]:n.CLAMP_TO_EDGE,[Tl]:n.MIRRORED_REPEAT},At={[We]:n.NEAREST,[sp]:n.NEAREST_MIPMAP_NEAREST,[uo]:n.NEAREST_MIPMAP_LINEAR,[Ke]:n.LINEAR,[ic]:n.LINEAR_MIPMAP_NEAREST,[Xi]:n.LINEAR_MIPMAP_LINEAR},Pt={[lp]:n.NEVER,[Id]:n.ALWAYS,[cp]:n.LESS,[Cd]:n.LEQUAL,[hp]:n.EQUAL,[Pd]:n.GEQUAL,[dp]:n.GREATER,[up]:n.NOTEQUAL};function $t(I,S){if(S.type===qi&&t.has("OES_texture_float_linear")===!1&&(S.magFilter===Ke||S.magFilter===ic||S.magFilter===uo||S.magFilter===Xi||S.minFilter===Ke||S.minFilter===ic||S.minFilter===uo||S.minFilter===Xi)&&qt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(I,n.TEXTURE_WRAP_S,Z[S.wrapS]),n.texParameteri(I,n.TEXTURE_WRAP_T,Z[S.wrapT]),(I===n.TEXTURE_3D||I===n.TEXTURE_2D_ARRAY)&&n.texParameteri(I,n.TEXTURE_WRAP_R,Z[S.wrapR]),n.texParameteri(I,n.TEXTURE_MAG_FILTER,At[S.magFilter]),n.texParameteri(I,n.TEXTURE_MIN_FILTER,At[S.minFilter]),S.compareFunction&&(n.texParameteri(I,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(I,n.TEXTURE_COMPARE_FUNC,Pt[S.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===We||S.minFilter!==uo&&S.minFilter!==Xi||S.type===qi&&t.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||i.get(S).__currentAnisotropy){let X=t.get("EXT_texture_filter_anisotropic");n.texParameterf(I,X.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),i.get(S).__currentAnisotropy=S.anisotropy}}}function Jt(I,S){let X=!1;I.__webglInit===void 0&&(I.__webglInit=!0,S.addEventListener("dispose",C),U(S));let lt=S.source,st=f.get(lt);st===void 0&&(st={},f.set(lt,st));let pt=j(S);if(pt!==I.__cacheKey){st[pt]===void 0&&(st[pt]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,X=!0),st[pt].usedTimes++;let _t=st[I.__cacheKey];_t!==void 0&&(st[I.__cacheKey].usedTimes--,_t.usedTimes===0&&V(S)),I.__cacheKey=pt,I.__webglTexture=st[pt].texture}return X}function et(I,S,X){return Math.floor(Math.floor(I/X)/S)}function ct(I,S,X,lt){let pt=I.updateRanges;if(pt.length===0)e.texSubImage2D(n.TEXTURE_2D,0,0,0,S.width,S.height,X,lt,S.data);else{pt.sort((F,it)=>F.start-it.start);let _t=0;for(let F=1;F<pt.length;F++){let it=pt[_t],J=pt[F],xt=it.start+it.count,ut=et(J.start,S.width,4),mt=et(it.start,S.width,4);J.start<=xt+1&&ut===mt&&et(J.start+J.count-1,S.width,4)===ut?it.count=Math.max(it.count,J.start+J.count-it.start):(++_t,pt[_t]=J)}pt.length=_t+1;let Q=e.getParameter(n.UNPACK_ROW_LENGTH),tt=e.getParameter(n.UNPACK_SKIP_PIXELS),gt=e.getParameter(n.UNPACK_SKIP_ROWS);e.pixelStorei(n.UNPACK_ROW_LENGTH,S.width);for(let F=0,it=pt.length;F<it;F++){let J=pt[F],xt=Math.floor(J.start/4),ut=Math.ceil(J.count/4),mt=xt%S.width,Ht=Math.floor(xt/S.width),ae=ut,ht=1;e.pixelStorei(n.UNPACK_SKIP_PIXELS,mt),e.pixelStorei(n.UNPACK_SKIP_ROWS,Ht),e.texSubImage2D(n.TEXTURE_2D,0,mt,Ht,ae,ht,X,lt,S.data)}I.clearUpdateRanges(),e.pixelStorei(n.UNPACK_ROW_LENGTH,Q),e.pixelStorei(n.UNPACK_SKIP_PIXELS,tt),e.pixelStorei(n.UNPACK_SKIP_ROWS,gt)}}function ft(I,S,X){let lt=n.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(lt=n.TEXTURE_2D_ARRAY),S.isData3DTexture&&(lt=n.TEXTURE_3D);let st=Jt(I,S),pt=S.source;e.bindTexture(lt,I.__webglTexture,n.TEXTURE0+X);let _t=i.get(pt);if(pt.version!==_t.__version||st===!0){if(e.activeTexture(n.TEXTURE0+X),(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)===!1){let ht=me.getPrimaries(me.workingColorSpace),Vt=S.colorSpace===an?null:me.getPrimaries(S.colorSpace),re=S.colorSpace===an||ht===Vt?n.NONE:n.BROWSER_DEFAULT_WEBGL;e.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),e.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),e.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,re)}e.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment);let tt=_(S.image,!1,s.maxTextureSize);tt=Xt(S,tt);let gt=r.convert(S.format,S.colorSpace),F=r.convert(S.type),it=T(S.internalFormat,gt,F,S.normalized,S.colorSpace,S.isVideoTexture);$t(lt,S);let J,xt=S.mipmaps,ut=S.isVideoTexture!==!0,mt=_t.__version===void 0||st===!0,Ht=pt.dataReady,ae=M(S,tt);if(S.isDepthTexture)it=y(S.format===Wn,S.type),mt&&(ut?e.texStorage2D(n.TEXTURE_2D,1,it,tt.width,tt.height):e.texImage2D(n.TEXTURE_2D,0,it,tt.width,tt.height,0,gt,F,null));else if(S.isDataTexture)if(xt.length>0){ut&&mt&&e.texStorage2D(n.TEXTURE_2D,ae,it,xt[0].width,xt[0].height);for(let ht=0,Vt=xt.length;ht<Vt;ht++)J=xt[ht],ut?Ht&&e.texSubImage2D(n.TEXTURE_2D,ht,0,0,J.width,J.height,gt,F,J.data):e.texImage2D(n.TEXTURE_2D,ht,it,J.width,J.height,0,gt,F,J.data);S.generateMipmaps=!1}else ut?(mt&&e.texStorage2D(n.TEXTURE_2D,ae,it,tt.width,tt.height),Ht&&ct(S,tt,gt,F)):e.texImage2D(n.TEXTURE_2D,0,it,tt.width,tt.height,0,gt,F,tt.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){ut&&mt&&e.texStorage3D(n.TEXTURE_2D_ARRAY,ae,it,xt[0].width,xt[0].height,tt.depth);for(let ht=0,Vt=xt.length;ht<Vt;ht++)if(J=xt[ht],S.format!==Ri)if(gt!==null)if(ut){if(Ht)if(S.layerUpdates.size>0){let re=Vd(J.width,J.height,S.format,S.type);for(let Tt of S.layerUpdates){let Ee=J.data.subarray(Tt*re/J.data.BYTES_PER_ELEMENT,(Tt+1)*re/J.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ht,0,0,Tt,J.width,J.height,1,gt,Ee)}}else e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ht,0,0,0,J.width,J.height,tt.depth,gt,J.data)}else e.compressedTexImage3D(n.TEXTURE_2D_ARRAY,ht,it,J.width,J.height,tt.depth,0,J.data,0,0);else qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ut?Ht&&e.texSubImage3D(n.TEXTURE_2D_ARRAY,ht,0,0,0,J.width,J.height,tt.depth,gt,F,J.data):e.texImage3D(n.TEXTURE_2D_ARRAY,ht,it,J.width,J.height,tt.depth,0,gt,F,J.data);S.layerUpdates.size>0&&S.clearLayerUpdates()}else{ut&&mt&&e.texStorage2D(n.TEXTURE_2D,ae,it,xt[0].width,xt[0].height);for(let ht=0,Vt=xt.length;ht<Vt;ht++)J=xt[ht],S.format!==Ri?gt!==null?ut?Ht&&e.compressedTexSubImage2D(n.TEXTURE_2D,ht,0,0,J.width,J.height,gt,J.data):e.compressedTexImage2D(n.TEXTURE_2D,ht,it,J.width,J.height,0,J.data):qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ut?Ht&&e.texSubImage2D(n.TEXTURE_2D,ht,0,0,J.width,J.height,gt,F,J.data):e.texImage2D(n.TEXTURE_2D,ht,it,J.width,J.height,0,gt,F,J.data)}else if(S.isDataArrayTexture)if(ut){if(mt&&e.texStorage3D(n.TEXTURE_2D_ARRAY,ae,it,tt.width,tt.height,tt.depth),Ht)if(S.layerUpdates.size>0){let ht=Vd(tt.width,tt.height,S.format,S.type);for(let Vt of S.layerUpdates){let re=tt.data.subarray(Vt*ht/tt.data.BYTES_PER_ELEMENT,(Vt+1)*ht/tt.data.BYTES_PER_ELEMENT);e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,Vt,tt.width,tt.height,1,gt,F,re)}S.clearLayerUpdates()}else e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,tt.width,tt.height,tt.depth,gt,F,tt.data)}else e.texImage3D(n.TEXTURE_2D_ARRAY,0,it,tt.width,tt.height,tt.depth,0,gt,F,tt.data);else if(S.isData3DTexture)ut?(mt&&e.texStorage3D(n.TEXTURE_3D,ae,it,tt.width,tt.height,tt.depth),Ht&&e.texSubImage3D(n.TEXTURE_3D,0,0,0,0,tt.width,tt.height,tt.depth,gt,F,tt.data)):e.texImage3D(n.TEXTURE_3D,0,it,tt.width,tt.height,tt.depth,0,gt,F,tt.data);else if(S.isFramebufferTexture){if(mt)if(ut)e.texStorage2D(n.TEXTURE_2D,ae,it,tt.width,tt.height);else{let ht=tt.width,Vt=tt.height;for(let re=0;re<ae;re++)e.texImage2D(n.TEXTURE_2D,re,it,ht,Vt,0,gt,F,null),ht>>=1,Vt>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in n){let ht=n.canvas;if(ht.hasAttribute("layoutsubtree")||ht.setAttribute("layoutsubtree","true"),tt.parentNode!==ht){ht.appendChild(tt),h.add(S),ht.onpaint=Vt=>{let re=Vt.changedElements;for(let Tt of h)re.includes(Tt.image)&&(Tt.needsUpdate=!0)},ht.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,tt);else{let re=n.RGBA,Tt=n.RGBA,Ee=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,re,Tt,Ee,tt)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(xt.length>0){if(ut&&mt){let ht=Zt(xt[0]);e.texStorage2D(n.TEXTURE_2D,ae,it,ht.width,ht.height)}for(let ht=0,Vt=xt.length;ht<Vt;ht++)J=xt[ht],ut?Ht&&e.texSubImage2D(n.TEXTURE_2D,ht,0,0,gt,F,J):e.texImage2D(n.TEXTURE_2D,ht,it,gt,F,J);S.generateMipmaps=!1}else if(ut){if(mt){let ht=Zt(tt);e.texStorage2D(n.TEXTURE_2D,ae,it,ht.width,ht.height)}Ht&&e.texSubImage2D(n.TEXTURE_2D,0,0,0,gt,F,tt)}else e.texImage2D(n.TEXTURE_2D,0,it,gt,F,tt);b(S)&&S.mipmapsAutoUpdate===!0&&v(lt),_t.__version=pt.version,S.onUpdate&&S.onUpdate(S)}I.__version=S.version}function It(I,S,X){if(S.image.length!==6)return;let lt=Jt(I,S),st=S.source;e.bindTexture(n.TEXTURE_CUBE_MAP,I.__webglTexture,n.TEXTURE0+X);let pt=i.get(st);if(st.version!==pt.__version||lt===!0){e.activeTexture(n.TEXTURE0+X);let _t=me.getPrimaries(me.workingColorSpace),Q=S.colorSpace===an?null:me.getPrimaries(S.colorSpace),tt=S.colorSpace===an||_t===Q?n.NONE:n.BROWSER_DEFAULT_WEBGL;e.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),e.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),e.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment),e.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,tt);let gt=S.isCompressedTexture||S.image[0].isCompressedTexture,F=S.image[0]&&S.image[0].isDataTexture,it=[];for(let Tt=0;Tt<6;Tt++)!gt&&!F?it[Tt]=_(S.image[Tt],!0,s.maxCubemapSize):it[Tt]=F?S.image[Tt].image:S.image[Tt],it[Tt]=Xt(S,it[Tt]);let J=it[0],xt=r.convert(S.format,S.colorSpace),ut=r.convert(S.type),mt=T(S.internalFormat,xt,ut,S.normalized,S.colorSpace),Ht=S.isVideoTexture!==!0,ae=pt.__version===void 0||lt===!0,ht=st.dataReady,Vt=M(S,J);$t(n.TEXTURE_CUBE_MAP,S);let re;if(S.isDepthTexture){if(mt=y(S.format===Wn,S.type),ae)if(Ht)e.texStorage2D(n.TEXTURE_CUBE_MAP,1,mt,J.width,J.height);else for(let Tt=0;Tt<6;Tt++)e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,0,mt,J.width,J.height,0,xt,ut,null)}else if(gt){Ht&&ae&&e.texStorage2D(n.TEXTURE_CUBE_MAP,Vt,mt,J.width,J.height);for(let Tt=0;Tt<6;Tt++){re=it[Tt].mipmaps;for(let Ee=0;Ee<re.length;Ee++){let Qe=re[Ee];S.format!==Ri?xt!==null?Ht?ht&&e.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,Ee,0,0,Qe.width,Qe.height,xt,Qe.data):e.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,Ee,mt,Qe.width,Qe.height,0,Qe.data):qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ht?ht&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,Ee,0,0,Qe.width,Qe.height,xt,ut,Qe.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,Ee,mt,Qe.width,Qe.height,0,xt,ut,Qe.data)}}}else{if(re=S.mipmaps,Ht&&ae){re.length>0&&Vt++;let Tt=Zt(it[0]);e.texStorage2D(n.TEXTURE_CUBE_MAP,Vt,mt,Tt.width,Tt.height)}for(let Tt=0;Tt<6;Tt++)if(F){Ht?ht&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,0,0,0,it[Tt].width,it[Tt].height,xt,ut,it[Tt].data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,0,mt,it[Tt].width,it[Tt].height,0,xt,ut,it[Tt].data);for(let Ee=0;Ee<re.length;Ee++){let ts=re[Ee].image[Tt].image;Ht?ht&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,Ee+1,0,0,ts.width,ts.height,xt,ut,ts.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,Ee+1,mt,ts.width,ts.height,0,xt,ut,ts.data)}}else{Ht?ht&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,0,0,0,xt,ut,it[Tt]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,0,mt,xt,ut,it[Tt]);for(let Ee=0;Ee<re.length;Ee++){let Qe=re[Ee];Ht?ht&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,Ee+1,0,0,xt,ut,Qe.image[Tt]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,Ee+1,mt,xt,ut,Qe.image[Tt])}}}b(S)&&S.mipmapsAutoUpdate===!0&&v(n.TEXTURE_CUBE_MAP),pt.__version=st.version,S.onUpdate&&S.onUpdate(S)}I.__version=S.version}function Et(I,S,X,lt,st,pt){let _t=r.convert(X.format,X.colorSpace),Q=r.convert(X.type),tt=T(X.internalFormat,_t,Q,X.normalized,X.colorSpace),gt=i.get(S),F=i.get(X);if(F.__renderTarget=S,!gt.__hasExternalTextures){let it=Math.max(1,S.width>>pt),J=Math.max(1,S.height>>pt);st===n.TEXTURE_3D||st===n.TEXTURE_2D_ARRAY?e.texImage3D(st,pt,tt,it,J,S.depth,0,_t,Q,null):e.texImage2D(st,pt,tt,it,J,0,_t,Q,null)}e.bindFramebuffer(n.FRAMEBUFFER,I),yt(S)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,lt,st,F.__webglTexture,0,Re(S)):(st===n.TEXTURE_2D||st>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&st<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,lt,st,F.__webglTexture,pt),e.bindFramebuffer(n.FRAMEBUFFER,null)}function ie(I,S,X){if(n.bindRenderbuffer(n.RENDERBUFFER,I),S.depthBuffer){let lt=S.depthTexture,st=lt&&lt.isDepthTexture?lt.type:null,pt=y(S.stencilBuffer,st),_t=S.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;yt(S)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Re(S),pt,S.width,S.height):X?n.renderbufferStorageMultisample(n.RENDERBUFFER,Re(S),pt,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,pt,S.width,S.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,_t,n.RENDERBUFFER,I)}else{let lt=S.textures;for(let st=0;st<lt.length;st++){let pt=lt[st],_t=r.convert(pt.format,pt.colorSpace),Q=r.convert(pt.type),tt=T(pt.internalFormat,_t,Q,pt.normalized,pt.colorSpace);yt(S)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Re(S),tt,S.width,S.height):X?n.renderbufferStorageMultisample(n.RENDERBUFFER,Re(S),tt,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,tt,S.width,S.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Bt(I,S,X){let lt=S.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(n.FRAMEBUFFER,I),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let st=i.get(S.depthTexture);st.__renderTarget=S;let pt=lt?S.depthTexture.image[0]:S.depthTexture.image;(!st.__webglTexture||pt.width!==S.width||pt.height!==S.height)&&(pt.width=S.width,pt.height=S.height,S.depthTexture.needsUpdate=!0),lt?H(S.depthTexture,0):wt(S.depthTexture,0);let _t=st.__webglTexture,Q=Re(S),tt=lt?n.TEXTURE_CUBE_MAP_POSITIVE_X+X:n.TEXTURE_2D,gt=S.depthTexture.format===Wn?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(S.depthTexture.format===kn)yt(S)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,gt,tt,_t,0,Q):n.framebufferTexture2D(n.FRAMEBUFFER,gt,tt,_t,0);else if(S.depthTexture.format===Wn)yt(S)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,gt,tt,_t,0,Q):n.framebufferTexture2D(n.FRAMEBUFFER,gt,tt,_t,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function de(I){let S=i.get(I),X=I.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==I.depthTexture){let lt=I.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),lt){let st=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,lt.removeEventListener("dispose",st)};lt.addEventListener("dispose",st),S.__depthDisposeCallback=st}S.__boundDepthTexture=lt}if(I.depthTexture&&!S.__autoAllocateDepthBuffer)if(X)for(let lt=0;lt<6;lt++)Bt(S.__webglFramebuffer[lt],I,lt);else I.texture.mipmaps.length>0?Bt(S.__webglFramebuffer[0],I,0):Bt(S.__webglFramebuffer,I,0);else if(X){S.__webglDepthbuffer=[];for(let lt=0;lt<6;lt++)if(e.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer[lt]),S.__webglDepthbuffer[lt]===void 0)S.__webglDepthbuffer[lt]=n.createRenderbuffer(),ie(S.__webglDepthbuffer[lt],I,!1);else{let st=I.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,pt=S.__webglDepthbuffer[lt];n.bindRenderbuffer(n.RENDERBUFFER,pt),n.framebufferRenderbuffer(n.FRAMEBUFFER,st,n.RENDERBUFFER,pt)}}else if(I.texture.mipmaps.length>0?e.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer[0]):e.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=n.createRenderbuffer(),ie(S.__webglDepthbuffer,I,!1);else{let st=I.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,pt=S.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,pt),n.framebufferRenderbuffer(n.FRAMEBUFFER,st,n.RENDERBUFFER,pt)}e.bindFramebuffer(n.FRAMEBUFFER,null)}function ue(I,S,X){let lt=i.get(I);S!==void 0&&Et(lt.__webglFramebuffer,I,I.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),X!==void 0&&de(I)}function ye(I){let S=I.texture,X=i.get(I),lt=i.get(S);I.addEventListener("dispose",N),U(I);let st=I.textures,pt=I.isWebGLCubeRenderTarget===!0,_t=st.length>1;if(_t||(lt.__webglTexture===void 0&&(lt.__webglTexture=n.createTexture()),lt.__version=S.version,a.memory.textures++),pt){X.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(S.mipmaps.length>0){X.__webglFramebuffer[Q]=[];for(let tt=0;tt<S.mipmaps.length;tt++)X.__webglFramebuffer[Q][tt]=n.createFramebuffer()}else X.__webglFramebuffer[Q]=n.createFramebuffer()}else{if(S.mipmaps.length>0){X.__webglFramebuffer=[];for(let Q=0;Q<S.mipmaps.length;Q++)X.__webglFramebuffer[Q]=n.createFramebuffer()}else X.__webglFramebuffer=n.createFramebuffer();if(_t)for(let Q=0,tt=st.length;Q<tt;Q++){let gt=i.get(st[Q]);gt.__webglTexture===void 0&&(gt.__webglTexture=n.createTexture(),a.memory.textures++)}if(I.samples>0&&yt(I)===!1){X.__webglMultisampledFramebuffer=n.createFramebuffer(),X.__webglColorRenderbuffer=[],e.bindFramebuffer(n.FRAMEBUFFER,X.__webglMultisampledFramebuffer);for(let Q=0;Q<st.length;Q++){let tt=st[Q];X.__webglColorRenderbuffer[Q]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,X.__webglColorRenderbuffer[Q]);let gt=r.convert(tt.format,tt.colorSpace),F=r.convert(tt.type),it=T(tt.internalFormat,gt,F,tt.normalized,tt.colorSpace,I.isXRRenderTarget===!0),J=Re(I);n.renderbufferStorageMultisample(n.RENDERBUFFER,J,it,I.width,I.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Q,n.RENDERBUFFER,X.__webglColorRenderbuffer[Q])}n.bindRenderbuffer(n.RENDERBUFFER,null),I.depthBuffer&&(X.__webglDepthRenderbuffer=n.createRenderbuffer(),ie(X.__webglDepthRenderbuffer,I,!0)),e.bindFramebuffer(n.FRAMEBUFFER,null)}}if(pt){e.bindTexture(n.TEXTURE_CUBE_MAP,lt.__webglTexture),$t(n.TEXTURE_CUBE_MAP,S);for(let Q=0;Q<6;Q++)if(S.mipmaps.length>0)for(let tt=0;tt<S.mipmaps.length;tt++)Et(X.__webglFramebuffer[Q][tt],I,S,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,tt);else Et(X.__webglFramebuffer[Q],I,S,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);b(S)?v(n.TEXTURE_CUBE_MAP):S.mipmaps.length>0&&n.texParameteri(n.TEXTURE_CUBE_MAP,n.TEXTURE_MAX_LEVEL,S.mipmaps.length-1),e.unbindTexture()}else if(_t){for(let Q=0,tt=st.length;Q<tt;Q++){let gt=st[Q],F=i.get(gt),it=n.TEXTURE_2D;(I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(it=I.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(it,F.__webglTexture),$t(it,gt),Et(X.__webglFramebuffer,I,gt,n.COLOR_ATTACHMENT0+Q,it,0),b(gt)&&v(it)}e.unbindTexture()}else{let Q=n.TEXTURE_2D;if((I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(Q=I.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(Q,lt.__webglTexture),$t(Q,S),S.mipmaps.length>0)for(let tt=0;tt<S.mipmaps.length;tt++)Et(X.__webglFramebuffer[tt],I,S,n.COLOR_ATTACHMENT0,Q,tt);else Et(X.__webglFramebuffer,I,S,n.COLOR_ATTACHMENT0,Q,0);b(S)?v(Q):S.mipmaps.length>0&&n.texParameteri(Q,n.TEXTURE_MAX_LEVEL,S.mipmaps.length-1),e.unbindTexture()}I.depthBuffer&&de(I)}function B(I){let S=I.textures;for(let X=0,lt=S.length;X<lt;X++){let st=S[X];if(b(st)&&st.mipmapsAutoUpdate===!0){let pt=E(I),_t=i.get(st).__webglTexture;e.bindTexture(pt,_t),v(pt),e.unbindTexture()}}}let qe=[];function ce(I){if(I.samples>0){if(yt(I)===!1){let S=I.textures,X=I.width,lt=I.height,st=n.COLOR_BUFFER_BIT,pt=I.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,_t=i.get(I),Q=S.length>1;if(Q)for(let gt=0;gt<S.length;gt++)e.bindFramebuffer(n.FRAMEBUFFER,_t.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+gt,n.RENDERBUFFER,null),e.bindFramebuffer(n.FRAMEBUFFER,_t.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+gt,n.TEXTURE_2D,null,0);e.bindFramebuffer(n.READ_FRAMEBUFFER,_t.__webglMultisampledFramebuffer),I.texture.mipmaps.length>0?e.bindFramebuffer(n.DRAW_FRAMEBUFFER,_t.__webglFramebuffer[0]):e.bindFramebuffer(n.DRAW_FRAMEBUFFER,_t.__webglFramebuffer);for(let gt=0;gt<S.length;gt++){if(I.resolveDepthBuffer&&(I.depthBuffer&&(st|=n.DEPTH_BUFFER_BIT),I.stencilBuffer&&I.resolveStencilBuffer&&(st|=n.STENCIL_BUFFER_BIT)),Q){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,_t.__webglColorRenderbuffer[gt]);let F=i.get(S[gt]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,F,0)}n.blitFramebuffer(0,0,X,lt,0,0,X,lt,st,n.NEAREST),l===!0&&(qe.length=0,qe.push(n.COLOR_ATTACHMENT0+gt),I.depthBuffer&&I.storeMultisampledDepthBuffer===!1&&qe.push(pt),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,qe))}if(e.bindFramebuffer(n.READ_FRAMEBUFFER,null),e.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Q)for(let gt=0;gt<S.length;gt++){e.bindFramebuffer(n.FRAMEBUFFER,_t.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+gt,n.RENDERBUFFER,_t.__webglColorRenderbuffer[gt]);let F=i.get(S[gt]).__webglTexture;e.bindFramebuffer(n.FRAMEBUFFER,_t.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+gt,n.TEXTURE_2D,F,0)}e.bindFramebuffer(n.DRAW_FRAMEBUFFER,_t.__webglMultisampledFramebuffer)}else if(I.depthBuffer&&I.storeMultisampledDepthBuffer===!1&&l){let S=I.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[S])}}}function Re(I){return Math.min(s.maxSamples,I.samples)}function yt(I){let S=i.get(I);return I.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function He(I){let S=a.render.frame;u.get(I)!==S&&(u.set(I,S),I.update())}function Xt(I,S){let X=I.colorSpace,lt=I.format,st=I.type;return I.isCompressedTexture===!0||I.isVideoTexture===!0||X!==Ra&&X!==an&&(me.getTransfer(X)===we?(lt!==Ri||st!==Ii)&&qt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Yt("WebGLTextures: Unsupported texture color space:",X)),S}function Zt(I){return typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement?(c.width=I.naturalWidth||I.width,c.height=I.naturalHeight||I.height):typeof VideoFrame<"u"&&I instanceof VideoFrame?(c.width=I.displayWidth,c.height=I.displayHeight):(c.width=I.width,c.height=I.height),c}this.allocateTextureUnit=Gt,this.resetTextureUnits=nt,this.getTextureUnits=rt,this.setTextureUnits=Dt,this.setTexture2D=wt,this.setTexture2DArray=Nt,this.setTexture3D=Y,this.setTextureCube=H,this.rebindTextures=ue,this.setupRenderTarget=ye,this.updateRenderTargetMipmap=B,this.updateMultisampleRenderTarget=ce,this.setupDepthRenderbuffer=de,this.setupFrameBufferTexture=Et,this.useMultisampledRTT=yt,this.dispose=k}function R_(n,t){function e(i,s=an){let r,a=me.getTransfer(s);if(i===Ii)return n.UNSIGNED_BYTE;if(i===sc)return n.UNSIGNED_SHORT_4_4_4_4;if(i===rc)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Ed)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Td)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===Sd)return n.BYTE;if(i===wd)return n.SHORT;if(i===Xr)return n.UNSIGNED_SHORT;if(i===nc)return n.INT;if(i===rn)return n.UNSIGNED_INT;if(i===qi)return n.FLOAT;if(i===Li)return n.HALF_FLOAT;if(i===Ad)return n.ALPHA;if(i===Rd)return n.RGB;if(i===Ri)return n.RGBA;if(i===kn)return n.DEPTH_COMPONENT;if(i===Wn)return n.DEPTH_STENCIL;if(i===ac)return n.RED;if(i===oc)return n.RED_INTEGER;if(i===xs)return n.RG;if(i===lc)return n.RG_INTEGER;if(i===cc)return n.RGBA_INTEGER;if(i===fo||i===po||i===mo||i===go)if(a===we)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===fo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===po)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===mo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===go)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===fo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===po)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===mo)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===go)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===hc||i===dc||i===uc||i===fc)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===hc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===dc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===uc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===fc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===pc||i===mc||i===gc||i===xc||i===vc||i===xo||i===yc)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===pc||i===mc)return a===we?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===gc)return a===we?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===xc)return r.COMPRESSED_R11_EAC;if(i===vc)return r.COMPRESSED_SIGNED_R11_EAC;if(i===xo)return r.COMPRESSED_RG11_EAC;if(i===yc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===_c||i===bc||i===Mc||i===Sc||i===wc||i===Ec||i===Tc||i===Ac||i===Rc||i===Cc||i===Pc||i===Ic||i===Lc||i===Dc)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===_c)return a===we?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===bc)return a===we?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Mc)return a===we?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Sc)return a===we?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===wc)return a===we?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ec)return a===we?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Tc)return a===we?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Ac)return a===we?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Rc)return a===we?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Cc)return a===we?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Pc)return a===we?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Ic)return a===we?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Lc)return a===we?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Dc)return a===we?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Nc||i===Uc||i===Fc)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===Nc)return a===we?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Uc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Fc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Oc||i===kc||i===vo||i===zc)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===Oc)return r.COMPRESSED_RED_RGTC1_EXT;if(i===kc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===vo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===zc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===qs?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:e}}var C_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,P_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,nu=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new Va(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new Ge({vertexShader:C_,fragmentShader:P_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Rt(new Ai(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},su=class extends vn{constructor(t,e){super();let i=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,p=null,x=typeof XRWebGLBinding<"u",m=new nu,g={},_=e.getContextAttributes(),b=null,v=null,E=[],T=[],y=new dt,M=null,U=null,P=new ii;P.viewport=new _e;let C=new ii;C.viewport=new _e;let N=[P,C],O=new jl,L=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let wt=E[j];return wt===void 0&&(wt=new Ur,E[j]=wt),wt.getTargetRaySpace()},this.getControllerGrip=function(j){let wt=E[j];return wt===void 0&&(wt=new Ur,E[j]=wt),wt.getGripSpace()},this.getHand=function(j){let wt=E[j];return wt===void 0&&(wt=new Ur,E[j]=wt),wt.getHandSpace()};function G(j){let wt=T.indexOf(j.inputSource);if(wt===-1)return;let Nt=E[wt];Nt!==void 0&&(Nt.update(j.inputSource,j.frame,c||a),Nt.dispatchEvent({type:j.type,data:j.inputSource}))}function V(){s.removeEventListener("select",G),s.removeEventListener("selectstart",G),s.removeEventListener("selectend",G),s.removeEventListener("squeeze",G),s.removeEventListener("squeezestart",G),s.removeEventListener("squeezeend",G),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",at);for(let j=0;j<E.length;j++){let wt=T[j];wt!==null&&(T[j]=null,E[j].disconnect(wt))}L=null,k=null,m.reset();for(let j in g)delete g[j];if(t.setRenderTarget(b),f=null,d=null,h=null,s=null,v=null,Gt.stop(),i.isPresenting=!1,t.setPixelRatio(M),t.setSize(y.width,y.height,!1),U!==null){let j=U.camera;j.fov=U.fov,j.zoom=U.zoom,j.updateProjectionMatrix(),U=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){r=j,i.isPresenting===!0&&qt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){o=j,i.isPresenting===!0&&qt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(j){c=j},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h===null&&x&&(h=new XRWebGLBinding(s,e)),h},this.getFrame=function(){return p},this.getSession=function(){return s},this.setSession=async function(j){if(s=j,s!==null){if(b=t.getRenderTarget(),s.addEventListener("select",G),s.addEventListener("selectstart",G),s.addEventListener("selectend",G),s.addEventListener("squeeze",G),s.addEventListener("squeezestart",G),s.addEventListener("squeezeend",G),s.addEventListener("end",V),s.addEventListener("inputsourceschange",at),_.xrCompatible!==!0&&await e.makeXRCompatible(),M=t.getPixelRatio(),t.getSize(y),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let Nt=null,Y=null,H=null;_.depth&&(H=_.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,Nt=_.stencil?Wn:kn,Y=_.stencil?qs:rn);let Z={colorFormat:e.RGBA8,depthFormat:H,scaleFactor:r};h=this.getBinding(),d=h.createProjectionLayer(Z),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),v=new ai(d.textureWidth,d.textureHeight,{format:Ri,type:Ii,depthTexture:new Hn(d.textureWidth,d.textureHeight,Y,void 0,void 0,void 0,void 0,void 0,void 0,Nt),stencilBuffer:_.stencil,colorSpace:t.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let Nt={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,Nt),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new ai(f.framebufferWidth,f.framebufferHeight,{format:Ri,type:Ii,colorSpace:t.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Gt.setContext(s),Gt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function at(j){for(let wt=0;wt<j.removed.length;wt++){let Nt=j.removed[wt],Y=T.indexOf(Nt);Y>=0&&(T[Y]=null,E[Y].disconnect(Nt))}for(let wt=0;wt<j.added.length;wt++){let Nt=j.added[wt],Y=T.indexOf(Nt);if(Y===-1){for(let Z=0;Z<E.length;Z++)if(Z>=T.length){T.push(Nt),Y=Z;break}else if(T[Z]===null){T[Z]=Nt,Y=Z;break}if(Y===-1)break}let H=E[Y];H&&H.connect(Nt)}}function $(j,wt){wt===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(wt.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(s===null)return;let wt=j.near,Nt=j.far;m.texture!==null&&(m.depthNear>0&&(wt=m.depthNear),m.depthFar>0&&(Nt=m.depthFar)),O.near=C.near=P.near=wt,O.far=C.far=P.far=Nt,(L!==O.near||k!==O.far)&&(s.updateRenderState({depthNear:O.near,depthFar:O.far}),L=O.near,k=O.far),O.layers.mask=j.layers.mask|6,P.layers.mask=O.layers.mask&-5,C.layers.mask=O.layers.mask&-3;let Y=j.parent,H=O.cameras;$(O,Y);for(let Z=0;Z<H.length;Z++)$(H[Z],Y);O.projectionMatrix.copy(P.projectionMatrix),O.projectionMatrixInverse.copy(P.projectionMatrixInverse),U===null&&j.isPerspectiveCamera&&(U={camera:j,fov:j.fov,zoom:j.zoom}),nt(j,O,Y)};function nt(j,wt,Nt){Nt===null?j.matrix.copy(wt.matrixWorld):(j.matrix.copy(Nt.matrixWorld),j.matrix.invert(),j.matrix.multiply(wt.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(wt.projectionMatrix),j.projectionMatrixInverse.copy(wt.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=Dr*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(j){l=j,d!==null&&(d.fixedFoveation=j),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=j)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(O)},this.getCameraTexture=function(j){return g[j]};let rt=null;function Dt(j,wt){if(u=wt.getViewerPose(c||a),p=wt,u!==null){let Nt=u.views;f!==null&&(t.setRenderTargetFramebuffer(v,f.framebuffer),t.setRenderTarget(v));let Y=!1;Nt.length!==O.cameras.length&&(O.cameras.length=0,Y=!0);for(let Pt=0;Pt<Nt.length;Pt++){let $t=Nt[Pt],Jt=null;if(f!==null)Jt=f.getViewport($t);else{let ct=h.getViewSubImage(d,$t);Jt=ct.viewport,Pt===0&&(t.setRenderTargetTextures(v,ct.colorTexture,ct.depthStencilTexture),t.setRenderTarget(v))}let et=N[Pt];et===void 0&&(et=new ii,et.layers.enable(Pt),et.viewport=new _e,N[Pt]=et),et.matrix.fromArray($t.transform.matrix),et.matrix.decompose(et.position,et.quaternion,et.scale),et.projectionMatrix.fromArray($t.projectionMatrix),et.projectionMatrixInverse.copy(et.projectionMatrix).invert(),et.viewport.set(Jt.x,Jt.y,Jt.width,Jt.height),Pt===0&&(O.matrix.copy(et.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),Y===!0&&O.cameras.push(et)}let H=s.enabledFeatures;if(H&&H.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){h=i.getBinding();let Pt=h.getDepthInformation(Nt[0]);Pt&&Pt.isValid&&Pt.texture&&m.init(Pt,s.renderState)}if(H&&H.includes("camera-access")&&x){t.state.unbindTexture(),h=i.getBinding();for(let Pt=0;Pt<Nt.length;Pt++){let $t=Nt[Pt].camera;if($t){let Jt=g[$t];Jt||(Jt=new Va,g[$t]=Jt);let et=h.getCameraImage($t);Jt.sourceTexture=et}}}}for(let Nt=0;Nt<E.length;Nt++){let Y=T[Nt],H=E[Nt];Y!==null&&H!==void 0&&H.update(Y,wt,c||a)}rt&&rt(j,wt),wt.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:wt}),p=null}let Gt=new Xp;Gt.setAnimationLoop(Dt),this.setAnimationLoop=function(j){rt=j},this.dispose=function(){}}},I_=new ge,e0=new Kt;e0.set(-1,0,0,0,1,0,0,0,1);function L_(n,t){function e(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function i(m,g){g.color.getRGB(m.fogColor.value,Bd(n)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,_,b,v){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),h(m,g)):g.isMeshPhongMaterial?(r(m,g),u(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),d(m,g),g.isMeshPhysicalMaterial&&f(m,g,v)):g.isMeshMatcapMaterial?(r(m,g),p(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),x(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(a(m,g),g.isLineDashedMaterial&&o(m,g)):g.isPointsMaterial?l(m,g,_,b):g.isSpriteMaterial?c(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,e(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,e(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===li&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,e(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===li&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,e(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,e(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,e(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);let _=t.get(g),b=_.envMap,v=_.envMapRotation;b&&(m.envMap.value=b,m.envMapRotation.value.setFromMatrix4(I_.makeRotationFromEuler(v)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(e0),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,e(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,e(g.aoMap,m.aoMapTransform))}function a(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,e(g.map,m.mapTransform))}function o(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function l(m,g,_,b){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*_,m.scale.value=b*.5,g.map&&(m.map.value=g.map,e(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function c(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,e(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function u(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function h(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function d(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,e(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,e(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function f(m,g,_){m.ior.value=g.ior,g.diffuseRoughness>0&&(m.diffuseRoughness.value=g.diffuseRoughness,g.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=g.diffuseRoughnessMap,e(g.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,e(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,e(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,e(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,e(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,e(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===li&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.retroreflectivity>0&&(m.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=g.iridescenceThicknessMaximum,g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,e(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,e(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=_.texture,m.transmissionSamplerSize.value.set(_.width,_.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,e(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,e(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,e(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,e(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,e(g.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,g){g.matcap&&(m.matcap.value=g.matcap)}function x(m,g){let _=t.get(g).light;m.referencePosition.value.setFromMatrixPosition(_.matrixWorld),m.nearDistance.value=_.shadow.camera.near,m.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function D_(n,t,e,i){let s={},r={};function a(_,b){let v=b.program;i.uniformBlockBinding(_,v,s[_.id])}function o(_,b){let v=s[_.id];v===void 0&&(p(_),v=l(_),s[_.id]=v,_.addEventListener("dispose",m));let E=b.program;i.updateUBOMapping(_,E);let T=t.render.frame;r[_.id]!==T&&(c(_),r[_.id]=T)}function l(_){let b=n.createBuffer(),v=_.__size,E=_.usage;return n.bindBuffer(n.UNIFORM_BUFFER,b),n.bufferData(n.UNIFORM_BUFFER,v,E),n.bindBuffer(n.UNIFORM_BUFFER,null),b}function c(_){let b=s[_.id],v=_.uniforms,E=_.__cache;n.bindBuffer(n.UNIFORM_BUFFER,b);for(let T=0,y=v.length;T<y;T++){let M=v[T];if(Array.isArray(M))for(let U=0,P=M.length;U<P;U++)u(M[U],T,U,E);else u(M,T,0,E)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function u(_,b,v,E){if(d(_,b,v,E)===!0){let T=_.__offset,y=_.value;if(Array.isArray(y)){let M=0;for(let U=0;U<y.length;U++){let P=y[U],C=x(P,!0);h(P,_.__data,M),M+=C.storage/Float32Array.BYTES_PER_ELEMENT}}else h(y,_.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,T,_.__data)}}function h(_,b,v){typeof _=="number"||typeof _=="boolean"?b[v]=_:_.isMatrix3?(b[v]=_.elements[0],b[v+1]=_.elements[1],b[v+2]=_.elements[2],b[v+3]=0,b[v+4]=_.elements[3],b[v+5]=_.elements[4],b[v+6]=_.elements[5],b[v+7]=0,b[v+8]=_.elements[6],b[v+9]=_.elements[7],b[v+10]=_.elements[8],b[v+11]=0):ArrayBuffer.isView(_)?b.set(_.subarray(0,b.length-v),v):_.toArray(b,v)}function d(_,b,v,E){let T=_.value,y=b+"_"+v;if(Array.isArray(T)){E[y]===void 0&&(E[y]=[]);let M=E[y],U=!1;for(let P=0;P<T.length;P++)f(T[P],M,P)===!0&&(U=!0);return U}return f(T,E,y)}function f(_,b,v){if(b[v]===void 0)return typeof _=="number"||typeof _=="boolean"?b[v]=_:ArrayBuffer.isView(_)?b[v]=_.slice():b[v]=_.clone(),!0;{let E=b[v];if(typeof _=="number"||typeof _=="boolean"){if(E!==_)return b[v]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(E.equals(_)===!1)return E.copy(_),!0}}return!1}function p(_){let b=_.uniforms,v=0,E=16;for(let y=0,M=b.length;y<M;y++){let U=Array.isArray(b[y])?b[y]:[b[y]];for(let P=0,C=U.length;P<C;P++){let N=U[P],O=Array.isArray(N.value)?N.value:[N.value],L=Array.isArray(b[y])||Array.isArray(N.value),k=v;for(let V=0,at=O.length;V<at;V++){let $=O[V],nt=x($,L),rt=v%E,Dt=rt%nt.boundary,Gt=rt+Dt;v+=Dt,Gt!==0&&E-Gt<nt.storage&&(v+=E-Gt),V===0&&(k=v),v+=nt.storage}let G=N.type==="int"?Int32Array:N.type==="uint"?Uint32Array:Float32Array;N.__data=new G((v-k)/Float32Array.BYTES_PER_ELEMENT),N.__offset=k}}let T=v%E;return T>0&&(v+=E-T),_.__size=v,_.__cache={},this}function x(_,b){let v={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(v.boundary=4,v.storage=4):_.isVector2?(v.boundary=8,v.storage=8):_.isVector3||_.isColor?(v.boundary=16,v.storage=12):_.isVector4?(v.boundary=16,v.storage=16):_.isMatrix3?(v.boundary=16,v.storage=48):_.isMatrix4?(v.boundary=16,v.storage=64):_.isTexture?qt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(_)?(v.boundary=16,v.storage=_.byteLength):qt("WebGLRenderer: Unsupported uniform value type.",_),b===!0&&(v.boundary=16,v.storage=Math.ceil(v.storage/16)*16),v}function m(_){let b=_.target;b.removeEventListener("dispose",m),n.deleteBuffer(s[b.id]),delete s[b.id],delete r[b.id]}function g(){for(let _ in s)n.deleteBuffer(s[_]);s={},r={}}return{bind:a,update:o,dispose:g}}var N_=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),bn=null;function U_(){return bn===null&&(bn=new Bn(N_,16,16,xs,Li),bn.name="DFG_LUT",bn.minFilter=Ke,bn.magFilter=Ke,bn.wrapS=Gi,bn.wrapT=Gi,bn.generateMipmaps=!1,bn.needsUpdate=!0),bn}var $r=class{constructor(t={}){let{canvas:e=fp(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:d=!1,outputBufferType:f=Ii}=t;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=a;let x=f,m=new Set([cc,lc,oc]),g=new Set([Ii,rn,Xr,qs,sc,rc]),_=new Uint32Array(4),b=new Int32Array(4),v={textures:[],min:[],max:[],resolution:[]},E=null,T=null,y=[],M=[],U=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=_n,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,C=!1,N=null,O=null,L=null,k=null;this._outputColorSpace=Oe;let G=0,V=0,at=null,$=-1,nt=null,rt=new _e,Dt=new _e,Gt=null,j=new Lt(0),wt=0,Nt=e.width,Y=e.height,H=1,Z=null,At=null,Pt=new _e(0,0,Nt,Y),$t=new _e(0,0,Nt,Y),Jt=!1,et=new ls,ct=new Ll,ft=!1,It=!1,Et=new ge,ie=new D,Bt=new _e,de={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ue=!1;function ye(){return at===null?H:1}let B=i;function qe(w,z){return e.getContext(w,z)}let ce,Re,yt,He,Xt,Zt,I,S,X,lt,st,pt,_t,Q,tt,gt,F,it,J,xt,ut,mt,Ht;try{let w={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"187"}`),e.addEventListener("webglcontextlost",Vt,!1),e.addEventListener("webglcontextrestored",re,!1),e.addEventListener("webglcontextcreationerror",Tt,!1),B===null){let z="webgl2";if(B=qe(z,w),B===null)throw qe(z)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}ae()}catch(w){throw e.removeEventListener("webglcontextlost",Vt,!1),e.removeEventListener("webglcontextrestored",re,!1),e.removeEventListener("webglcontextcreationerror",Tt,!1),Yt("WebGLRenderer: "+w.message),w}function ae(){ce=new qv(B),ce.init(),ut=new R_(B,ce),Re=new Uv(B,ce,t,ut),yt=new T_(B,ce),Re.reversedDepthBuffer&&d&&yt.buffers.depth.setReversed(!0),O=B.createFramebuffer(),L=B.createFramebuffer(),k=B.createFramebuffer(),He=new Kv(B),Xt=new u_,Zt=new A_(B,ce,yt,Xt,Re,ut,He),I=new Xv(P),S=new Jg(B),mt=new Dv(B,S),X=new $v(B,S,He,mt),lt=new Jv(B,X,S,mt,He),it=new Zv(B,Re,Zt),tt=new Fv(Xt),st=new d_(P,I,ce,Re,mt,tt),pt=new L_(P,Xt),_t=new p_,Q=new __(ce),F=new Lv(P,I,yt,lt,p,l),gt=new E_(P,lt,Re),Ht=new D_(B,He,Re,yt),J=new Nv(B,ce,He),xt=new Yv(B,ce,He),He.programs=st.programs,P.capabilities=Re,P.extensions=ce,P.properties=Xt,P.renderLists=_t,P.shadowMap=gt,P.state=yt,P.info=He}x!==Ii&&(U=new Qv(x,e.width,e.height,o,s,r));let ht=new su(P,B);this.xr=ht,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let w=ce.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){let w=ce.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return H},this.setPixelRatio=function(w){w!==void 0&&(H=w,this.setSize(Nt,Y,!1))},this.getSize=function(w){return w.set(Nt,Y)},this.setSize=function(w,z,K=!0){if(ht.isPresenting){qt("WebGLRenderer: Can't change size while VR device is presenting.");return}Nt=w,Y=z,e.width=Math.floor(w*H),e.height=Math.floor(z*H),K===!0&&(e.style.width=w+"px",e.style.height=z+"px"),U!==null&&U.setSize(e.width,e.height),this.setViewport(0,0,w,z)},this.getDrawingBufferSize=function(w){return w.set(Nt*H,Y*H).floor()},this.setDrawingBufferSize=function(w,z,K){Nt=w,Y=z,H=K,e.width=Math.floor(w*K),e.height=Math.floor(z*K),this.setViewport(0,0,w,z)},this.setEffects=function(w){if(x===Ii){Yt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let z=0;z<w.length;z++)if(w[z].isOutputPass===!0){qt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}U.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(rt)},this.getViewport=function(w){return w.copy(Pt)},this.setViewport=function(w,z,K,W){w.isVector4?Pt.set(w.x,w.y,w.z,w.w):Pt.set(w,z,K,W),yt.viewport(rt.copy(Pt).multiplyScalar(ye()).round())},this.getScissor=function(w){return w.copy($t)},this.setScissor=function(w,z,K,W){w.isVector4?$t.set(w.x,w.y,w.z,w.w):$t.set(w,z,K,W),yt.scissor(Dt.copy($t).multiplyScalar(ye()).round())},this.getScissorTest=function(){return Jt},this.setScissorTest=function(w){yt.setScissorTest(Jt=w)},this.setOpaqueSort=function(w){Z=w},this.setTransparentSort=function(w){At=w},this.getClearColor=function(w){return w.copy(F.getClearColor())},this.setClearColor=function(){F.setClearColor(...arguments)},this.getClearAlpha=function(){return F.getClearAlpha()},this.setClearAlpha=function(){F.setClearAlpha(...arguments)},this.clear=function(w=!0,z=!0,K=!0){let W=0;if(w){let q=!1;if(at!==null){let bt=at.texture.format;q=m.has(bt)}if(q){let bt=at.texture.type,Ut=g.has(bt),vt=F.getClearColor(),Ct=F.getClearAlpha(),kt=vt.r,te=vt.g,fe=vt.b;Ut?(_[0]=kt,_[1]=te,_[2]=fe,_[3]=Ct,B.clearBufferuiv(B.COLOR,0,_)):(b[0]=kt,b[1]=te,b[2]=fe,b[3]=Ct,B.clearBufferiv(B.COLOR,0,b))}else W|=B.COLOR_BUFFER_BIT}z&&(W|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),K&&(W|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),W!==0&&B.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),N=w},this.dispose=function(){e.removeEventListener("webglcontextlost",Vt,!1),e.removeEventListener("webglcontextrestored",re,!1),e.removeEventListener("webglcontextcreationerror",Tt,!1),F.dispose(),_t.dispose(),Q.dispose(),Zt.dispose(),Xt.dispose(),I.dispose(),lt.dispose(),X.dispose(),mt.dispose(),Ht.dispose(),st.dispose(),ht.dispose(),ht.removeEventListener("sessionstart",Hu),ht.removeEventListener("sessionend",Gu),Cs.stop()};function Vt(w){w.preventDefault(),Ia("WebGLRenderer: Context Lost."),C=!0}function re(){Ia("WebGLRenderer: Context Restored."),C=!1;let w=He.autoReset,z=gt.enabled,K=gt.autoUpdate,W=gt.needsUpdate,q=gt.type;ae(),He.autoReset=w,gt.enabled=z,gt.autoUpdate=K,gt.needsUpdate=W,gt.type=q}function Tt(w){Yt("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function Ee(w){let z=w.target;z.removeEventListener("dispose",Ee),Qe(z)}function Qe(w){ts(w),Xt.remove(w)}function ts(w){let z=Xt.get(w).programs;z!==void 0&&(z.forEach(function(K){st.releaseProgram(K)}),w.isShaderMaterial&&st.releaseShaderCache(w))}this.renderBufferDirect=function(w,z,K,W,q,bt){z===null&&(z=de);let Ut=q.isMesh&&q.matrixWorld.determinantAffine()<0,vt=Mm(w,z,K,W,q);yt.setMaterial(W,Ut);let Ct=K.index,kt=1;if(W.wireframe===!0){if(Ct=X.getWireframeAttribute(K),Ct===void 0)return;kt=2}let te=K.drawRange,fe=K.attributes.position,Ft=te.start*kt,pe=(te.start+te.count)*kt;bt!==null&&(Ft=Math.max(Ft,bt.start*kt),pe=Math.min(pe,(bt.start+bt.count)*kt)),Ct!==null?(Ft=Math.max(Ft,0),pe=Math.min(pe,Ct.count)):fe!=null&&(Ft=Math.max(Ft,0),pe=Math.min(pe,fe.count));let $e=pe-Ft;if($e<0||$e===1/0)return;mt.setup(q,W,vt,K,Ct);let Pe,Ce=J;if(Ct!==null&&(Pe=S.get(Ct),Ce=xt,Ce.setIndex(Pe)),q.isMesh)W.wireframe===!0?(yt.setLineWidth(W.wireframeLinewidth*ye()),Ce.setMode(B.LINES)):Ce.setMode(B.TRIANGLES);else if(q.isLine){let fi=W.linewidth;fi===void 0&&(fi=1),yt.setLineWidth(fi*ye()),q.isLineSegments?Ce.setMode(B.LINES):q.isLineLoop?Ce.setMode(B.LINE_LOOP):Ce.setMode(B.LINE_STRIP)}else q.isPoints?Ce.setMode(B.POINTS):q.isSprite&&Ce.setMode(B.TRIANGLES);if(q.isBatchedMesh)if(ce.get("WEBGL_multi_draw"))Ce.renderMultiDraw(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount);else{let fi=q._multiDrawStarts,Ot=q._multiDrawCounts,wi=q._multiDrawCount,be=Ct?S.get(Ct).bytesPerElement:1,Ps=Xt.get(W).currentProgram.getUniforms();for(let pi=0;pi<wi;pi++)Ps.setValue(B,"_gl_DrawID",pi),Ce.render(fi[pi]/be,Ot[pi])}else if(q.isInstancedMesh)Ce.renderInstances(Ft,$e,q.count);else if(K.isInstancedBufferGeometry){let fi=K._maxInstanceCount!==void 0?K._maxInstanceCount:1/0,Ot=Math.min(K.instanceCount,fi);Ce.renderInstances(Ft,$e,Ot)}else Ce.render(Ft,$e)};function Bu(w,z,K,W){N!==null&&w.isNodeMaterial&&N.setObject(W,w),ft===!0&&tt.setState(w,K,!1),w.transparent===!0&&w.side===Xe&&w.forceSinglePass===!1?(w.side=li,w.needsUpdate=!0,pa(w,z,W),w.side=gs,w.needsUpdate=!0,pa(w,z,W),w.side=Xe):pa(w,z,W)}this.compile=function(w,z,K=null){K===null&&(K=w),N!==null&&N.renderStart(w,z,K),T=Q.get(K),T.init(z),M.push(T),K.traverseVisible(function(q){q.isLight&&q.layers.test(z.layers)&&(T.pushLight(q),q.castShadow&&T.pushShadow(q))}),w!==K&&w.traverseVisible(function(q){q.isLight&&q.layers.test(z.layers)&&(T.pushLight(q),q.castShadow&&T.pushShadow(q))}),T.setupLights(),N!==null&&N.updateLights(T.state.lightsArray),It=this.localClippingEnabled,ft=tt.init(this.clippingPlanes,It),ft===!0&&tt.setGlobalState(this.clippingPlanes,z),N!==null&&gt.render(T.state.shadowsArray,K,z);let W=new Set;return w.traverse(function(q){if(!(q.isMesh||q.isPoints||q.isLine||q.isSprite))return;let bt=q.material;if(bt)if(Array.isArray(bt))for(let Ut=0;Ut<bt.length;Ut++){let vt=bt[Ut];Bu(vt,K,z,q),W.add(vt)}else Bu(bt,K,z,q),W.add(bt)}),T=M.pop(),N!==null&&N.renderEnd(),W},this.compileAsync=function(w,z,K=null){let W=this.compile(w,z,K);return new Promise(q=>{function bt(){if(W.forEach(function(Ut){let Ct=Xt.get(Ut).currentProgram;(Ct===void 0||Ct.isReady())&&W.delete(Ut)}),W.size===0){q(w);return}setTimeout(bt,10)}ce.get("KHR_parallel_shader_compile")!==null?bt():setTimeout(bt,10)})};let Th=null;function _m(w){Th&&Th(w)}function Hu(){Cs.stop()}function Gu(){Cs.start()}let Cs=new Xp;Cs.setAnimationLoop(_m),typeof self<"u"&&Cs.setContext(self),this.setAnimationLoop=function(w){Th=w,ht.setAnimationLoop(w),w===null?Cs.stop():Cs.start()},ht.addEventListener("sessionstart",Hu),ht.addEventListener("sessionend",Gu),this.render=function(w,z){if(z!==void 0&&z.isCamera!==!0){Yt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;N!==null&&N.renderStart(w,z);let K=ht.enabled===!0&&ht.isPresenting===!0,W=U!==null&&(at===null||K)&&U.begin(P,at);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),z.parent===null&&z.matrixWorldAutoUpdate===!0&&z.updateMatrixWorld(),ht.enabled===!0&&ht.isPresenting===!0&&(U===null||U.isCompositing()===!1)&&(ht.cameraAutoUpdate===!0&&ht.updateCamera(z),z=ht.getCamera()),w.isScene===!0&&w.onBeforeRender(P,w,z,at),T=Q.get(w,M.length),T.init(z),T.state.textureUnits=Zt.getTextureUnits(),M.push(T),Et.multiplyMatrices(z.projectionMatrix,z.matrixWorldInverse),z.isArrayCamera?ct.setFromArrayCamera(z):et.setFromProjectionMatrix(Et,Vi,z.reversedDepth),It=this.localClippingEnabled,ft=tt.init(this.clippingPlanes,It),E=_t.get(w,y.length),E.init(),y.push(E),this.info.render.frame++,ht.enabled===!0&&ht.isPresenting===!0){let Ut=P.xr.getDepthSensingMesh();Ut!==null&&Ah(Ut,z,-1/0,P.sortObjects)}Ah(w,z,0,P.sortObjects),E.finish(),N!==null&&N.updateLights(T.state.lightsArray),P.sortObjects===!0&&E.sort(Z,At),ue=ht.enabled===!1||ht.isPresenting===!1||ht.hasDepthSensing()===!1,ue&&F.addToRenderList(E,w),this.info.autoReset===!0&&this.info.reset(),ft===!0&&tt.beginShadows();let q=T.state.shadowsArray;if(gt.render(q,w,z),ft===!0&&tt.endShadows(),(W&&U.hasRenderPass())===!1){let Ut=E.opaque,vt=E.transmissive;if(T.setupLights(),z.isArrayCamera){let Ct=z.cameras;if(vt.length>0)for(let kt=0,te=Ct.length;kt<te;kt++){let fe=Ct[kt];Wu(Ut,vt,w,fe)}ue&&F.render(w);for(let kt=0,te=Ct.length;kt<te;kt++){let fe=Ct[kt];Vu(E,w,fe,fe.viewport)}}else vt.length>0&&Wu(Ut,vt,w,z),ue&&F.render(w),Vu(E,w,z)}at!==null&&V===0&&(Zt.updateMultisampleRenderTarget(at),Zt.updateRenderTargetMipmap(at)),W&&U.end(P),w.isScene===!0&&w.onAfterRender(P,w,z),mt.resetDefaultState(),$=-1,nt=null,M.pop(),M.length>0?(T=M[M.length-1],Zt.setTextureUnits(T.state.textureUnits),ft===!0&&tt.setGlobalState(P.clippingPlanes,T.state.camera)):T=null,y.pop(),y.length>0?E=y[y.length-1]:E=null,N!==null&&N.renderEnd()};function Ah(w,z,K,W){if(w.visible===!1)return;if(w.layers.test(z.layers)){if(w.isGroup)K=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(z);else if(w.isLight)T.pushLight(w),w.castShadow&&T.pushShadow(w);else if(w.isSprite){let Ut=z.isArrayCamera?ct:et;if(!w.frustumCulled||w.intersectsFrustum(Ut)){W&&Bt.setFromMatrixPosition(w.matrixWorld).applyMatrix4(Et);let vt=lt.update(w),Ct=w.material;Ct.visible&&E.push(w,vt,Ct,K,Bt.z,null,z)}}else if(w.isMesh||w.isLine||w.isPoints){let Ut=z.isArrayCamera?ct:et;if(!w.frustumCulled||w.intersectsFrustum(Ut)){let vt=lt.update(w),Ct=w.material;if(W&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),Bt.copy(w.boundingSphere.center)):(vt.boundingSphere===null&&vt.computeBoundingSphere(),Bt.copy(vt.boundingSphere.center)),Bt.applyMatrix4(w.matrixWorld).applyMatrix4(Et)),Array.isArray(Ct)){let kt=vt.groups;for(let te=0,fe=kt.length;te<fe;te++){let Ft=kt[te],pe=Ct[Ft.materialIndex];pe&&pe.visible&&E.push(w,vt,pe,K,Bt.z,Ft,z)}}else Ct.visible&&E.push(w,vt,Ct,K,Bt.z,null,z)}}}let bt=w.children;for(let Ut=0,vt=bt.length;Ut<vt;Ut++)Ah(bt[Ut],z,K,W)}function Vu(w,z,K,W){let{opaque:q,transmissive:bt,transparent:Ut}=w;T.setupLightsView(K),ft===!0&&tt.setGlobalState(P.clippingPlanes,K),W&&yt.viewport(rt.copy(W)),q.length>0&&Vo(q,z,K),bt.length>0&&Vo(bt,z,K),Ut.length>0&&Vo(Ut,z,K),yt.buffers.depth.setTest(!0),yt.buffers.depth.setMask(!0),yt.buffers.color.setMask(!0),yt.setPolygonOffset(!1)}function Wu(w,z,K,W){if((K.isScene===!0?K.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[W.id]===void 0){let Ft=ce.has("EXT_color_buffer_half_float")||ce.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[W.id]=new ai(1,1,{generateMipmaps:!0,type:Ft?Li:Ii,minFilter:Xi,samples:Math.max(4,Re.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:me.workingColorSpace})}let bt=T.state.transmissionRenderTarget[W.id],Ut=W.viewport||rt;bt.setSize(Ut.z*P.transmissionResolutionScale,Ut.w*P.transmissionResolutionScale);let vt=P.getRenderTarget(),Ct=P.getActiveCubeFace(),kt=P.getActiveMipmapLevel();P.setRenderTarget(bt),P.getClearColor(j),wt=P.getClearAlpha(),wt<1&&P.setClearColor(16777215,.5),P.clear(),ue&&F.render(K);let te=P.toneMapping;P.toneMapping=_n;let fe=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),T.setupLightsView(W),ft===!0&&tt.setGlobalState(P.clippingPlanes,W),Vo(w,K,W),Zt.updateMultisampleRenderTarget(bt),Zt.updateRenderTargetMipmap(bt),ce.has("WEBGL_multisampled_render_to_texture")===!1){let Ft=!1;for(let pe=0,$e=z.length;pe<$e;pe++){let Pe=z[pe],{object:Ce,geometry:fi,material:Ot,group:wi}=Pe;if(Ot.side===Xe&&Ce.layers.test(W.layers)){let be=Ot.side;Ot.side=li,Ot.needsUpdate=!0,Xu(Ce,K,W,fi,Ot,wi),Ot.side=be,Ot.needsUpdate=!0,Ft=!0}}Ft===!0&&(Zt.updateMultisampleRenderTarget(bt),Zt.updateRenderTargetMipmap(bt))}P.setRenderTarget(vt,Ct,kt),P.setClearColor(j,wt),fe!==void 0&&(W.viewport=fe),P.toneMapping=te}function Vo(w,z,K){let W=z.isScene===!0?z.overrideMaterial:null;for(let q=0,bt=w.length;q<bt;q++){let Ut=w[q],{object:vt,geometry:Ct,group:kt}=Ut,te=Ut.material;te.allowOverride===!0&&W!==null&&(te=W),vt.layers.test(K.layers)&&Xu(vt,z,K,Ct,te,kt)}}function Xu(w,z,K,W,q,bt){N!==null&&q.isNodeMaterial&&N.setObject(w,q),w.onBeforeRender(P,z,K,W,q,bt),w.modelViewMatrix.multiplyMatrices(K.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),q.onBeforeRender(P,z,K,W,w,bt),q.transparent===!0&&q.side===Xe&&q.forceSinglePass===!1?(q.side=li,q.needsUpdate=!0,P.renderBufferDirect(K,z,W,q,w,bt),q.side=gs,q.needsUpdate=!0,P.renderBufferDirect(K,z,W,q,w,bt),q.side=Xe):P.renderBufferDirect(K,z,W,q,w,bt),w.onAfterRender(P,z,K,W,q,bt)}function qu(w){let z=0;for(let K of w)K.texture!==null&&z++;return z}function pa(w,z,K){z.isScene!==!0&&(z=de);let W=Xt.get(w),q=T.state.lights,bt=T.state.shadowsArray,Ut=q.state.version,vt=st.getParameters(w,q.state,bt,z,K,T.state.lightProbeGridArray),Ct=st.getProgramCacheKey(vt),kt=W.programs;W.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?z.environment:null,W.fog=z.fog;let te=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;W.envMap=I.get(w.envMap||W.environment,te),W.envMapRotation=W.environment!==null&&w.envMap===null?z.environmentRotation:w.envMapRotation,kt===void 0&&(w.addEventListener("dispose",Ee),kt=new Map,W.programs=kt,W.programVariants=new Map);let fe=kt.get(Ct);if(fe!==void 0){if(W.currentProgram===fe&&W.lightsStateVersion===Ut)return Yu(w,vt),fe}else vt.uniforms=st.getUniforms(w),N!==null&&w.isNodeMaterial&&N.build(w,K,vt),w.onBeforeCompile(vt,P),fe=st.acquireProgram(vt,Ct),kt.set(Ct,fe),W.uniforms=vt.uniforms;let Ft=W.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Ft.clippingPlanes=tt.uniform),Yu(w,vt),W.needsLights=wm(w),W.lightsStateVersion=Ut,W.needsLights&&(Ft.ambientLightColor.value=q.state.ambient,Ft.lightProbe.value=q.state.probe,Ft.sunLights.value=q.state.sun,Ft.sunLightShadows.value=q.state.sunShadow,Ft.directionalLights.value=q.state.directional,Ft.directionalLightShadows.value=q.state.directionalShadow,Ft.spotLights.value=q.state.spot,Ft.spotLightShadows.value=q.state.spotShadow,Ft.rectAreaLights.value=q.state.rectArea,Ft.ltc_1.value=q.state.rectAreaLTC1,Ft.ltc_2.value=q.state.rectAreaLTC2,Ft.pointLights.value=q.state.point,Ft.pointLightShadows.value=q.state.pointShadow,Ft.hemisphereLights.value=q.state.hemi,Ft.sunShadowMatrix.value=q.state.sunShadowMatrix,Ft.sunShadowCascade.value=q.state.sunShadowCascade,Ft.directionalShadowMatrix.value=q.state.directionalShadowMatrix,Ft.spotLightMatrix.value=q.state.spotLightMatrix,Ft.spotLightMap.value=q.state.spotLightMap,Ft.pointShadowMatrix.value=q.state.pointShadowMatrix),W.numLightProbeGrids=qu(T.state.lightProbeGridArray),W.currentProgram=fe,W.uniformsList=null,fe}function bm(w,z,K,W,q){let bt=Xt.get(w),Ut=bt.currentProgram.id+","+W+","+q,vt=bt.programVariants.get(Ut);return vt===void 0?(vt=pa(w,z,K),bt.programVariants.set(Ut,vt)):(bt.currentProgram=vt,bt.uniformsList=null,bt.outputColorSpace=W,bt.toneMapping=q),vt}function $u(w){if(w.uniformsList===null){let z=w.currentProgram.getUniforms();w.uniformsList=qr.seqWithValue(z.seq,w.uniforms)}return w.uniformsList}function Yu(w,z){let K=Xt.get(w);K.outputColorSpace=z.outputColorSpace,K.batching=z.batching,K.batchingColor=z.batchingColor,K.instancing=z.instancing,K.instancingColor=z.instancingColor,K.instancingMorph=z.instancingMorph,K.skinning=z.skinning,K.morphTargets=z.morphTargets,K.morphNormals=z.morphNormals,K.morphColors=z.morphColors,K.morphTargetsCount=z.morphTargetsCount,K.numClippingPlanes=z.numClippingPlanes,K.numIntersection=z.numClipIntersection,K.vertexAlphas=z.vertexAlphas,K.vertexTangents=z.vertexTangents,K.toneMapping=z.toneMapping}function Mm(w,z,K,W,q){z.isScene!==!0&&(z=de),Zt.resetTextureUnits();let bt=z.fog,Ut=W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial?z.environment:null,vt=at===null?P.outputColorSpace:at.isXRRenderTarget===!0?at.texture.colorSpace:me.workingColorSpace,Ct=W.isMeshStandardMaterial||W.isMeshLambertMaterial&&!W.envMap||W.isMeshPhongMaterial&&!W.envMap,kt=I.get(W.envMap||Ut,Ct),te=W.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,fe=!!K.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Ft=!!K.morphAttributes.position,pe=!!K.morphAttributes.normal,$e=!!K.morphAttributes.color,Pe=_n;W.toneMapped&&(at===null||at.isXRRenderTarget===!0)&&(Pe=P.toneMapping);let Ce=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,fi=Ce!==void 0?Ce.length:0,Ot=Xt.get(W),wi=T.state.lights;if(ft===!0&&(It===!0||w!==nt)){let ze=w===nt&&W.id===$;tt.setState(W,w,ze)}let be=!1,Ps=!1;W.version===Ot.__version?Ot.needsLights&&Ot.lightsStateVersion!==wi.state.version||q.isBatchedMesh&&Ot.batching===!1||!q.isBatchedMesh&&Ot.batching===!0||q.isBatchedMesh&&Ot.batchingColor===!0&&q._colorsTexture===null||q.isBatchedMesh&&Ot.batchingColor===!1&&q._colorsTexture!==null||q.isInstancedMesh&&Ot.instancing===!1||!q.isInstancedMesh&&Ot.instancing===!0||q.isSkinnedMesh&&Ot.skinning===!1||!q.isSkinnedMesh&&Ot.skinning===!0||q.isInstancedMesh&&Ot.instancingColor===!0&&q.instanceColor===null||q.isInstancedMesh&&Ot.instancingColor===!1&&q.instanceColor!==null||q.isInstancedMesh&&Ot.instancingMorph===!0&&q.morphTexture===null||q.isInstancedMesh&&Ot.instancingMorph===!1&&q.morphTexture!==null||Ot.envMap!==kt||W.fog===!0&&Ot.fog!==bt||Ot.numClippingPlanes!==void 0&&(Ot.numClippingPlanes!==tt.numPlanes||Ot.numIntersection!==tt.numIntersection)||Ot.vertexAlphas!==te||Ot.vertexTangents!==fe||Ot.morphTargets!==Ft||Ot.morphNormals!==pe||Ot.morphColors!==$e||Ot.morphTargetsCount!==fi||Ot.numLightProbeGrids!==qu(T.state.lightProbeGridArray)?be=!0:(Ot.outputColorSpace!==vt||Ot.toneMapping!==Pe)&&(Ps=!0):(be=!0,Ot.__version=W.version);let pi=Ot.currentProgram;(be===!0||Ps===!0)&&(pi=Ps===!0?bm(W,z,q,vt,Pe):pa(W,z,q),N&&W.isNodeMaterial&&N.onUpdateProgram(W,pi,Ot));let Wo=!1,es=!1,Is=!1,xe=pi.getUniforms(),ri=Ot.uniforms;if(yt.useProgram(pi.program)&&(Wo=!0,es=!0,Is=!0),W.id!==$&&($=W.id,es=!0),Wo||nt!==w){yt.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),xe.setValue(B,"projectionMatrix",w.projectionMatrix),xe.setValue(B,"viewMatrix",w.matrixWorldInverse);let ti=xe.map.cameraPosition;ti!==void 0&&ti.setValue(B,ie.setFromMatrixPosition(w.matrixWorld)),Re.logarithmicDepthBuffer&&xe.setValue(B,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&xe.setValue(B,"isOrthographic",w.isOrthographicCamera===!0),nt!==w&&(nt=w,es=!0,Is=!0)}if(Ot.needsLights&&(wi.state.sunShadowMap.length>0&&xe.setValue(B,"sunShadowMap",wi.state.sunShadowMap,Zt),wi.state.directionalShadowMap.length>0&&xe.setValue(B,"directionalShadowMap",wi.state.directionalShadowMap,Zt),wi.state.spotShadowMap.length>0&&xe.setValue(B,"spotShadowMap",wi.state.spotShadowMap,Zt),wi.state.pointShadowMap.length>0&&xe.setValue(B,"pointShadowMap",wi.state.pointShadowMap,Zt)),q.isSkinnedMesh){xe.setOptional(B,q,"bindMatrix"),xe.setOptional(B,q,"bindMatrixInverse");let ze=q.skeleton;ze&&(ze.boneTexture===null&&ze.computeBoneTexture(),xe.setValue(B,"boneTexture",ze.boneTexture,Zt))}q.isBatchedMesh&&(xe.setOptional(B,q,"batchingTexture"),xe.setValue(B,"batchingTexture",q._matricesTexture,Zt),xe.setOptional(B,q,"batchingIdTexture"),xe.setValue(B,"batchingIdTexture",q._indirectTexture,Zt),xe.setOptional(B,q,"batchingColorTexture"),q._colorsTexture!==null&&xe.setValue(B,"batchingColorTexture",q._colorsTexture,Zt));let Zi=K.morphAttributes;if((Zi.position!==void 0||Zi.normal!==void 0||Zi.color!==void 0)&&it.update(q,K,pi),(es||Ot.receiveShadow!==q.receiveShadow)&&(Ot.receiveShadow=q.receiveShadow,xe.setValue(B,"receiveShadow",q.receiveShadow)),(W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial)&&W.envMap===null&&z.environment!==null&&(ri.envMapIntensity.value=z.environmentIntensity),ri.dfgLUT!==void 0&&(ri.dfgLUT.value=U_()),es){if(xe.setValue(B,"toneMappingExposure",P.toneMappingExposure),Ot.needsLights&&Sm(ri,Is),bt&&W.fog===!0&&pt.refreshFogUniforms(ri,bt),pt.refreshMaterialUniforms(ri,W,H,Y,T.state.transmissionRenderTarget[w.id]),Ot.needsLights&&Ot.numLightProbeGrids>0){let ze=v,ti=0;for(let In of T.state.lightProbeGridArray)In.texture!==null&&(ze.textures[ti]=In.texture,ze.min[ti]=In.boundingBox.min,ze.max[ti]=In.boundingBox.max,ze.resolution[ti]=In.resolution,ti++);for(let In in ze)ze[In].length=ti;ri.probesSH.value=ze.textures,ri.probesMin.value=ze.min,ri.probesMax.value=ze.max,ri.probesResolution.value=ze.resolution}qr.upload(B,$u(Ot),ri,Zt)}if(W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(qr.upload(B,$u(Ot),ri,Zt),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&xe.setValue(B,"center",q.center),xe.setValue(B,"modelViewMatrix",q.modelViewMatrix),xe.setValue(B,"normalMatrix",q.normalMatrix),xe.setValue(B,"modelMatrix",q.matrixWorld),W.uniformsGroups!==void 0){let ze=W.uniformsGroups;for(let ti=0,In=ze.length;ti<In;ti++){let Zu=ze[ti];Ht.update(Zu,pi),Ht.bind(Zu,pi)}}return pi}function Sm(w,z){w.ambientLightColor.needsUpdate=z,w.lightProbe.needsUpdate=z,w.sunLights.needsUpdate=z,w.sunLightShadows.needsUpdate=z,w.directionalLights.needsUpdate=z,w.directionalLightShadows.needsUpdate=z,w.pointLights.needsUpdate=z,w.pointLightShadows.needsUpdate=z,w.spotLights.needsUpdate=z,w.spotLightShadows.needsUpdate=z,w.rectAreaLights.needsUpdate=z,w.hemisphereLights.needsUpdate=z}function wm(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return G},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return at},this.setRenderTargetTextures=function(w,z,K){let W=Xt.get(w);W.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,W.__autoAllocateDepthBuffer===!1&&(W.__useRenderToTexture=!1),Xt.get(w.texture).__webglTexture=z,Xt.get(w.depthTexture).__webglTexture=W.__autoAllocateDepthBuffer?void 0:K,W.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,z){let K=Xt.get(w);K.__webglFramebuffer=z,K.__useDefaultFramebuffer=z===void 0},this.setRenderTarget=function(w,z=0,K=0){at=w,G=z,V=K;let W=null,q=!1,bt=!1;if(w){let vt=Xt.get(w);if(vt.__useDefaultFramebuffer!==void 0){yt.bindFramebuffer(B.FRAMEBUFFER,vt.__webglFramebuffer),rt.copy(w.viewport),Dt.copy(w.scissor),Gt=w.scissorTest,yt.viewport(rt),yt.scissor(Dt),yt.setScissorTest(Gt),$=-1;return}else if(vt.__webglFramebuffer===void 0)Zt.setupRenderTarget(w);else if(vt.__hasExternalTextures)Zt.rebindTextures(w,Xt.get(w.texture).__webglTexture,Xt.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){let te=w.depthTexture;if(vt.__boundDepthTexture!==te){if(te!==null&&Xt.has(te)&&(w.width!==te.image.width||w.height!==te.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Zt.setupDepthRenderbuffer(w)}}let Ct=w.texture;(Ct.isData3DTexture||Ct.isDataArrayTexture||Ct.isCompressedArrayTexture)&&(bt=!0);let kt=Xt.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(kt[z])?W=kt[z][K]:W=kt[z],q=!0):w.samples>0&&Zt.useMultisampledRTT(w)===!1?W=Xt.get(w).__webglMultisampledFramebuffer:Array.isArray(kt)?W=kt[K]:W=kt,rt.copy(w.viewport),Dt.copy(w.scissor),Gt=w.scissorTest}else rt.copy(Pt).multiplyScalar(H).floor(),Dt.copy($t).multiplyScalar(H).floor(),Gt=Jt;if(K!==0&&(W=O),yt.bindFramebuffer(B.FRAMEBUFFER,W)&&yt.drawBuffers(w,W),yt.viewport(rt),yt.scissor(Dt),yt.setScissorTest(Gt),q){let vt=Xt.get(w.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+z,vt.__webglTexture,K)}else if(bt){let vt=z;for(let Ct=0;Ct<w.textures.length;Ct++){let kt=Xt.get(w.textures[Ct]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+Ct,kt.__webglTexture,K,vt)}}else if(w!==null&&K!==0){let vt=Xt.get(w.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,vt.__webglTexture,K)}$=-1};function Ku(w){let z=Xt.get(w);return(z.__readFormat!==w.format||z.__readType!==w.type)&&(z.__readFormat=w.format,z.__readType=w.type,z.__formatReadable=Re.textureFormatReadable(w.format),z.__typeReadable=Re.textureTypeReadable(w.type)),z}this.readRenderTargetPixels=function(w,z,K,W,q,bt,Ut,vt=0){if(!(w&&w.isWebGLRenderTarget)){Yt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ct=Xt.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Ut!==void 0&&(Ct=Ct[Ut],Array.isArray(Ct)&&(Ct=Ct[0])),Ct){yt.bindFramebuffer(B.FRAMEBUFFER,Ct);try{let kt=w.textures[vt],te=kt.format,fe=kt.type;w.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+vt);let Ft=Ku(kt);if(Ft.__formatReadable===!1){Yt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ft.__typeReadable===!1){Yt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}z>=0&&z<=w.width-W&&K>=0&&K<=w.height-q&&B.readPixels(z,K,W,q,ut.convert(te),ut.convert(fe),bt)}finally{let kt=at!==null?Xt.get(at).__webglFramebuffer:null;yt.bindFramebuffer(B.FRAMEBUFFER,kt)}}},this.readRenderTargetPixelsAsync=async function(w,z,K,W,q,bt,Ut,vt=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ct=Xt.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Ut!==void 0&&(Ct=Ct[Ut],Array.isArray(Ct)&&(Ct=Ct[0])),Ct)if(z>=0&&z<=w.width-W&&K>=0&&K<=w.height-q){yt.bindFramebuffer(B.FRAMEBUFFER,Ct);let kt=w.textures[vt],te=kt.format,fe=kt.type;w.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+vt);let Ft=Ku(kt);if(Ft.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ft.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let pe=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,pe),B.bufferData(B.PIXEL_PACK_BUFFER,bt.byteLength,B.STREAM_READ),B.readPixels(z,K,W,q,ut.convert(te),ut.convert(fe),0),B.bindBuffer(B.PIXEL_PACK_BUFFER,null);let $e=at!==null?Xt.get(at).__webglFramebuffer:null;yt.bindFramebuffer(B.FRAMEBUFFER,$e);let Pe=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await mp(B,Pe,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,pe),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,bt),B.bindBuffer(B.PIXEL_PACK_BUFFER,null),B.deleteBuffer(pe),B.deleteSync(Pe),bt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,z=null,K=0){let W=Math.pow(2,-K),q=Math.floor(w.image.width*W),bt=Math.floor(w.image.height*W),Ut=z!==null?z.x:0,vt=z!==null?z.y:0;Zt.setTexture2D(w,0),B.copyTexSubImage2D(B.TEXTURE_2D,K,0,0,Ut,vt,q,bt),yt.unbindTexture()},this.copyTextureToTexture=function(w,z,K=null,W=null,q=0,bt=0){let Ut,vt,Ct,kt,te,fe,Ft,pe,$e,Pe=w.isCompressedTexture?w.mipmaps[bt]:w.image;if(K!==null)Ut=K.max.x-K.min.x,vt=K.max.y-K.min.y,Ct=K.isBox3?K.max.z-K.min.z:1,kt=K.min.x,te=K.min.y,fe=K.isBox3?K.min.z:0;else{let xe=Math.pow(2,-q);Ut=Math.floor(Pe.width*xe),vt=Math.floor(Pe.height*xe),w.isDataArrayTexture?Ct=Pe.depth:w.isData3DTexture?Ct=Math.floor(Pe.depth*xe):Ct=1,kt=0,te=0,fe=0}W!==null?(Ft=W.x,pe=W.y,$e=W.z):(Ft=0,pe=0,$e=0);let Ce=ut.convert(z.format),fi=ut.convert(z.type),Ot;z.isData3DTexture?(Zt.setTexture3D(z,0),Ot=B.TEXTURE_3D):z.isDataArrayTexture||z.isCompressedArrayTexture?(Zt.setTexture2DArray(z,0),Ot=B.TEXTURE_2D_ARRAY):(Zt.setTexture2D(z,0),Ot=B.TEXTURE_2D),yt.activeTexture(B.TEXTURE0),yt.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,z.flipY),yt.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),yt.pixelStorei(B.UNPACK_ALIGNMENT,z.unpackAlignment);let wi=yt.getParameter(B.UNPACK_ROW_LENGTH),be=yt.getParameter(B.UNPACK_IMAGE_HEIGHT),Ps=yt.getParameter(B.UNPACK_SKIP_PIXELS),pi=yt.getParameter(B.UNPACK_SKIP_ROWS),Wo=yt.getParameter(B.UNPACK_SKIP_IMAGES);yt.pixelStorei(B.UNPACK_ROW_LENGTH,Pe.width),yt.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Pe.height),yt.pixelStorei(B.UNPACK_SKIP_PIXELS,kt),yt.pixelStorei(B.UNPACK_SKIP_ROWS,te),yt.pixelStorei(B.UNPACK_SKIP_IMAGES,fe);let es=w.isDataArrayTexture||w.isData3DTexture,Is=z.isDataArrayTexture||z.isData3DTexture;if(w.isDepthTexture){let xe=Xt.get(w),ri=Xt.get(z),Zi=Xt.get(xe.__renderTarget),ze=Xt.get(ri.__renderTarget);yt.bindFramebuffer(B.READ_FRAMEBUFFER,Zi.__webglFramebuffer),yt.bindFramebuffer(B.DRAW_FRAMEBUFFER,ze.__webglFramebuffer);for(let ti=0;ti<Ct;ti++)es&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Xt.get(w).__webglTexture,q,fe+ti),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Xt.get(z).__webglTexture,bt,$e+ti)),B.blitFramebuffer(kt,te,kt+Ut,te+vt,Ft,pe,Ft+Ut,pe+vt,B.DEPTH_BUFFER_BIT,B.NEAREST);yt.bindFramebuffer(B.READ_FRAMEBUFFER,null),yt.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(q!==0||w.isRenderTargetTexture||Xt.has(w)){let xe=Xt.get(w),ri=Xt.get(z);yt.bindFramebuffer(B.READ_FRAMEBUFFER,L),yt.bindFramebuffer(B.DRAW_FRAMEBUFFER,k);for(let Zi=0;Zi<Ct;Zi++)es?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,xe.__webglTexture,q,fe+Zi):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,xe.__webglTexture,q),Is?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,ri.__webglTexture,bt,$e+Zi):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,ri.__webglTexture,bt),q!==0?B.blitFramebuffer(kt,te,kt+Ut,te+vt,Ft,pe,Ft+Ut,pe+vt,B.COLOR_BUFFER_BIT,B.NEAREST):Is?B.copyTexSubImage3D(Ot,bt,Ft,pe,$e+Zi,kt,te,Ut,vt):B.copyTexSubImage2D(Ot,bt,Ft,pe,kt,te,Ut,vt);yt.bindFramebuffer(B.READ_FRAMEBUFFER,null),yt.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else Is?w.isDataTexture||w.isData3DTexture?B.texSubImage3D(Ot,bt,Ft,pe,$e,Ut,vt,Ct,Ce,fi,Pe.data):z.isCompressedArrayTexture?B.compressedTexSubImage3D(Ot,bt,Ft,pe,$e,Ut,vt,Ct,Ce,Pe.data):B.texSubImage3D(Ot,bt,Ft,pe,$e,Ut,vt,Ct,Ce,fi,Pe):w.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,bt,Ft,pe,Ut,vt,Ce,fi,Pe.data):w.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,bt,Ft,pe,Pe.width,Pe.height,Ce,Pe.data):B.texSubImage2D(B.TEXTURE_2D,bt,Ft,pe,Ut,vt,Ce,fi,Pe);yt.pixelStorei(B.UNPACK_ROW_LENGTH,wi),yt.pixelStorei(B.UNPACK_IMAGE_HEIGHT,be),yt.pixelStorei(B.UNPACK_SKIP_PIXELS,Ps),yt.pixelStorei(B.UNPACK_SKIP_ROWS,pi),yt.pixelStorei(B.UNPACK_SKIP_IMAGES,Wo),bt===0&&z.generateMipmaps===!0&&z.mipmapsAutoUpdate===!0&&B.generateMipmap(Ot),yt.unbindTexture()},this.initRenderTarget=function(w){Xt.get(w).__webglFramebuffer===void 0&&Zt.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?Zt.setTextureCube(w,0):w.isData3DTexture?Zt.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?Zt.setTexture2DArray(w,0):Zt.setTexture2D(w,0),yt.unbindTexture()},this.resetState=function(){G=0,V=0,at=null,yt.reset(),mt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Vi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=me._getDrawingBufferColorSpace(t),e.unpackColorSpace=me._getUnpackColorSpace()}};var F_=new Vn(-1,1,1,-1,0,1),ru=class extends ve{constructor(){super(),this.setAttribute("position",new Wt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Wt([0,2,0,0,2,0],2))}},O_=new ru,$c=class{constructor(t){this._mesh=new Rt(O_,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,F_)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var k_="varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",z_=`uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThreshold; varying vec2 vUv;
  vec3 pick(vec2 o){ vec3 c = min(texture2D(tSrc, vUv + uTexel * o).rgb, vec3(12.0));
    return c * smoothstep(uThreshold, uThreshold + 0.12, dot(c, vec3(0.2126, 0.7152, 0.0722))); }
  void main(){ gl_FragColor = vec4((pick(vec2(-1.0, -1.0)) + pick(vec2(1.0, -1.0)) + pick(vec2(-1.0, 1.0)) + pick(vec2(1.0, 1.0))) * 0.25, 1.0); }`,B_=`uniform sampler2D tSrc; uniform vec2 uTexel; varying vec2 vUv;
  void main(){ vec3 s = texture2D(tSrc, vUv).rgb * 4.0;
    s += texture2D(tSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb + texture2D(tSrc, vUv + uTexel * vec2(1.0, -1.0)).rgb;
    s += texture2D(tSrc, vUv + uTexel * vec2(-1.0, 1.0)).rgb + texture2D(tSrc, vUv + uTexel * vec2(1.0, 1.0)).rgb;
    gl_FragColor = vec4(s * 0.125, 1.0); }`,H_=`uniform sampler2D tSrc; uniform sampler2D tAdd; uniform vec2 uTexel; varying vec2 vUv;
  void main(){ vec2 o = uTexel * 0.5;
    vec3 s = texture2D(tSrc, vUv + vec2(-2.0 * o.x, 0.0)).rgb + texture2D(tSrc, vUv + vec2(2.0 * o.x, 0.0)).rgb;
    s += texture2D(tSrc, vUv + vec2(0.0, -2.0 * o.y)).rgb + texture2D(tSrc, vUv + vec2(0.0, 2.0 * o.y)).rgb;
    s += (texture2D(tSrc, vUv + vec2(-o.x, o.y)).rgb + texture2D(tSrc, vUv + o).rgb + texture2D(tSrc, vUv - o).rgb + texture2D(tSrc, vUv + vec2(o.x, -o.y)).rgb) * 2.0;
    gl_FragColor = vec4(texture2D(tAdd, vUv).rgb + s / 12.0, 1.0); }`,G_=`uniform sampler2D tScene; uniform sampler2D tBloom; uniform float uBloom, uSat, uCon, uVig; varying vec2 vUv;
  void main(){ vec3 c = texture2D(tScene, vUv).rgb + texture2D(tBloom, vUv).rgb * uBloom;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    c = mix(vec3(l), c, uSat);
    c = max((c - 0.18) * uCon + 0.18, 0.0);
    c *= 1.0 - uVig * smoothstep(0.42, 0.95, distance(vUv, vec2(0.5)));
    gl_FragColor = vec4(c, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    // \u0435\u0434\u0432\u0430 \u0437\u0430\u043C\u0435\u0442\u043D\u044B\u0439 \u0448\u0443\u043C: \u0431\u0435\u0437 \u043D\u0435\u0433\u043E \u043D\u0430 \u043D\u0435\u0431\u0435 \u0432\u0438\u0434\u043D\u044B \u043F\u043E\u043B\u043E\u0441\u044B
    float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    gl_FragColor.rgb += (n - 0.5) / 255.0; }`,Ys=6,V_=56e5,Yc=(n,t)=>new Ge({vertexShader:k_,fragmentShader:n,uniforms:t,depthTest:!1,depthWrite:!1}),W_=["low","medium","high"],Kc=class{constructor(t,e){let i=this.renderer=new $r({canvas:t,antialias:!0,powerPreference:"high-performance",stencil:!1});i.outputColorSpace=Oe,i.toneMapping=Ws,i.shadowMap.enabled=!0,i.shadowMap.type=Hs,this.canPost=i.capabilities.isWebGL2!==!1&&(i.extensions.has("EXT_color_buffer_float")||i.extensions.has("EXT_color_buffer_half_float")),this.post=null,this.quality=null,this.w=this.h=0,this.ratio=0,this.setQuality(e||"high")}setQuality(t){if(W_.includes(t)||(t="high"),t===this.quality)return;this.quality=t;let e=this.renderer;e.shadowMap.enabled=t!=="low",e.shadowMap.needsUpdate=!0,this.dropPost(),this.w=0,this.resize()}pixelRatio(t,e){let i=window.devicePixelRatio||1;return this.quality==="low"?Math.min(i,1):this.quality==="medium"?Math.min(i,1.5):Math.min(i,2,Math.max(1,Math.sqrt(V_/Math.max(1,t*e))))}resize(){let t=this.renderer.domElement,e=t.clientWidth||window.innerWidth,i=t.clientHeight||window.innerHeight,s=this.pixelRatio(e,i);if(e===this.w&&i===this.h&&s===this.ratio)return!1;let r=e!==this.w||i!==this.h;return this.w=e,this.h=i,this.ratio=s,this.renderer.setPixelRatio(s),this.renderer.setSize(e,i,!1),this.post&&this.sizePost(),r}dropPost(){let t=this.post;if(t){for(let e of[t.scene,...t.down,...t.up])e.dispose();for(let e of[t.pre,t.downM,t.upM,t.final])e.dispose();t.quad.dispose(),this.post=null}}ensurePost(){if(this.post)return;let t={type:Li,depthBuffer:!1},e=this.post={scene:new ai(4,4,{type:Li,samples:4}),down:Array.from({length:Ys},()=>new ai(4,4,t)),up:Array.from({length:Ys-1},()=>new ai(4,4,t)),pre:Yc(z_,{tSrc:{value:null},uTexel:{value:new dt},uThreshold:{value:1}}),downM:Yc(B_,{tSrc:{value:null},uTexel:{value:new dt}}),upM:Yc(H_,{tSrc:{value:null},tAdd:{value:null},uTexel:{value:new dt}}),final:Yc(G_,{tScene:{value:null},tBloom:{value:null},uBloom:{value:.115},uSat:{value:1.1},uCon:{value:1.05},uVig:{value:.32}}),quad:new $c(null)};e.final.uniforms.tScene.value=e.scene.texture,e.final.uniforms.tBloom.value=e.up[0].texture,this.sizePost()}sizePost(){let t=this.post,e=this.renderer.getDrawingBufferSize(new dt);t.scene.setSize(e.x,e.y);let i=Math.max(2,Math.round(e.x/4)),s=Math.max(2,Math.round(e.y/4));for(let r=0;r<Ys;r++)t.down[r].setSize(i,s),r<Ys-1&&t.up[r].setSize(i,s),i=Math.max(2,Math.round(i/2)),s=Math.max(2,Math.round(s/2))}render(t,e,i=1){let s=this.renderer;if(s.toneMappingExposure=i,this.quality!=="high"||!this.canPost)return s.render(t,e);this.ensurePost();let r=this.post,a=(l,c)=>{r.quad.material=l,s.setRenderTarget(c),r.quad.render(s)};s.setRenderTarget(r.scene),s.render(t,e),r.pre.uniforms.tSrc.value=r.scene.texture,r.pre.uniforms.uTexel.value.set(1/r.scene.width,1/r.scene.height),a(r.pre,r.down[0]);for(let l=1;l<Ys;l++)r.downM.uniforms.tSrc.value=r.down[l-1].texture,r.downM.uniforms.uTexel.value.set(1/r.down[l-1].width,1/r.down[l-1].height),a(r.downM,r.down[l]);let o=r.down[Ys-1];for(let l=Ys-2;l>=0;l--)r.upM.uniforms.tSrc.value=o.texture,r.upM.uniforms.tAdd.value=r.down[l].texture,r.upM.uniforms.uTexel.value.set(1/o.width,1/o.height),a(r.upM,r.up[l]),o=r.up[l];a(r.final,null)}};var ne=(n,t,e)=>Math.max(t,Math.min(e,n)),$i=(n,t,e)=>n+(t-n)*e,Ie=(n,t,e)=>{let i=ne((e-n)/(t-n),0,1);return i*i*(3-2*i)},_i=(n,t,e,i)=>n+(t-n)*(1-Math.exp(-e*i)),le=Math.PI*2;function wo(n,t){let e=(t-n)%le;return e>Math.PI&&(e-=le),e<-Math.PI&&(e+=le),e}function bi(n){let t=n>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function Zc(n,t){let e=Math.imul(n,374761393)^Math.imul(t,668265263);return e=Math.imul(e^e>>>13,1274126177),((e^e>>>16)>>>0)/4294967296}function X_(n,t){let e=Math.floor(n),i=Math.floor(t),s=n-e,r=t-i,a=s*s*(3-2*s),o=r*r*(3-2*r),l=Zc(e,i),c=Zc(e+1,i),u=Zc(e,i+1),h=Zc(e+1,i+1);return l+(c-l)*a+(u-l)*o+(l-c-u+h)*a*o}function on(n,t,e=4){let i=0,s=.5,r=1;for(let a=0;a<e;a++)i+=s*X_(n*r,t*r),r*=2.03,s*=.5;return i/(1-Math.pow(.5,e))}function Mn(n,t,e,i={}){let s=document.createElement("canvas");s.width=n,s.height=t;let r=s.getContext("2d");e(r,n,t);let a=new yn(s);return a.colorSpace=i.data?an:Oe,i.repeat&&(a.wrapS=a.wrapT=en,Array.isArray(i.repeat)&&a.repeat.set(i.repeat[0],i.repeat[1])),a.anisotropy=i.aniso||4,i.nearest&&(a.magFilter=We,a.minFilter=We),a}var au=new Map;function ln(n,t=.85,e=0,i=null){let s=i?null:`${n}|${t}|${e}`;if(s&&au.has(s))return au.get(s);let r=new Me({color:n,roughness:t,metalness:e,...i||{}});return s&&au.set(s,r),r}function zt(n,t){let e=new Lt(n);return t>=0?e.lerp(new Lt("#ffffff"),t):e.lerp(new Lt("#000000"),-t),"#"+e.getHexString()}function Kr(n,t=1,e=.38){let i=new zs(1,t),s=i.attributes.position,r=bi(n),a=r()*50,o=r()*50,l=new D;for(let c=0;c<s.count;c++){l.fromBufferAttribute(s,c);let h=1+(on(l.x*1.3+a+l.z*.7,l.y*1.3+o-l.z*.5,3)-.5)*2*e;s.setXYZ(c,l.x*h,l.y*h*.85,l.z*h)}return i.computeVertexNormals(),i}var i0=()=>"ontouchstart"in window&&matchMedia("(pointer: coarse)").matches,se=n=>String(n).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]),Mt=(n,t=document)=>t.querySelector(n),ou=(n,t=document)=>[...t.querySelectorAll(n)];function Eo(n,t,e){let i=document.createElement(n);return t&&(i.className=t),e!=null&&(i.innerHTML=e),i}var Ve=1.1,Ae={x:22,z:-100},Mi={x:66,z:-50},Ks={x:-40,z:13,r:14},Zs={x:21,z:-15},De={ax:32,az:13,bx:41,bz:-9,r:3.6},Js={x:-5.6,z:12.8,r:3.2},lu={x:-2,z:9},Pi={x0:-170,x1:170,z0:-190,z1:90},qn={x0:-78,x1:100,z0:-142,z1:36},js=[{id:"deck",x0:-14,x1:6,z0:4,z1:16,along:"z"},{id:"pier",x0:-1.6,x1:1.6,z0:-22,z1:4,along:"z"},{id:"head",x0:-6,x1:6,z0:-27,z1:-22,along:"x"},{id:"walk",x0:-29,x1:-14,z0:7.5,z1:10.3,along:"x"},{id:"west",x0:-35,x1:-29,z0:5,z1:12.5,along:"x"}],q_=[{x0:-13.4,x1:-6.9,z0:10,z1:15.7}],$_=[{x:-12.4,z:5.6,r:.75},{x:-11.2,z:5.3,r:.6},{x:4.6,z:14.6,r:.8},{x:4.9,z:5.2,r:.55},{x:-5.9,z:15.2,r:.55},{x:5.2,z:-26.2,r:.45}];function cn(n){let t=13+1.8*Math.sin((n+4)*.045)*Ie(8,30,Math.abs(n+4)),e=(n-Ks.x)/13;return t+=11*Math.exp(-e*e),t-=95*Ie(-58,-115,n),t+=6*Ie(40,110,n),t}function Y_(n,t){let e=t-cn(n),i=Ie(-60,-92,n),s=-14*Math.pow(Ie(0,-75,e),.9);return e>-1.6?(s+=(1.12+5.5*i)*Ie(-1.5,3,e),e>3&&(s+=.035*Math.min(e-3,30),s+=9*Ie(9,46,e)*(.45+.55*on(n*.035,t*.035,3)),s+=20*Ie(42,85,e))):s+=(on(n*.09,t*.09,3)-.5)*1.1*Ie(-6,-30,e),s}function ys(n){return 30+4.5*Math.sin(3*n+1)+2.5*Math.sin(5*n+2.2)+1.5*Math.sin(9*n)}function K_(n,t){let e=n-Ae.x,i=t-Ae.z,s=Math.hypot(e,i);if(s>64)return-99;let r=ys(Math.atan2(i,e)),a=10.5+3*on(n*.06+7,t*.06+3,3)+8*Math.exp(-((e-8)**2+(i+3)**2)/110),o=Ie(r+1.5,r-4.5,s);return(-.9-13*Ie(r,r+24,s))*(1-o)+a*Math.pow(o,.7)}function Zr(n,t){let e=De.bx-De.ax,i=De.bz-De.az,s=ne(((n-De.ax)*e+(t-De.az)*i)/(e*e+i*i),0,1);return Math.hypot(n-De.ax-e*s,t-De.az-i*s)}function Se(n,t){let e=Y_(n,t),i=K_(n,t);i>e&&(e=i);let s=(n-Zs.x)**2+(t-Zs.z)**2;s<600&&(e=Math.max(e,-9+8.2*Math.exp(-s/40)));let r=Zr(n,t);return r<De.r+4&&(e=Math.max(e,-6+7.25*Ie(De.r+3,De.r-.8,r))),e}var cu=[Math.PI/2+.5,Math.PI/2-.42].map(n=>{let t=ys(n),e=Math.cos(n),i=Math.sin(n);return{x:Ae.x+e*(t-.6),z:Ae.z+i*(t-.6),nx:e,nz:i,bx:Ae.x+e*(t+2.2),bz:Ae.z+i*(t+2.2),top:Se(Ae.x+e*(t-5.5),Ae.z+i*(t-5.5))}}),$n={x:Ae.x+8,z:Ae.z-3};function zi(n,t,e=0){for(let i of js)if(n>=i.x0+e&&n<=i.x1-e&&t>=i.z0+e&&t<=i.z1-e)return i;return null}function Z_(n,t){let e=99;for(let i of js){let s=Math.max(i.x0-n,0,n-i.x1),r=Math.max(i.z0-t,0,t-i.z1);e=Math.min(e,Math.hypot(s,r))}return e}var Jc=(n,t)=>zi(n,t,-.05)?Ve:Se(n,t),vs=.1,J_=.62;function j_(n,t){return!!(zi(n-vs,t-vs)&&zi(n+vs,t-vs)&&zi(n-vs,t+vs)&&zi(n+vs,t+vs))}function To(n,t){for(let e of q_)if(n>e.x0&&n<e.x1&&t>e.z0&&t<e.z1)return!1;for(let e of $_)if((n-e.x)**2+(t-e.z)**2<e.r*e.r)return!1;return j_(n,t)?!0:n<-54||n>47||t<-12.6||Se(n,t)<-J_?!1:t-cn(n)<13.5}function jc(n,t){let e=-Se(n,t);if(e<.25)return null;let i=Z_(n,t)<2.4,s,r=cu.some(l=>(n-l.bx)**2+(t-l.bz)**2<100),a=n-Ae.x,o=t-Ae.z;return Math.hypot(n-Ks.x,t-Ks.z)<Ks.r&&n<-25?s="backwater":r?s="falls":Math.hypot(n-Mi.x,t-Mi.z)<14?s="arch":Math.hypot(a,o)-ys(Math.atan2(o,a))<13||Math.hypot(n-Zs.x,t-Zs.z)<9.5||Zr(n,t)<De.r+7&&e<7?s="reef":i&&e<3.8?s="pier":s=e<2.5?"shallow":e<6?"mid":"deep",{depth:e,zone:s,pier:i}}var hu=[[-8,-9],[9,-7],[13,-31],[-14,-39],[1,-45],[22,-23],[-39,11],[8,-66],[33,-66],[60,-42],[14,-52],[-24,-19],[42,-27],[-33,2],[-4,-33]];var n0=[[.8,.6,.22,.09,.9],[-.4,.92,.45,.05,1.3],[.95,-.3,.9,.022,1.9]],Q_=(n,t)=>{let e=Math.max(0,Math.min(1,(-Se(n,t)-.4)/5.6));return .12+.88*e*e*(3-2*e)};function _s(n,t,e){let i=0;for(let[s,r,a,o,l]of n0)i+=o*Math.sin((n*s+t*r)*a+e*l);return i*Q_(n,t)}function tb(n,t,e){let i=Math.floor(n),s=Math.floor(t),r=n-i,a=t-s,o=(u,h)=>{u=(u%e+e)%e,h=(h%e+e)%e;let d=Math.imul(u,374761393)^Math.imul(h,668265263);return d=Math.imul(d^d>>>13,1274126177),((d^d>>>16)>>>0)/4294967296},l=r*r*(3-2*r),c=a*a*(3-2*a);return o(i,s)*(1-l)*(1-c)+o(i+1,s)*l*(1-c)+o(i,s+1)*(1-l)*c+o(i+1,s+1)*l*c}function eb(n=256){let t=new Float32Array(n*n);for(let r=0;r<n;r++)for(let a=0;a<n;a++){let o=0,l=1;for(let c of[4,8,16,32])o+=l*tb(a/n*c,r/n*c,c),l*=.55;t[r*n+a]=o}let e=new Uint8Array(n*n*4),i=(r,a)=>t[(a+n)%n*n+(r+n)%n];for(let r=0;r<n;r++)for(let a=0;a<n;a++){let o=(i(a+1,r)-i(a-1,r))*3.2,l=(i(a,r+1)-i(a,r-1))*3.2,c=Math.hypot(o,l,1),u=(r*n+a)*4;e[u]=-o/c*127+128,e[u+1]=-l/c*127+128,e[u+2]=1/c*255,e[u+3]=255}let s=new Bn(e,n,n,Ri);return s.wrapS=s.wrapT=en,s.magFilter=Ke,s.minFilter=Xi,s.generateMipmaps=!0,s.needsUpdate=!0,s}function ib(n=256,t=7){let e=[],i=7,s=()=>(i=Math.imul(i,1103515245)+12345>>>0)/4294967296;for(let o=0;o<t*t;o++)e.push([s(),s()]);let r=new Uint8Array(n*n*4);for(let o=0;o<n;o++)for(let l=0;l<n;l++){let c=l/n*t,u=o/n*t,h=Math.floor(c),d=Math.floor(u),f=9,p=9;for(let b=-1;b<=1;b++)for(let v=-1;v<=1;v++){let E=h+v,T=d+b,y=e[(T%t+t)%t*t+(E%t+t)%t],M=Math.hypot(E+y[0]-c,T+y[1]-u);M<f?(p=f,f=M):M<p&&(p=M)}let x=p-f,m=Math.max(0,1-x/.16),g=Math.pow(m,1.6)*255,_=(o*n+l)*4;r[_]=r[_+1]=r[_+2]=g,r[_+3]=255}let a=new Bn(r,n,n,Ri);return a.wrapS=a.wrapT=en,a.magFilter=Ke,a.minFilter=Xi,a.generateMipmaps=!0,a.needsUpdate=!0,a}function nb(n=400,t=330){let e=new Uint8Array(n*t*4);for(let s=0;s<t;s++)for(let r=0;r<n;r++){let a=Pi.x0+(r+.5)/n*(Pi.x1-Pi.x0),o=Pi.z0+(s+.5)/t*(Pi.z1-Pi.z0),l=Math.max(0,Math.min(16,-Se(a,o))),c=(s*n+r)*4;e[c]=e[c+1]=e[c+2]=Math.sqrt(l/16)*255,e[c+3]=255}let i=new Bn(e,n,t,Ri);return i.magFilter=Ke,i.minFilter=Ke,i.wrapS=i.wrapT=Gi,i.needsUpdate=!0,i}var s0=n0.map(([n,t,e,i,s],r)=>`
  { float ph = dot(p, vec2(${n.toFixed(3)}, ${t.toFixed(3)})) * ${e.toFixed(3)} + uTime * ${s.toFixed(3)};
    h += ${i.toFixed(4)} * sin(ph); g += vec2(${n.toFixed(3)}, ${t.toFixed(3)}) * (${(i*e).toFixed(5)} * cos(ph)); }`).join(""),sb=`
uniform float uTime;
uniform sampler2D uDepth;
uniform vec4 uBounds;
varying vec3 vWorld;
varying float vAmp;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec2 p = wp.xz; float h = 0.0; vec2 g = vec2(0.0);
  ${s0}
  float dv = texture2D(uDepth, (p - uBounds.xy) * uBounds.zw).r;
  float t = clamp((dv * dv * 16.0 - 0.4) / 5.6, 0.0, 1.0);
  vAmp = 0.12 + 0.88 * t * t * (3.0 - 2.0 * t);
  wp.y += h * vAmp;
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`,rb=`
precision highp float;
uniform float uTime, uGlitter, uFogNear, uFogFar;
uniform sampler2D uDepth, uNormal, uCaustic;
uniform vec4 uBounds;
uniform vec3 uShallow, uDeep, uSkyZen, uSkyHor, uSunDir, uSunCol, uFogCol;
varying vec3 vWorld;
varying float vAmp;
float ss(float a, float b, float x) { float t = clamp((x - a) / (b - a), 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
void main() {
  vec2 p = vWorld.xz; float h = 0.0; vec2 g = vec2(0.0);
  ${s0}
  g *= vAmp;
  vec2 uv = (p - uBounds.xy) * uBounds.zw;
  float dv = texture2D(uDepth, uv).r;
  float depth = dv * dv * 16.0;
  vec3 n1 = texture2D(uNormal, p * 0.045 + uTime * vec2(0.012, 0.008)).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D(uNormal, p * 0.13 + uTime * vec2(-0.017, 0.012)).xyz * 2.0 - 1.0;
  float dist = length(cameraPosition - vWorld);
  float calm = 1.0 / (1.0 + dist * 0.012);
  vec3 N = normalize(vec3(-g.x - (n1.x + n2.x * 0.7) * 0.2 * calm, 1.0, -g.y - (n1.y + n2.y * 0.7) * 0.2 * calm));
  vec3 V = normalize(cameraPosition - vWorld);
  float ndv = max(dot(N, V), 0.0);
  float fres = 0.025 + 0.975 * pow(1.0 - ndv, 5.0);

  vec3 c = mix(uShallow, uDeep, ss(0.8, 9.5, depth));
  c = mix(uShallow * 1.12 + vec3(0.05, 0.07, 0.04), c, ss(0.0, 1.6, depth));

  // \u0441\u0435\u0442\u043A\u0430 \u0441\u0432\u0435\u0442\u0430 \u043D\u0430 \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u0438 \u2014 \u043A\u0430\u043A \u043D\u0430 \u043C\u0435\u043B\u043A\u043E\u0432\u043E\u0434\u044C\u0435 \u0432 \u044F\u0441\u043D\u044B\u0439 \u0434\u0435\u043D\u044C
  float c1 = texture2D(uCaustic, p * 0.075 + uTime * vec2(0.011, 0.007) + n1.xy * 0.035).r;
  float c2 = texture2D(uCaustic, p * 0.11 - uTime * vec2(0.009, 0.013) + n2.xy * 0.03).r;
  float net = max(c1 * 0.75, c2 * 0.55) * (1.0 - 0.55 * ss(3.0, 12.0, depth));
  c += uSunCol * net * 0.2 * uGlitter / (1.0 + dist * 0.018);

  vec3 R = reflect(-V, N);
  vec3 sky = mix(uSkyHor, uSkyZen, pow(max(R.y, 0.0), 0.55));
  c = mix(c, sky, fres * 0.8);
  float rs = max(dot(R, uSunDir), 0.0);
  c += uSunCol * (pow(rs, 380.0) * 3.0 + pow(rs, 28.0) * 0.1) * uGlitter;

  // \u043F\u0435\u043D\u0430: \u043A\u0440\u043E\u043C\u043A\u0430 \u0431\u0435\u0440\u0435\u0433\u0430 \u0438 \u043D\u0430\u0431\u0435\u0433\u0430\u044E\u0449\u0438\u0435 \u043F\u043E\u043B\u043E\u0441\u044B
  float edge = 1.0 - ss(0.0, 0.5, depth + n1.x * 0.14);
  float band = ss(0.62, 0.8, sin(depth * 8.0 - uTime * 1.5 + n2.x * 3.0) * 0.5 + 0.5) * (1.0 - ss(0.25, 1.25, depth));
  float foam = clamp(edge + band * 0.55, 0.0, 1.0) * step(0.004, dv);
  vec3 foamCol = mix(vec3(1.0), uSkyHor, 0.25) * (0.35 + 0.65 * clamp(uGlitter + 0.25, 0.0, 1.0));
  c = mix(c, foamCol, foam * 0.85);

  float alpha = mix(0.3, 0.965, ss(0.0, 5.0, depth));
  alpha = max(alpha, max(fres * 0.9, foam));
  float fog = ss(uFogNear, uFogFar, dist);
  c = mix(c, uFogCol, fog);
  gl_FragColor = vec4(c, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function r0(){let t=new Float32Array(87723),e=[],i=l=>190*l+1700*l*l*l*l*l;for(let l=0;l<=170;l++)for(let c=0;c<=170;c++){let u=(l*171+c)*3;t[u]=i(c/170*2-1),t[u+1]=0,t[u+2]=i(l/170*2-1)}for(let l=0;l<170;l++)for(let c=0;c<170;c++){let u=l*171+c;e.push(u,u+170+1,u+1,u+1,u+170+1,u+170+2)}let s=new ve;s.setAttribute("position",new ni(t,3)),s.setIndex(e);let r={uTime:{value:0},uGlitter:{value:1},uFogNear:{value:150},uFogFar:{value:1400},uDepth:{value:nb()},uNormal:{value:eb()},uCaustic:{value:ib()},uBounds:{value:new _e(Pi.x0,Pi.z0,1/(Pi.x1-Pi.x0),1/(Pi.z1-Pi.z0))},uShallow:{value:new Lt("#35e0d4")},uDeep:{value:new Lt("#1273c4")},uSkyZen:{value:new Lt("#1f7fe0")},uSkyHor:{value:new Lt("#a6dcff")},uSunDir:{value:new D(0,1,0)},uSunCol:{value:new Lt("#fff4e0")},uFogCol:{value:new Lt("#a6dcff")}},a=new Ge({uniforms:r,vertexShader:sb,fragmentShader:rb,transparent:!0,depthWrite:!1}),o=new Rt(s,a);return o.position.set(5,0,-40),o.frustumCulled=!1,o.renderOrder=2,{mesh:o,uniforms:r}}var tr=new D,Jr=new D,a0=new Kt,ab=new ge,o0=new si,l0=new nn,Qc=new Lt,th=new Lt;function A(n,t,e,i=1,s=i,r=i,a=0,o=0,l=0){return l0.set(a,o,l,"YXZ"),o0.setFromEuler(l0),ab.compose(tr.set(n,t,e),o0,Jr.set(i,s,r)).clone()}var c0=new Map,R={box:()=>Qs("box",()=>new cs(1,1,1)),cyl:(n=10,t=1,e=1)=>Qs(`cyl${n}|${t}|${e}`,()=>new Fi(.5*t,.5*e,1,n)),cone:(n=8)=>Qs("cone"+n,()=>new Os(.5,1,n)),sph:(n=12,t=8)=>Qs(`sph${n}|${t}`,()=>new xi(.5,n,t)),ico:(n=1)=>Qs("ico"+n,()=>new zs(.5,n)),torus:(n=.18,t=14,e=Math.PI*2)=>Qs(`tor${n}|${t}|${e.toFixed(3)}`,()=>new hs(.5,n*.5,6,t,e)),prism:()=>Qs("prism",()=>{let n=new Gn;n.moveTo(-.5,0),n.lineTo(.5,0),n.lineTo(0,1),n.closePath();let t=new Qa(n,{depth:1,bevelEnabled:!1});return t.translate(0,0,-.5),t})};function Qs(n,t){let e=c0.get(n);return e||c0.set(n,e=t()),e}var h0=new WeakMap,d0=new WeakMap,Te=class{constructor(){this.pos=[],this.nor=[],this.col=[]}add(t,e,i,s=null){let r=h0.get(t);r||h0.set(t,r=t.index?t.toNonIndexed():t);let a=r.attributes.position,o=r.attributes.normal;if(s&&s.flat){let u=d0.get(t);u||(u=r.clone(),u.computeVertexNormals(),d0.set(t,u)),o=u.attributes.normal}Qc.set(e),a0.getNormalMatrix(i);let l=1/0,c=-1/0;if(s&&s.grad)for(let u=0;u<a.count;u++){let h=a.getY(u);h<l&&(l=h),h>c&&(c=h)}s&&s.top&&th.set(s.top[0]);for(let u=0;u<a.count;u++){tr.fromBufferAttribute(a,u);let h=1;s&&s.grad&&(h=s.grad[0]+(s.grad[1]-s.grad[0])*(tr.y-l)/Math.max(1e-6,c-l)),tr.applyMatrix4(i),this.pos.push(tr.x,tr.y,tr.z),Jr.fromBufferAttribute(o,u).applyMatrix3(a0).normalize(),this.nor.push(Jr.x,Jr.y,Jr.z),s&&s.top&&Jr.y>s.top[1]?this.col.push(th.r*h,th.g*h,th.b*h):this.col.push(Qc.r*h,Qc.g*h,Qc.b*h)}return this}get empty(){return!this.pos.length}build(t,e=!0){let i=new ve;i.setAttribute("position",new Wt(this.pos,3)),i.setAttribute("normal",new Wt(this.nor,3)),i.setAttribute("color",new Wt(this.col,3)),i.computeBoundingSphere();let s=new Rt(i,t||Yi);return s.castShadow=e,s.receiveShadow=!0,this.pos=this.nor=this.col=null,s}},Yi=new Me({vertexColors:!0,roughness:.88,metalness:0}),Ao=new Me({vertexColors:!0,roughness:.88,metalness:0,side:Xe});var u0=["#c58a4e","#b97c42","#d39a5d","#a86f3a","#c9945a"],er="#7a5230",x0="#ead9a7",ob=[[1.92,-9,-1],[-6.18,-22.3,1],[6.18,4.3,-1],[-29.25,12.7,-1],[-6.5,9.7,1]];function lb(n,t){for(let e of js){let i=e.along==="z",s=i?e.z1-e.z0:e.x1-e.x0,r=i?e.x1-e.x0:e.z1-e.z0,a=Math.round(s/.27),o=s/a;for(let m=0;m<a;m++){let g=(i?e.z0:e.x0)+(m+.5)*o,_=[-.07];if(r>5){let b=1.8+t()*2.8;for(;b<r-1.5;)_.push(b),b+=2.4+t()*3}_.push(r+.07);for(let b=0;b<_.length-1;b++){let v=_[b+1]-_[b]-.03,E=(i?e.x0:e.z0)+(_[b]+_[b+1])/2,T=zt(u0[Math.floor(t()*u0.length)],(t()-.5)*.18),y=Ve-.04+(t()-.5)*.012;i?n.add(R.box(),T,A(E,y,g,v,.08,o-.016,0,(t()-.5)*.012,0)):n.add(R.box(),T,A(g,y,E,o-.016,.08,v,0,(t()-.5)*.012,0))}}let l=(e.x0+e.x1)/2,c=(e.z0+e.z1)/2,u=Ve-.2;n.add(R.box(),"#2a1c10",A(l,Ve-.1,c,e.x1-e.x0-.06,.03,e.z1-e.z0-.06)),n.add(R.box(),er,A(l,u,e.z0+.05,e.x1-e.x0,.24,.12)),n.add(R.box(),er,A(l,u,e.z1-.05,e.x1-e.x0,.24,.12)),n.add(R.box(),er,A(e.x0+.05,u,c,.12,.24,e.z1-e.z0)),n.add(R.box(),er,A(e.x1-.05,u,c,.12,.24,e.z1-e.z0));let h=Math.max(1,Math.round(s/2.4));for(let m=1;m<h;m++){let g=(i?e.z0:e.x0)+m/h*s;i?n.add(R.box(),zt(er,-.2),A(l,u-.05,g,r,.2,.14)):n.add(R.box(),zt(er,-.2),A(g,u-.05,c,.14,.2,r))}let d=[],f=(m,g,_,b)=>{let v=Math.hypot(_-m,b-g),E=Math.max(1,Math.round(v/3.3));for(let T=0;T<=E;T++)d.push([m+(_-m)*T/E,g+(b-g)*T/E])},p=.15;f(e.x0-p,e.z0-p,e.x1+p,e.z0-p),f(e.x0-p,e.z1+p,e.x1+p,e.z1+p),f(e.x0-p,e.z0-p,e.x0-p,e.z1+p),f(e.x1+p,e.z0-p,e.x1+p,e.z1+p);let x=new Set;for(let[m,g]of d){let _=m.toFixed(1)+"|"+g.toFixed(1);if(x.has(_)||(x.add(_),js.some(M=>M!==e&&m>M.x0-.4&&m<M.x1+.4&&g>M.z0-.4&&g<M.z1+.4)))continue;let v=Se(m,g);if(v>Ve-.25)continue;let E=t()<.62,T=Ve+(E?.62+t()*.3:.1),y=Math.min(v-.6,-1.2);if(n.add(R.cyl(9),zt("#8a5f3a",(t()-.5)*.14),A(m,(T+y)/2,g,.34,T-y,.34,0,t()*3,(t()-.5)*.03),{grad:[.5,1.05]}),n.add(R.cyl(9),"#c79d6c",A(m,T+.012,g,.3,.03,.3)),E&&t()<.5)for(let M=0;M<3;M++)n.add(R.torus(.2,12),x0,A(m,Ve+.3+M*.066,g,.46,.46,.46,Math.PI/2,t()*3,0))}}}function Ro(n,t,e,i,s,r,a="#c9975c"){n.add(R.box(),a,A(t,e+s/2,i,s,s,s,0,r,0),{grad:[.82,1.05]});for(let o of[.12,.88])n.add(R.box(),zt(a,-.22),A(t,e+s*o,i,s*1.04,s*.1,s*1.04,0,r,0))}function f0(n,t,e,i,s=1){n.add(R.cyl(12),"#9b6b3e",A(t,e+.45*s,i,.64*s,.9*s,.64*s),{grad:[.78,1.06]}),n.add(R.cyl(12),"#7d5330",A(t,e+.9*s,i,.56*s,.03,.56*s));for(let r of[.2,.7])n.add(R.torus(.1,14),"#4a4f57",A(t,e+r*s,i,.67*s,.67*s,.67*s,Math.PI/2,0,0))}function du(n,t,e,i,s,r="#2f6fd6"){n.add(R.box(),r,A(t,e+.2,i,.78,.4,.46,0,s,0),{grad:[.82,1.05]}),n.add(R.box(),"#eef3f8",A(t,e+.45,i,.82,.1,.5,0,s,0)),n.add(R.box(),"#1f2937",A(t,e+.52,i,.3,.04,.08,0,s,0))}function p0(n,t,e,i){for(let s=0;s<3;s++)n.add(R.torus(.22,14),x0,A(t,e+.05+s*.075,i,.6-s*.04,.6-s*.04,.5,Math.PI/2,s,0))}function cb(n,t,e){let c=Ve,u=2.7,h="#3fb0a8",d=(C,N,O,L,k,G)=>{let V=Math.hypot(O-C,L-N),at=Math.atan2(-(L-N),O-C);n.add(R.box(),h,A((C+O)/2,c+(k+G)/2,(N+L)/2,V,G-k,.12,0,at,0),{grad:[.85,1.04]});let $=Math.max(1,Math.round(V/.42));for(let nt=0;nt<=$;nt++){let rt=nt/$;n.add(R.box(),zt(h,-.2),A(C+(O-C)*rt,c+(k+G)/2,N+(L-N)*rt,.045,G-k,.17,0,at,0))}};d(-13,10.4,-7.2,10.4,0,u),d(-13,15.4,-7.2,15.4,0,u),d(-13,10.4,-13,15.4,0,u),d(-7.2,10.4,-7.2,10.4+.9,0,u),d(-7.2,15.4-.9,-7.2,15.4,0,u),d(-7.2,10.4+.9,-7.2,15.4-.9,0,1),d(-7.2,10.4+.9,-7.2,15.4-.9,2.2,u),n.add(R.box(),"#f1efe6",A(-7.2+.02,c+u/2,10.4+.9,.16,u,.14)),n.add(R.box(),"#f1efe6",A(-7.2+.02,c+u/2,15.4-.9,.16,u,.14));for(let[C,N]of[[-13,10.4],[-7.2,10.4],[-13,15.4],[-7.2,15.4]])n.add(R.box(),"#f1efe6",A(C,c+u/2,N,.2,u+.04,.2));n.add(R.box(),"#1b2430",A(-7.2-1.5,c+1.6,12.9,.1,1.3,15.4-10.4-1.9)),n.add(R.box(),"#232e3c",A(-7.2-.75,c+.95,12.9,1.5,.08,15.4-10.4-1.9));for(let C of[1.45,1.85]){n.add(R.box(),"#8a5f3a",A(-7.2-1.3,c+C,12.9,.34,.05,3));for(let N=0;N<7;N++){let O=["#ef4444","#fbbf24","#22d3ee","#a3e635","#f97316","#e2e8f0"][Math.floor(e()*6)],L=.14+e()*.14;n.add(e()<.5?R.cyl(8):R.box(),O,A(-7.2-1.28,c+C+.03+L/2,12.9-1.3+N*.43+e()*.08,.15,L,.15))}}n.add(R.box(),"#d9a066",A(-7.2+.2,c+1.04,12.9,.78,.09,15.4-10.4-1.5)),n.add(R.box(),"#b97c42",A(-7.2+.5,c+.5,12.9,.08,1,15.4-10.4-1.7),{grad:[.8,1.05]});for(let C of[-.95,.45]){n.add(R.box(),"#a86f3a",A(-7.2+.22,c+1.15,12.9+C,.55,.14,.7)),n.add(R.box(),"#e8f6ff",A(-7.2+.22,c+1.21,12.9+C,.47,.06,.62));for(let N=0;N<4;N++)n.add(R.sph(8,6),["#b9c7d1","#e8643a","#9fb04a","#cfd9de"][N],A(-7.2+.14+N%2*.16,c+1.27,12.9+C-.2+N*.13,.13,.07,.36,0,.3*(N-1.5),0))}n.add(R.box(),"#59636e",A(-7.2+.25,c+1.14,12.9+1.25,.3,.1,.3)),n.add(R.cyl(12),"#cbd5e1",A(-7.2+.25,c+1.25,12.9+1.25,.36,.03,.36));let f=(-7.2- -13)/2+.3,p=1.45,x=Math.atan2(p,f),m=Math.hypot(f,p)+.35;for(let C of[-1,1]){n.add(R.box(),"#b5533c",A(-10.1+C*(f/2+.1),c+u+p/2-.02,12.9,m,.12,15.4-10.4+.9,0,0,-C*x),{grad:[.9,1.05]});for(let N=1;N<6;N++)n.add(R.box(),"#9c4532",A(-10.1+C*(f*(N/6)+.05),c+u+p*(1-N/6)+.05,12.9,.05,.03,15.4-10.4+.92,0,0,-C*x))}n.add(R.box(),"#8f3d2c",A(-10.1,c+u+p+.06,12.9,.22,.14,15.4-10.4+1));for(let C of[10.4,15.4])n.add(R.prism(),h,A(-10.1,c+u,C,-7.2- -13,p,.12),{grad:[.9,1.02]});for(let C=0;C<8;C++)n.add(R.torus(.3,5,Math.PI/4+.02),C%2?"#e2452f":"#f8fafc",A(-13+1.4,c+1.65,10.4-.1,.74,.74,.74,0,0,C*Math.PI/4));n.add(R.box(),"#f1efe6",A(-10.1+.9,c+1.6,10.4-.04,1.2,.95,.1)),n.add(R.box(),"#24405c",A(-10.1+.9,c+1.6,10.4-.08,1.02,.78,.06)),n.add(R.box(),"#f1efe6",A(-10.1+.9,c+1.6,10.4-.1,.05,.78,.05)),n.add(R.box(),"#a86f3a",A(-10.1+.9,c+1.05,10.4-.18,1.2,.18,.24));for(let C=0;C<7;C++)n.add(R.ico(0),["#f472b6","#fde047","#fb7185","#ffffff"][C%4],A(-10.1+.4+C*.17,c+1.22+e()*.06,10.4-.2,.14,.14,.14),{flat:!0});let g=Mn(256,64,(C,N,O)=>{for(let k=0;k<8;k++)C.fillStyle=k%2?"#f6f1e7":"#e2452f",C.fillRect(k*N/8,0,N/8+1,O);let L=C.createLinearGradient(0,0,0,O);L.addColorStop(0,"rgba(0,0,0,0.18)"),L.addColorStop(.5,"rgba(0,0,0,0)"),C.fillStyle=L,C.fillRect(0,0,N,O)}),_=new Me({map:g,roughness:.9,side:Xe}),b=new Rt(new Ai(15.4-10.4-.6,2.05),_);b.position.set(-7.2+.98,c+2.22,12.9),b.rotation.set(0,Math.PI/2,0),b.rotateX(-Math.PI/2+.22),b.castShadow=b.receiveShadow=!0,t.add(b);let v=new Rt(new Ai(15.4-10.4-.6,.24),_);v.position.set(-7.2+1.98,c+1.89,12.9),v.rotation.y=Math.PI/2,t.add(v);for(let C of[10.4+.36,15.4-.36])n.add(R.cyl(8),"#f1efe6",A(-7.2+1.94,c+1,C,.07,2,.07));let E=Mn(512,128,(C,N,O)=>{C.fillStyle="#7a4a26",C.fillRect(0,0,N,O);for(let L=0;L<3;L++)C.fillStyle=["#a86a3a","#b5763f","#9c6032"][L],C.fillRect(6,6+L*39,N-12,36);C.fillStyle="#fff7df",C.font='italic 900 92px "Sofia Sans Extra Condensed", "Arial Narrow", sans-serif',C.textAlign="center",C.textBaseline="middle",C.fillText("\u0420\u042B\u041D\u041E\u041A",N/2,O/2+6)}),T=new Rt(new Ai(2.5,.62),new Me({map:E,roughness:.85}));T.position.set(-7.2+.12,c+u+.42,12.9),T.rotation.y=Math.PI/2,T.castShadow=!0,t.add(T),n.add(R.box(),"#5b3a1e",A(-7.2+.07,c+u+.42,12.9,.06,.7,2.6));let y=document.createElement("canvas");y.width=256,y.height=352;let M=new yn(y);M.colorSpace=Oe;let U=new Rt(new Ai(.78,1.07),new Me({map:M,roughness:.95}));U.position.set(-5.9,c+.62,15.2),U.rotation.set(0,Math.PI/2-.55,0),U.rotateX(-.2),t.add(U),n.add(R.box(),"#a86f3a",A(-5.93,c+.62,15.22,.88,1.17,.04,-.2,Math.PI/2-.55,0)),n.add(R.box(),"#8a5f3a",A(-6.15,c+.55,15.36,.8,1.1,.04,.22,Math.PI/2-.55,0));let P=C=>{let N=y.getContext("2d");N.fillStyle="#1d2a26",N.fillRect(0,0,256,352),N.fillStyle="rgba(255,255,255,0.05)";for(let O=0;O<40;O++)N.fillRect(O*97%256,O*53%352,30,2);N.textAlign="center",N.fillStyle="#fde68a",N.font='italic 900 40px "Sofia Sans Extra Condensed", "Arial Narrow", sans-serif',N.fillText("\u0421\u0415\u0413\u041E\u0414\u041D\u042F",128,50),N.fillText("\u0412 \u0426\u0415\u041D\u0415",128,90),N.strokeStyle="#fde68a",N.lineWidth=3,N.beginPath(),N.moveTo(40,106),N.lineTo(216,106),N.stroke(),N.fillStyle="#f8fafc",N.font='italic 800 34px "Sofia Sans Extra Condensed", "Arial Narrow", sans-serif',C.slice(0,3).forEach((O,L)=>N.fillText(O,128,158+L*54)),N.fillStyle="#7dd3fc",N.font='italic 900 38px "Sofia Sans Extra Condensed", "Arial Narrow", sans-serif',N.fillText("\xD7 1,6",128,326),M.needsUpdate=!0};return P(["\u2026","\u2026","\u2026"]),{setBoard:P}}function hb(n,t){let e=Ve;Ro(n,-12.6,e,5.5,.82,.2),Ro(n,-12.45,e+.82,5.55,.62,.6,"#d3a56a"),Ro(n,-11.9,e,6.2,.55,1.1,"#b9854e"),f0(n,-11.15,e,5.15),du(n,4.5,e,14.9,.2),du(n,4.75,e+.5,14.85,-.15,"#3b82f6"),du(n,4.9,e,14.1,1.3,"#1e4fa8"),f0(n,4.95,e,5.15,.9),p0(n,4.3,e,6.1),Ro(n,5.25,e,-26.3,.5,.4),n.add(R.cyl(10,1,.8),"#64748b",A(4.55,e+.17,-26.1,.34,.34,.34),{grad:[.8,1.05]}),p0(n,-34.2,e,11.6),Ro(n,-34.3,e,5.7,.6,.3);let i=1.4,s=15.35;n.add(R.box(),"#c58a4e",A(i,e+.46,s,1.9,.07,.42)),n.add(R.box(),"#c58a4e",A(i,e+.86,s+.2,1.9,.4,.06,-.15,0,0));for(let r of[-.8,.8])n.add(R.box(),er,A(i+r,e+.23,s+.02,.08,.46,.4));for(let[r,a]of[[-1.3,-14],[1.3,-4],[-5.4,-26.6],[-34.6,8.5],[5.6,9]])n.add(R.cyl(8),"#3b424c",A(r,e+.08,a,.12,.16,.12)),n.add(R.box(),"#3b424c",A(r,e+.17,a,.34,.06,.09,0,t()*3,0));n.add(R.cyl(10,1,.82),"#e2452f",A(-2.6,e+.16,5,.32,.32,.32),{grad:[.8,1.05]})}function db(n,t){let e=[],i=new Me({color:"#ffe2a8",emissive:"#ffb347",emissiveIntensity:0,roughness:.4});for(let[h,d,f]of ob){let p=Ve;n.add(R.cyl(8,.8,1),"#5b3a1e",A(h,p+1.35,d,.16,2.9,.16),{grad:[.8,1.05]}),n.add(R.box(),"#5b3a1e",A(h+f*.32,p+2.7,d,.72,.07,.07)),n.add(R.box(),"#5b3a1e",A(h+f*.2,p+2.48,d,.5,.05,.05,0,0,f*.75));let x=h+f*.6;n.add(R.cyl(6),"#2b2f36",A(x,p+2.6,d,.02,.18,.02)),n.add(R.cone(6),"#2b2f36",A(x,p+2.5,d,.3,.12,.3)),n.add(R.box(),"#2b2f36",A(x,p+2.18,d,.2,.04,.2));for(let[_,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])n.add(R.box(),"#2b2f36",A(x+_*.09,p+2.32,d+b*.09,.02,.28,.02));let m=new Rt(R.box(),i);m.position.set(x,p+2.32,d),m.scale.set(.16,.24,.16),t.add(m);let g=new oo("#ffc58a",0,14,1.5);g.position.set(x,p+2.3,d),t.add(g),e.push(g)}let s=new Te,r=new D(-7.2,Ve+2.75,10.4),a=new D(-6.5,Ve+2.72,9.7),o=new D(1.9,Ve+2.75,-9),l=["#fbbf24","#22d3ee","#ef4444","#f8fafc","#a3e635","#f97316"],c=new ve;c.setAttribute("position",new Wt([-.5,0,0,.5,0,0,0,-1,0],3)),c.computeVertexNormals();let u=(h,d,f,p)=>{let x=Math.atan2(-(d.z-h.z),d.x-h.x);for(let m=0;m<=f;m++){let g=m/f,_=h.x+(d.x-h.x)*g,b=h.z+(d.z-h.z)*g,v=h.y+(d.y-h.y)*g-p*Math.sin(Math.PI*g);if(m<f){let E=(m+1)/f,T=h.x+(d.x-h.x)*E,y=h.z+(d.z-h.z)*E,M=h.y+(d.y-h.y)*E-p*Math.sin(Math.PI*E),U=Math.hypot(T-_,M-v,y-b);s.add(R.box(),"#3b2a1a",A((_+T)/2,(v+M)/2,(b+y)/2,U,.015,.015,0,x,Math.atan2(M-v,Math.hypot(T-_,y-b)))),s.add(c,l[m%l.length],A((_+T)/2,(v+M)/2-.01,(b+y)/2,U*.8,.34,1,0,x,0))}}};return u(r,a,3,.05),u(a,o,34,.9),t.add(s.build(Ao,!1)),{lamps:e,glassMat:i}}function uu(n,t,e,i,s,r){n.add(R.cyl(6,.6,1),"#7a5230",A(t,e+.7*s,i,.34*s,1.5*s,.34*s),{grad:[.7,1]});let a=3+(r()<.5?1:0),o=["#2f8f4e","#2a8246","#37a058"][Math.floor(r()*3)];for(let l=0;l<a;l++){let u=(1.5-l/a*.95)*s;n.add(R.cone(8),zt(o,l*.07),A(t,e+(1.25+l*1.02)*s,i,u*2,1.75*s,u*2,0,r()*3,0),{grad:[.62,1.12]})}}function fu(n,t,e,i,s,r){n.add(R.cyl(6,.7,1),"#8a5f3a",A(t,e+.9*s,i,.36*s,1.9*s,.36*s,0,0,(r()-.5)*.12),{grad:[.7,1]});let a=["#62b84e","#74c75a","#57a947","#86cf63"][Math.floor(r()*4)],o=3+Math.floor(r()*2);for(let l=0;l<o;l++){let c=r()*le,u=l?(.55+r()*.4)*s:0,h=(l?1+r()*.5:1.55)*s;n.add(R.ico(1),zt(a,(r()-.5)*.12),A(t+Math.cos(c)*u,e+(2.25+(l?r()*.7:.35))*s,i+Math.sin(c)*u,h*2,h*1.7,h*2,r(),r()*3,0),{flat:!0,grad:[.6,1.14]})}}function pu(n,t,e,i,s,r){let a=["#58b848","#4aa63f","#6cc956"][Math.floor(r()*3)];for(let o=0;o<2;o++)n.add(R.ico(1),zt(a,(r()-.5)*.1),A(t+(r()-.5)*s,e+.3*s,i+(r()-.5)*s,(1+r()*.5)*s,.8*s,(1+r()*.5)*s,0,r()*3,0),{flat:!0,grad:[.6,1.12]})}function ub(n,t){let e=new Te,i=new Te,s=new Te,r=0;for(let u=0;u<400&&r<46;u++){let h=t()*le,d=ys(h),f=Math.sqrt(t())*(d-6),p=Ae.x+Math.cos(h)*f,x=Ae.z+Math.sin(h)*f;if(Math.hypot(p-$n.x,x-$n.z)<5.5||Math.hypot(p-$n.x+7.5,x-$n.z-2)<5)continue;let m=Se(p,x);if(m<8)continue;let g=.85+t()*.75;t()<.62?uu(s,p,m-.15,x,g,t):fu(s,p,m-.15,x,g*.9,t),r++}for(let u=0;u<26;u++){let h=t()*le,d=Math.sqrt(t())*(ys(h)-5),f=Ae.x+Math.cos(h)*d,p=Ae.z+Math.sin(h)*d,x=Se(f,p);x>8&&pu(s,f,x,p,.7+t()*.6,t)}r=0;for(let u=0;u<3e3&&r<230;u++){let h=-165+t()*320,d=-150+t()*235,f=d-cn(h);if(f<6.5||f>78||h>-56&&h<49&&f<15.5)continue;let x=Se(h,d);if(x<1)continue;let m=(.9+t()*.9)*(f>30?1.25:1),g=f<40?e:i;t()<.5?uu(g,h,x-.2,d,m,t):fu(g,h,x-.2,d,m,t),r++}for(let u=0;u<400;u++){let h=-56+t()*105,d=3.6+t()*16,f=cn(h)+d;d<14&&t()<.8||zi(h,f,-1.5)||pu(e,h,Se(h,f),f,.5+t()*.6,t)}for(let u=0;u<260;u++){let h=-52+t()*96,d=3.4+t()*10,f=cn(h)+d,p=Se(h,f);zi(h,f,-.6)||p<1||t()<.45||(e.add(R.cyl(4),"#3f9a3a",A(h,p+.12,f,.025,.26,.025)),e.add(R.ico(0),["#fde047","#f8fafc","#f472b6","#fb923c"][Math.floor(t()*4)],A(h,p+.27,f,.11,.08,.11),{flat:!0}))}let a=null;for(let u=-53.5;u<=47;u+=2.3){let h=cn(u)+14.1,d=Se(u,h);if(e.add(R.box(),"#b98a58",A(u,d+.45,h,.11,1,.11),{grad:[.8,1.05]}),a){let f=Math.hypot(u-a[0],h-a[2],d-a[1]),p=Math.atan2(-(h-a[2]),u-a[0]),x=Math.atan2(d-a[1],Math.hypot(u-a[0],h-a[2]));for(let m of[.38,.75])e.add(R.box(),"#c79d6c",A((u+a[0])/2,(d+a[1])/2+m,(h+a[2])/2,f,.07,.04,0,p,x))}a=[u,d,h]}for(let u=0;u<520;u++){let h=Ks.x-17+t()*34,d=Ks.z-14+t()*28,f=-Se(h,d);if(!zi(h,d,-.8)){if(f>.05&&f<.75&&t()<.75){let p=.9+t()*.9,x=(t()-.5)*.25;e.add(R.cyl(4,.5,1),zt("#6fae3c",(t()-.5)*.2),A(h,p/2-.3,d,.035,p+.6,.035,x,t()*3,x)),t()<.55&&e.add(R.cyl(6),"#6b4226",A(h+x*.4,p-.02,d+x*.4,.07,.24,.07,x,0,x))}else if(f>.6&&f<2.4&&t()<.16){let p=.5+t()*.5;e.add(R.cyl(9),zt("#3fa34d",(t()-.5)*.16),A(h,.07,d,p,.035,p,0,t()*6,0)),t()<.3&&(e.add(R.cone(6),"#f9a8d4",A(h,.15,d,.2,.14,.2,Math.PI,0,0)),e.add(R.ico(0),"#fde047",A(h,.16,d,.07,.07,.07)))}}}let o=e.build(),l=i.build(Yi,!1),c=s.build();n.add(o,l,c)}function fb(n,t){let e=new Te,i=[Kr(11),Kr(23),Kr(37),Kr(51),Kr(64,2,.3)],s=["#8d95a1","#7f8793","#9aa2ad","#868f9c","#a3a9b3"],r="#6dbd50",a=(d,f,p,x,m,g,_=!1,b=0)=>{let v=zt(s[Math.floor(t()*s.length)],b+(t()-.5)*.1);e.add(i[Math.floor(t()*i.length)],v,A(d,f,p,x,m,g,(t()-.5)*.5,t()*le,(t()-.5)*.5),_?{top:[zt(r,(t()-.5)*.12),.72],grad:[.72,1.05]}:{grad:[.72,1.05]})};for(let d=0;d<11;d++){let f=t()*le,p=t()*6.5,x=.7+t()*1.5;a(Zs.x+Math.cos(f)*p,-.35+t()*.5-p*.05,Zs.z+Math.sin(f)*p*.8,x*1.2,x*.8,x)}for(let d=0;d<56;d++){let f=t()*le,p=ys(f)+.5+t()*4.5,x=1+t()*2.4;a(Ae.x+Math.cos(f)*p,-.3+t()*.7,Ae.z+Math.sin(f)*p,x*1.2,x*.8,x,!1,-.06)}for(let d=0;d<120;d++){let f=t()*le,p=ys(f)-.4-t()*3.8,x=Ae.x+Math.cos(f)*p,m=Ae.z+Math.sin(f)*p,g=Se(x,m),_=2.3+t()*2.9;a(x,g-_*.3,m,_,_*(.8+t()*.5),_,g>7)}for(let d=0;d<34;d++){let f=t(),p=De.ax+(De.bx-De.ax)*f+(t()-.5)*9.5,x=De.az+(De.bz-De.az)*f+(t()-.5)*6,m=Zr(p,x);if(m<De.r-.2||m>De.r+2.6)continue;let g=.9+t()*1.6;a(p,Se(p,x)-.1,x,g*1.2,g*.8,g)}for(let d=0;d<5;d++)a(De.bx+(t()-.5)*6,-.2,De.bz-3-t()*4,1.4+t(),1+t(),1.4+t());for(let d=0;d<70;d++){let f=-60+t()*115,p=cn(f)-1.5+t()*3.4;if(zi(f,p,-1.2))continue;let x=.3+t()*.75;a(f,Se(f,p)+x*.12,p,x*1.3,x*.75,x,!1,.05)}for(let d=0;d<46;d++){let f=-62-t()*80,p=cn(f)-2+t()*5,x=2+t()*3.4;a(f,Se(f,p)+t()*2,p,x*1.2,x,x,t()<.5)}for(let[d,f,p,x]of[[98,-72,7,2.6],[112,-40,5,2.2],[90,-104,6,3],[126,-98,9,2],[-58,-96,5,2.4],[-76,-122,7,2.2],[140,-20,5,2.4]]){a(d,p*x*.3,f,p,p*x,p,!0);for(let m=0;m<4;m++)a(d+(t()-.5)*p*2.2,-.2,f+(t()-.5)*p*2.2,1.5+t()*2,1+t(),1.5+t()*2)}let o=new hs(8.6,2.7,7,13,Math.PI).toNonIndexed(),l=o.attributes.position,c=new D;for(let d=0;d<l.count;d++){c.fromBufferAttribute(l,d);let p=1+(on(c.x*.35+5+c.z*.3,c.y*.35+9-c.z*.2,3)-.5)*.55,x=1+.45*Ie(4,0,c.y);l.setXYZ(d,c.x*p*(.94+.06*x),c.y*1.12*p,c.z*p*x*1.25)}o.computeVertexNormals(),e.add(o,"#8d95a1",A(Mi.x,-1.4,Mi.z,1,1,1,0,1.92,0),{top:[r,.8],grad:[.72,1.05]});for(let d=0;d<9;d++){let f=d<5?-1:1;a(Mi.x+Math.cos(1.92)*f*(8.6+(t()-.5)*4)+(t()-.5)*3,-.2,Mi.z-Math.sin(1.92)*f*(8.6+(t()-.5)*4)+(t()-.5)*3,1.6+t()*2.2,1.2+t()*1.6,1.6+t()*2.2,t()<.3)}let u=new Te;fu(u,Mi.x+.4,9.6,Mi.z-.2,.8,t),uu(u,Mi.x-1.6,9.2,Mi.z+.9,.7,t),pu(u,Mi.x+1.8,9.2,Mi.z+.4,.8,t),n.add(e.build(),u.build());let h=new Te;for(let[d,f,p,x,m]of[[-420,-560,130,46,90],[260,-720,170,60,110],[640,-330,120,40,150],[-700,-150,150,70,180],[40,-980,220,50,120]])h.add(i[4],"#5f8f7a",A(d,x*.25,f,p,x,m,0,t()*3,0),{top:["#4f9a5a",.6]});n.add(h.build(Yi,!1))}function pb(n,t){let e=new Te,{x:i,z:s}=$n,r=Se(i,s)-.3;e.add(R.cyl(16),"#a3a9b3",A(i,r+.5,s,5.6,1.2,5.6),{grad:[.8,1.05]});let a=3.25,o=[2.35,2.12,1.9,1.7,1.52];for(let v=0;v<4;v++)e.add(R.cyl(18,o[v+1]/o[v],1),v%2?"#d8402f":"#f6f2ea",A(i,r+1.1+a*(v+.5),s,o[v]*2,a,o[v]*2),{grad:[.9,1.04]});let l=r+1.1+a*4;e.add(R.cyl(18),"#4b5563",A(i,l+.1,s,4.5,.22,4.5)),e.add(R.torus(.035,22),"#f6f2ea",A(i,l+1,s,4.3,4.3,4.3,Math.PI/2,0,0));for(let v=0;v<12;v++)e.add(R.cyl(5),"#f6f2ea",A(i+Math.cos(v/12*le)*2.15,l+.6,s+Math.sin(v/12*le)*2.15,.07,.85,.07));for(let v=0;v<8;v++)e.add(R.box(),"#374151",A(i+Math.cos(v/8*le)*1.2,l+1.05,s+Math.sin(v/8*le)*1.2,.09,1.7,.09));e.add(R.cyl(16),"#374151",A(i,l+1.95,s,2.7,.16,2.7)),e.add(R.cone(16),"#d8402f",A(i,l+2.7,s,3,1.4,3),{grad:[.85,1.05]}),e.add(R.sph(10,8),"#fbbf24",A(i,l+3.5,s,.4,.4,.4));let c=Math.atan2(-22-i,0-s),u=Math.sin(c),h=Math.cos(c);e.add(R.box(),"#3b2a1a",A(i+u*2.28,r+2.1,s+h*2.28,1,2,.2,0,c,0));for(let[v,E]of[[6,2.02],[9.6,1.8]])e.add(R.box(),"#1f3350",A(i+u*E,r+v,s+h*E,.55,.9,.2,0,c,0));let d=i-7.5,f=s+2,p=Se(d,f)-.2;e.add(R.box(),"#f6f2ea",A(d,p+1.5,f,5.2,3,4),{grad:[.88,1.04]}),e.add(R.prism(),"#d8402f",A(d,p+3,f,5.9,1.9,4.6),{grad:[.9,1.06]}),e.add(R.box(),"#a3a9b3",A(d+1.4,p+4.3,f-.8,.6,1.4,.6)),e.add(R.box(),"#7a4a26",A(d-.2,p+1,f+2.02,.9,1.9,.1));let x=new Me({color:"#25405f",emissive:"#ffc56b",emissiveIntensity:0,roughness:.4});for(let v of[-1.7,1.4]){let E=new Rt(R.box(),x);E.position.set(d+v,p+1.7,f+2.03),E.scale.set(.8,.8,.08),n.add(E)}for(let v=0;v<26;v++){let E=.4+v/26*3.6,T=i-3.5+Math.cos(E)*11,y=s+1+Math.sin(E)*8.5,M=Se(T,y);M<9||e.add(R.box(),"#f6f2ea",A(T,M+.4,y,.12,.9,.12))}n.add(e.build());let m=new Me({color:"#fff3c4",emissive:"#ffd36b",emissiveIntensity:.25,roughness:.3,transparent:!0,opacity:.92}),g=new Rt(R.cyl(14),m);g.position.set(i,l+1.05,s),g.scale.set(2.2,1.6,2.2),n.add(g);let _=new Ge({uniforms:{opacity:{value:0}},vertexShader:"varying vec3 vN; varying vec3 vV; varying float vT; void main(){ vT = uv.y; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",fragmentShader:"uniform float opacity; varying vec3 vN; varying vec3 vV; varying float vT; void main(){ float e = pow(abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(vec3(1.0, 0.93, 0.7) * e * vT * vT * opacity, 1.0); }",transparent:!0,blending:ho,depthWrite:!1,side:Xe,fog:!1}),b=new he;b.position.set(i,l+1.05,s);for(let v of[-1,1]){let E=new Rt(new Os(3.4,90,14,1,!0),_);E.rotation.z=-v*Math.PI/2,E.position.x=-v*45,b.add(E)}return n.add(b),{lampMat:m,beamMat:_,beam:b,winMat:x}}var m0="varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",g0=`
uniform float uTime, uLight, uDisc; varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
void main(){
  vec3 c; float a;
  if (uDisc > 0.5) {
    vec2 q = vUv * 2.0 - 1.0; float r = length(q);
    float s = n(vec2(atan(q.y, q.x) * 3.0, r * 6.0 - uTime * 2.0)) * 0.6 + n(q * 9.0 + uTime) * 0.4;
    a = (1.0 - smoothstep(0.35, 1.0, r)) * smoothstep(0.25, 0.75, s + (1.0 - r) * 0.5);
    c = vec3(1.0);
  } else {
    float s = n(vec2(vUv.x * 13.0, vUv.y * 4.0 + uTime * 2.4)) * 0.6 + n(vec2(vUv.x * 31.0, vUv.y * 9.0 + uTime * 3.6)) * 0.4;
    float edge = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
    c = mix(vec3(0.5, 0.82, 0.95), vec3(1.0), smoothstep(0.35, 0.78, s));
    a = edge * (0.78 + 0.22 * s) * smoothstep(1.0, 0.94, vUv.y);
  }
  gl_FragColor = vec4(c * uLight, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function mb(n){let t={value:0},e={value:1};for(let i of cu){let s=-i.nz,r=i.nx,a=Math.hypot(i.x-Ae.x,i.z-Ae.z)+.6,o=[],l=[],c=[],u=14;for(let p=0;p<=u;p++){let x=p/u,m=a+2.3-x*8.2,g=Ae.x+i.nx*m,_=Ae.z+i.nz*m,b=Math.max(.02,Se(g,_))+.32,v=1.25+.5*(1-x);o.push(g-s*v+i.nx*.35,b,_-r*v+i.nz*.35,g+s*v+i.nx*.35,b,_+r*v+i.nz*.35),l.push(0,x,1,x),p<u&&c.push(p*2,p*2+1,p*2+2,p*2+1,p*2+3,p*2+2)}let h=new ve;h.setAttribute("position",new Wt(o,3)),h.setAttribute("uv",new Wt(l,2)),h.setIndex(c);let d=new Rt(h,new Ge({uniforms:{uTime:t,uLight:e,uDisc:{value:0}},vertexShader:m0,fragmentShader:g0,transparent:!0,depthWrite:!1,side:Xe}));d.renderOrder=3,n.add(d);let f=new Rt(new Ai(7,7),new Ge({uniforms:{uTime:t,uLight:e,uDisc:{value:1}},vertexShader:m0,fragmentShader:g0,transparent:!0,depthWrite:!1}));f.rotation.x=-Math.PI/2,f.position.set(i.bx,.12,i.bz),f.renderOrder=3,n.add(f)}return{uTime:t,uLight:e}}function gb(n){let t=[],e=new he,i=new Me({color:"#efe7d2",roughness:.8,side:Xe}),s=new Rt(new xi(1,18,10,0,le,Math.PI/2,Math.PI/2),i);s.scale.set(2,.62,.78),s.castShadow=!0,e.add(s);let r=new Rt(new hs(1,.05,6,28),new Me({color:"#d9463b",roughness:.7}));r.rotation.x=Math.PI/2,r.scale.set(2,.78,1),e.add(r);let a=new Me({color:"#b97c42",roughness:.9});for(let c of[-.7,.55]){let u=new Rt(R.box(),a);u.scale.set(.3,.05,1.3),u.position.set(c,-.14,0),e.add(u)}e.position.set(-32,0,3.3),e.rotation.y=.25,n.add(e),t.push({o:e,y:.08,roll:.06});let o=new Me({color:"#e2452f",roughness:.6}),l=new Me({color:"#f8fafc",roughness:.6});for(let[c,u]of[[-12,-43],[15,-37],[45,-31],[-27,-12]]){let h=new he,d=new Rt(R.sph(12,8),o);d.scale.set(.9,.7,.9);let f=new Rt(R.cyl(12),l);f.scale.set(.92,.16,.92);let p=new Rt(R.cone(10),o);p.scale.set(.5,.9,.5),p.position.y=.6;let x=new Rt(R.cyl(6),l);x.scale.set(.05,.7,.05),x.position.y=1.3,h.add(d,f,p,x),h.position.set(c,0,u),h.traverse(m=>m.castShadow=!0),n.add(h),t.push({o:h,y:.05,roll:.12})}return t}function xb(n){let t=new Me({color:"#f8fafc",roughness:.9,side:Xe}),e=new Me({color:"#475569",roughness:.9,side:Xe}),i=[],s=new ve;return s.setAttribute("position",new Wt([0,0,-.16,0,0,.16,.75,0,.1,0,0,-.16,.75,0,.1,.8,0,-.08],3)),s.computeVertexNormals(),[[20,34,-98,28],[0,16,-20,20],[-30,22,-40,30],[50,26,-50,24],[5,13,4,14]].forEach(([a,o,l,c],u)=>{let h=new he,d=new Rt(R.sph(8,6),t);d.scale.set(.22,.2,.62),h.add(d);let f=[];for(let p of[-1,1]){let x=new he,m=new Rt(s,t),g=new Rt(s,e);g.scale.set(.5,1,.7),g.position.x=.72,m.add(g),x.add(m),x.scale.x=p,h.add(x),f.push(x)}n.add(h),i.push({g:h,wings:f,cx:a,cy:o,cz:l,rad:c,ph:u*1.7,sp:.16+u*.03,dir:u%2?1:-1})}),i}function vb(n){let t=Mn(64,32,f=>{f.fillStyle="#fff",f.beginPath(),f.ellipse(26,16,20,8,0,0,le),f.fill(),f.beginPath(),f.moveTo(44,16),f.lineTo(62,5),f.lineTo(62,27),f.closePath(),f.fill()}),e=new Ai(.62,.3);e.rotateX(-Math.PI/2);let i=new Wi({color:"#0a3350",map:t,transparent:!0,opacity:.5,depthWrite:!1}),s=9,r=6,a=new za(e,i,s*r);a.frustumCulled=!1,a.renderOrder=1,n.add(a);let o=[];for(let f=0;f<r;f++)o.push({x:0,z:0,on:0});let l=new ge,c=new si,u=new D(0,1,0),h=new D,d=new D;return{centers:o,update(f,p){let m=Math.floor(p/240),g=(p-m*240)/240,_=Math.min(1,g*12,(1-g)*12);for(let b=0;b<r;b++){let v=bi((f^Math.imul(m+1,2654435761)^Math.imul(b+1,40503))>>>0),E=hu[Math.floor(v()*hu.length)],T=v()*le,y=o[b];y.x=E[0]+Math.sin(p/37+T)*4,y.z=E[1]+Math.cos(p/43+T*2)*4,y.on=_;for(let M=0;M<s;M++){let U=.5+v()*.35,P=M/s*le+p*U*(b%2?1:-1)+v()*.8,C=1.1+v()*1.6+Math.sin(p*.7+M)*.25;h.set(y.x+Math.cos(P)*C,-.32-v()*.25,y.z+Math.sin(P)*C),c.setFromAxisAngle(u,-P+(b%2?-Math.PI/2:Math.PI/2)+Math.PI/2);let N=(.8+v()*.7)*(.001+_);l.compose(h,c,d.set(N,N,N)),a.setMatrixAt(b*s+M,l)}}a.instanceMatrix.needsUpdate=!0},isHot(f,p){for(let x of o)if(x.on>.5&&(f-x.x)**2+(p-x.z)**2<22)return!0;return!1}}}function v0(n){let t=bi(20261111),e=new Te;lb(e,t);let i=cb(e,n,t);hb(e,t);let s=db(e,n);n.add(e.build()),ub(n,t),fb(n,t);let r=pb(n,t),a=mb(n),o=gb(n),l=xb(n),c=vb(n);return{setBoard:i.setBoard,schools:c,setNight(u,h){for(let d of s.lamps)d.intensity=u*9;s.glassMat.emissiveIntensity=.05+u*1.9,r.lampMat.emissiveIntensity=.25+u*2.4,r.beamMat.uniforms.opacity.value=Math.max(0,u-.4)*.9,r.winMat.emissiveIntensity=u*1.6,a.uLight.value=.14+.86*h},update(u,h){a.uTime.value=h,r.beam.rotation.y=h*.45;for(let d of o){let f=d.o.position;f.y=d.y+_s(f.x,f.z,h),d.o.rotation.z=Math.sin(h*.9+f.x)*d.roll,d.o.rotation.x=Math.cos(h*.7+f.z)*d.roll*.7}for(let d of l){let f=d.ph+h*d.sp*d.dir;d.g.position.set(d.cx+Math.cos(f)*d.rad,d.cy+Math.sin(h*.3+d.ph)*2.5,d.cz+Math.sin(f)*d.rad),d.g.rotation.set(0,-f+(d.dir>0?Math.PI:0),-d.dir*.25);let p=Math.sin(h*5.5+d.ph*3)*.55*(.4+.6*Math.max(0,Math.sin(h*.4+d.ph)));d.wings[0].rotation.z=-p,d.wings[1].rotation.z=p}}}}var hn=(n,t,e,i,s,r,a,o,l,c,u,h,d,f,p)=>({h:n,zen:new Lt(t),hor:new Lt(e),sun:new Lt(i),sunI:s,hemiS:new Lt(r),hemiG:new Lt(a),hemiI:o,fog:new Lt(l),wS:new Lt(c),wD:new Lt(u),cloud:new Lt(h),stars:d,glit:f,exp:p}),eh=[hn(0,"#070d24","#14244a","#8fa8ff",.9,"#33477f","#141a28",.8,"#14244a","#16506e","#071b33","#2b3a5e",1,.3,1),hn(4.6,"#070d24","#172850","#8fa8ff",.9,"#33477f","#141a28",.8,"#172850","#16506e","#071b33","#2b3a5e",1,.3,1),hn(5.7,"#2c4f96","#ff9e7a","#ffb98a",1.5,"#8fa0d0","#5a4a3a",.72,"#f0a890","#3aa8b8","#1a4a85","#ffc9b0",.1,.8,1),hn(7.2,"#2a86ea","#bfe3ff","#fff0d6",2.7,"#cfe8ff","#c9b384",1.25,"#bfe3ff","#36ddd2","#1273c4","#ffffff",0,1,1),hn(12,"#1b78e2","#a9dcff","#fff6e6",3,"#d6ecff","#d2bc8c",1.35,"#a9dcff","#35e0d4","#1070c4","#ffffff",0,1,1),hn(17,"#2280e4","#b4dcff","#fff0d0",2.9,"#d6ecff","#d2bc8c",1.3,"#b4dcff","#38dccf","#126ec0","#fff8ee",0,1,1),hn(19,"#3a5cb0","#ffb070","#ffb060",2.1,"#b0b8e0","#8a6a4a",1,"#ffb88a","#48b8c4","#244a90","#ffc79a",0,1,1),hn(20.4,"#1f2c66","#d86a5a","#ff8a5a",.9,"#6a70a8","#3a3040",.62,"#a8607a","#2a7a98","#142c5c","#c9708a",.35,.6,1),hn(21.4,"#0b1430","#23305e","#8fa8ff",.85,"#33477f","#141a28",.8,"#1c2a55","#18587a","#081d38","#33426a",.9,.3,1),hn(24,"#070d24","#14244a","#8fa8ff",.9,"#33477f","#141a28",.8,"#14244a","#16506e","#071b33","#2b3a5e",1,.3,1)],mu=hn(0,"#000","#000","#000",0,"#000","#000",0,"#000","#000","#000","#000",0,0,1);function yb(n){n=(n%24+24)%24;let t=0;for(;t<eh.length-2&&eh[t+1].h<=n;)t++;let e=eh[t],i=eh[t+1],s=ne((n-e.h)/(i.h-e.h),0,1);for(let r of["zen","hor","sun","hemiS","hemiG","fog","wS","wD","cloud"])mu[r].lerpColors(e[r],i[r],s);for(let r of["sunI","hemiI","stars","glit","exp"])mu[r]=$i(e[r],i[r],s);return mu}function _b(n,t){let e=(n-5)/16*Math.PI;return t.set(Math.cos(e),Math.sin(e)*.95,.42*Math.sin(e)+.28).normalize()}var y0=new D(-.45,.62,-.5).normalize();function bb(){let{x0:e,x1:i,z0:s,z1:r}=Pi,a=new Ai(i-e,r-s,230,190);a.rotateX(-Math.PI/2),a.translate((e+i)/2,0,(s+r)/2);let o=a.attributes.position,l=a.attributes.uv;for(let M=0;M<o.count;M++){let U=o.getX(M),P=o.getZ(M),C=Se(U,P),N=Math.min(Ie(i-2,i-45,U),Ie(e+2,e+30,U),Ie(s+2,s+20,P));C>-2&&(C=$i(-2,C,N)),o.setY(M,C),l.setXY(M,U/6.5,P/6.5)}a.computeVertexNormals();let c=a.attributes.normal,u=new Float32Array(o.count*3),h=M=>new Lt(M),d=h("#f2e2b3"),f=h("#e6d6a6"),p=h("#9db9ad"),x=h("#74c44e"),m=h("#5aae44"),g=h("#96d466"),_=h("#8d95a1"),b=h("#a7adb7"),v=h("#dccb93"),E=new Lt;for(let M=0;M<o.count;M++){let U=o.getX(M),P=o.getY(M),C=o.getZ(M),N=c.getY(M),O=on(U*.11,C*.11,3),L=on(U*.5+9,C*.5+4,2),k=C-cn(U),G=Math.hypot(U-Ae.x,C-Ae.z)<40;P<-.12?(E.lerpColors(f,p,Ie(-.3,-8,P)),N<.8&&E.lerp(_,ne((.8-N)*2.2,0,.8)),E.multiplyScalar(.93+L*.12)):Zr(U,C)<De.r+3.2&&k<1?E.lerpColors(_,b,L).multiplyScalar(.92+O*.14):N<(G?.74:.5)?E.lerpColors(_,b,L).multiplyScalar((.84+O*.22)*(.94+.08*Math.sin(P*2.4+O*5))):P<.85+O*.5&&!G?E.lerpColors(d,f,Ie(.5,-.1,P)).multiplyScalar(.95+L*.08):(E.lerpColors(x,m,Ie(.3,.7,O)),E.lerp(g,Ie(.55,.9,L)*.5),G&&N<.9?E.lerp(_,ne((.9-N)*3,0,.7)):!G&&N<.64&&E.lerp(_,ne((.64-N)*4,0,.6)),U>-56&&U<49&&k>2.2&&k<14&&E.lerp(v,.8*Math.exp(-(((k-7.6)/1.5)**2))*(.75+.25*L)),k>0&&k<4.2&&E.lerp(d,Ie(4.2,2.2,k)*.85)),u[M*3]=E.r,u[M*3+1]=E.g,u[M*3+2]=E.b}a.setAttribute("color",new ni(u,3));let T=Mn(256,256,(M,U,P)=>{let C=M.createImageData(U,P),N=bi(5);for(let O=0;O<U*P;O++){let L=222+N()*33;C.data[O*4]=C.data[O*4+1]=C.data[O*4+2]=L,C.data[O*4+3]=255}M.putImageData(C,0,0),M.globalAlpha=.5,M.filter="blur(1.2px)",M.drawImage(M.canvas,0,0)},{repeat:!0,aniso:8}),y=new Rt(a,new Me({vertexColors:!0,roughness:.96,map:T}));return y.receiveShadow=!0,y}var Mb="varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }",Sb=`
uniform vec3 uZen, uHor, uSunDir, uSunCol, uMoonDir; uniform float uStars, uTime; varying vec3 vDir;
float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
void main(){
  vec3 d = normalize(vDir);
  float y = max(d.y, 0.0);
  vec3 c = mix(uHor, uZen, pow(y, 0.5));
  c = mix(c, uHor * 1.06, exp(-y * 11.0) * 0.6);
  float sd = max(dot(d, uSunDir), 0.0);
  float up = smoothstep(-0.06, 0.03, uSunDir.y);
  c += uSunCol * (smoothstep(0.9994, 0.9997, sd) * 9.0 + pow(sd, 220.0) * 0.9 + pow(sd, 9.0) * 0.16) * up;
  float md = max(dot(d, uMoonDir), 0.0);
  c += vec3(0.85, 0.9, 1.0) * (smoothstep(0.9990, 0.9993, md) * 1.6 + pow(md, 60.0) * 0.12) * uStars;
  vec3 gp = d * 330.0; vec3 g = floor(gp);
  float st = step(0.9965, hash(g)) * smoothstep(0.42, 0.08, length(fract(gp) - 0.5)) * (0.65 + 0.35 * sin(uTime * 2.0 + hash(g + 3.0) * 30.0)) * 1.6;
  c += vec3(st) * uStars * smoothstep(0.02, 0.25, d.y);
  if (d.y < 0.0) c = mix(c, uHor * 0.9, min(1.0, -d.y * 6.0));
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function ih(n){return Mn(512,256,(t,e,i)=>{let s=bi(n),r=[],a=9+Math.floor(s()*5);for(let c=0;c<a;c++){let u=c/(a-1),h=70+u*(e-140)+(s()-.5)*40,d=34+Math.sin(u*Math.PI)*44*(.6+s()*.6)+s()*12;r.push([h,i-62-d*.55-s()*16,d])}let o=(c,u,h)=>{t.fillStyle=u,t.beginPath();for(let[d,f,p]of r)t.moveTo(d+p+h,f+c),t.arc(d,f+c,p+h,0,le);t.rect(80,i-88+c,e-160,30),t.fill()};t.filter="blur(5px)",o(10,"#b9cdea",2),t.filter="blur(3px)",o(0,"#ffffff",0);let l=t.createLinearGradient(0,i-70,0,i-40);l.addColorStop(0,"rgba(0,0,0,0)"),l.addColorStop(1,"rgba(0,0,0,1)"),t.globalCompositeOperation="destination-out",t.filter="none",t.fillStyle=l,t.fillRect(0,i-70,e,70),t.globalCompositeOperation="source-over"})}var nh=class{constructor(){let t=this.scene=new Fs;t.fog=new Na("#a9dcff",170,1700),this.terrain=bb(),t.add(this.terrain),this.water=r0(),t.add(this.water.mesh),this.skyU={uZen:{value:new Lt},uHor:{value:new Lt},uSunDir:{value:new D(0,1,0)},uSunCol:{value:new Lt},uMoonDir:{value:y0.clone()},uStars:{value:0},uTime:{value:0}};let e=new Rt(new xi(1,32,16),new Ge({uniforms:this.skyU,vertexShader:Mb,fragmentShader:Sb,side:li,depthWrite:!1,depthTest:!1,fog:!1}));e.frustumCulled=!1,e.renderOrder=-10,t.add(e),this.sky=e,this.clouds=new he,this.cloudMat=[];let i=bi(77),s=[ih(1),ih(2),ih(3),ih(4)];for(let o=0;o<16;o++){let l=new Wi({map:s[o%s.length],transparent:!0,depthWrite:!1,fog:!1,opacity:.96}),c=o/16*le+i()*.3,u=900+i()*500,h=420+i()*420,d=new Rt(new Ai(h,h*.5),l);d.position.set(Math.cos(c)*u,150+i()*330,Math.sin(c)*u),d.lookAt(0,d.position.y*.35,0),d.renderOrder=-5,this.clouds.add(d),this.cloudMat.push(l)}t.add(this.clouds),this.hemi=new Bs("#d6ecff","#c4a873",1),t.add(this.hemi);let r=this.sun=new ps("#fff6e6",3);r.castShadow=!0,r.shadow.mapSize.set(2048,2048);let a=r.shadow.camera;a.left=a.bottom=-44,a.right=a.top=44,a.near=1,a.far=260,r.shadow.bias=-5e-4,r.shadow.normalBias=.05,t.add(r,r.target),this.scenery=v0(t),this.sunDir=new D(0,1,0),this.night=0,this.hours=12,this.exposure=1,this.setClock(12)}setClock(t){this.hours=t;let e=yb(t),i=t>=5&&t<21;_b(t,this.sunDir);let s=i?this.sunDir:y0,r=i?Ie(0,.12,this.sunDir.y):1;this.sun.color.copy(e.sun),this.sun.intensity=e.sunI*(.25+.75*r),this.lightDir=s,this.hemi.color.copy(e.hemiS),this.hemi.groundColor.copy(e.hemiG),this.hemi.intensity=e.hemiI,this.scene.fog.color.copy(e.fog);let a=this.skyU;a.uZen.value.copy(e.zen),a.uHor.value.copy(e.hor),a.uSunDir.value.copy(this.sunDir),a.uSunCol.value.copy(e.sun),a.uStars.value=e.stars;let o=this.water.uniforms;o.uShallow.value.copy(e.wS),o.uDeep.value.copy(e.wD),o.uSkyZen.value.copy(e.zen),o.uSkyHor.value.copy(e.hor),o.uSunDir.value.copy(s),o.uSunCol.value.copy(e.sun),o.uFogCol.value.copy(e.fog),o.uGlitter.value=e.glit,o.uFogNear.value=this.scene.fog.near,o.uFogFar.value=this.scene.fog.far;for(let l of this.cloudMat)l.color.copy(e.cloud);this.night=ne(e.stars*1.15,0,1),this.exposure=e.exp,this.scenery.setNight(this.night,1-this.night)}update(t,e,i){this.water.uniforms.uTime.value=e,this.skyU.uTime.value=e,this.sky.position.copy(i.position),this.sky.scale.setScalar(2500),this.clouds.rotation.y=e*.0016,this.clouds.position.set(i.position.x,0,i.position.z);let s=Math.round(i.position.x/2)*2,r=Math.round((i.position.z-8)/2)*2;this.sun.target.position.set(s,0,r),this.sun.position.set(s+this.lightDir.x*120,this.lightDir.y*120,r+this.lightDir.z*120),this.scenery.update(t,e)}};function _0(n=256){let t=document.createElement("canvas");t.width=t.height=n;let e=t.getContext("2d"),i=e.createImageData(n,n),{x0:s,x1:r,z0:a,z1:o}=qn,l=(h,d,f,p)=>{i.data[p]=h,i.data[p+1]=d,i.data[p+2]=f,i.data[p+3]=255};for(let h=0;h<n;h++)for(let d=0;d<n;d++){let f=s+(d+.5)/n*(r-s),p=a+(h+.5)/n*(o-a),x=Se(f,p),m=(h*n+d)*4,g=on(f*.2,p*.2,2);if(x<-.1){let _=Ie(-.1,-11,x);l($i(72,16,_),$i(224,112,_),$i(214,196,_),m)}else if(x<.8)l(240,224,176,m);else{let _=Se(f+1.2,p)-x,b=Se(f,p+1.2)-x;Math.hypot(_,b)>1.3?l(150+g*20,158+g*20,170+g*20,m):l(96+g*36+_*30,188+g*30+_*30,78+g*20,m)}}e.putImageData(i,0,0);let c=h=>(h-s)/(r-s)*n,u=h=>(h-a)/(o-a)*n;e.fillStyle="#c58a4e",e.strokeStyle="#7a5230",e.lineWidth=1;for(let h of js)e.fillRect(c(h.x0),u(h.z0),c(h.x1)-c(h.x0),u(h.z1)-u(h.z0)),e.strokeRect(c(h.x0),u(h.z0),c(h.x1)-c(h.x0),u(h.z1)-u(h.z0));return e.fillStyle="#b5533c",e.fillRect(c(-13),u(10.4),c(-7.2)-c(-13),u(15.4)-u(10.4)),e.fillStyle="#fff",e.strokeStyle="#d8402f",e.lineWidth=2.5,e.beginPath(),e.arc(c($n.x),u($n.z),4.5,0,le),e.fill(),e.stroke(),e.fillStyle="#8d95a1",e.beginPath(),e.ellipse(c(Mi.x),u(Mi.z),4,9,-.35,0,le),e.fill(),t}var wb=Math.PI*2;function jt(n,t=16,e=2,i=!0){let s=[],r=[],a=[],o=n.length,l=t+1;for(let h=0;h<o;h++){let[d,f,p,x=0,m=0]=n[h];for(let g=0;g<=t;g++){let _=g/t*wb,b=Math.cos(_),v=Math.sin(_);e!==2&&(b=Math.sign(b)*Math.pow(Math.abs(b),2/e),v=Math.sign(v)*Math.pow(Math.abs(v),2/e)),s.push(x+f*b,d,m+p*v),r.push(g/t,h/(o-1))}}for(let h=0;h<o-1;h++)for(let d=0;d<t;d++){let f=h*l+d,p=f+l;a.push(f,p,f+1,f+1,p,p+1)}if(i){let[h,,,d=0,f=0]=n[0],[p,,,x=0,m=0]=n[o-1],g=s.length/3;s.push(d,h,f),r.push(.5,0);let _=g+1;s.push(x,p,m),r.push(.5,1);let b=(o-1)*l;for(let v=0;v<t;v++)a.push(g,v,v+1),a.push(_,b+v+1,b+v)}let c=new ve;c.setAttribute("position",new Wt(s,3)),c.setAttribute("uv",new Wt(r,2)),c.setIndex(a),c.computeVertexNormals();let u=c.attributes.normal;for(let h=0;h<o;h++){let d=h*l,f=d+t,p=u.getX(d)+u.getX(f),x=u.getY(d)+u.getY(f),m=u.getZ(d)+u.getZ(f),g=Math.hypot(p,x,m)||1;u.setXYZ(d,p/g,x/g,m/g),u.setXYZ(f,p/g,x/g,m/g)}return c}function Bi(n,t=.01,e=6,i=null){let s=new kr(n.map(o=>new D(o[0],o[1],o[2]))),r=Math.max(8,n.length*5),a=new io(s,r,t,e,!1);if(i){let o=a.attributes.position,l=new D,c=new D;for(let u=0;u<=r;u++){let h=u/r;s.getPointAt(h,l);let d=i(h);for(let f=0;f<=e;f++){let p=u*(e+1)+f;c.fromBufferAttribute(o,p).sub(l).multiplyScalar(d).add(l),o.setXYZ(p,c.x,c.y,c.z)}}a.computeVertexNormals()}return a}function ir(n){let t=new Gn;return n.forEach((e,i)=>i?t.lineTo(e[0],e[1]):t.moveTo(e[0],e[1])),t.closePath(),new eo(t)}var b0=["#fbe0c8","#f3c9a3","#e8b48a","#d99a6c","#c07f52","#9c6238","#7a4a2a","#5a3620"],M0=["#1c1410","#3b2a1a","#5a3a22","#8a5a2b","#c98a3a","#e8c66a","#f4ead0","#b0b6bf","#c2412d","#e85d9a","#3b82f6","#22c55e","#a855f7"],bs=["#f6c21c","#f97316","#ef4444","#e85d9a","#a855f7","#6366f1","#2f6fd6","#22d3ee","#14b8a6","#22c55e","#84cc16","#7c5c3a","#c9a26b","#f1efe6","#9ca3af","#4b5563","#2a2f3a","#111827"],S0=["#3b2a1a","#6b4423","#2f6f4f","#2f6fd6","#6b7280","#0f172a"],nr={body:["\u0421\u0442\u0440\u043E\u0439\u043D\u043E\u0435","\u041E\u0431\u044B\u0447\u043D\u043E\u0435","\u041A\u0440\u0435\u043F\u043A\u043E\u0435","\u041F\u043B\u043E\u0442\u043D\u043E\u0435"],eyes:["\u041A\u0440\u0443\u0433\u043B\u044B\u0435","\u0412\u0435\u0441\u0451\u043B\u044B\u0435","\u0421\u043F\u043E\u043A\u043E\u0439\u043D\u044B\u0435","\u0425\u0438\u0442\u0440\u044B\u0435","\u0411\u043E\u043B\u044C\u0448\u0438\u0435"],brows:["\u041F\u0440\u044F\u043C\u044B\u0435","\u0414\u043E\u043C\u0438\u043A\u043E\u043C","\u0413\u0443\u0441\u0442\u044B\u0435","\u0422\u043E\u043D\u043A\u0438\u0435","\u0421\u0443\u0440\u043E\u0432\u044B\u0435"],mouth:["\u0423\u043B\u044B\u0431\u043A\u0430","\u0412\u043E \u0432\u0435\u0441\u044C \u0440\u043E\u0442","\u0423\u0445\u043C\u044B\u043B\u043A\u0430","\u0421\u043F\u043E\u043A\u043E\u0439\u043D\u044B\u0439","\u0423\u0434\u0438\u0432\u043B\u0451\u043D"],nose:["\u041A\u043D\u043E\u043F\u043A\u0430","\u041A\u0430\u0440\u0442\u043E\u0448\u043A\u0430","\u041E\u0441\u0442\u0440\u044B\u0439"],cheeks:["\u0427\u0438\u0441\u0442\u043E","\u0420\u0443\u043C\u044F\u043D\u0435\u0446","\u0412\u0435\u0441\u043D\u0443\u0448\u043A\u0438"],hair:["\u041B\u044B\u0441\u044B\u0439","\u041A\u043E\u0440\u043E\u0442\u043A\u0430\u044F","\u041B\u043E\u0445\u043C\u0430\u0442\u0430\u044F","\u0427\u0451\u043B\u043A\u0430","\u0425\u0432\u043E\u0441\u0442","\u0414\u043B\u0438\u043D\u043D\u044B\u0435","\u041A\u0430\u0440\u0435","\u041A\u0443\u0434\u0440\u0438","\u0418\u0440\u043E\u043A\u0435\u0437","\u041F\u0443\u0447\u043E\u043A","\u041A\u043E\u0441\u0438\u0447\u043A\u0438"],beard:["\u041D\u0435\u0442","\u0429\u0435\u0442\u0438\u043D\u0430","\u0423\u0441\u044B","\u0411\u043E\u0440\u043E\u0434\u043A\u0430","\u0411\u043E\u0440\u043E\u0434\u0430","\u0411\u043E\u0440\u043E\u0434\u0438\u0449\u0430"],hat:["\u041D\u0435\u0442","\u041A\u0435\u043F\u043A\u0430","\u041A\u0435\u043F\u043A\u0430 \u043D\u0430\u0437\u0430\u0434","\u041F\u0430\u043D\u0430\u043C\u0430","\u0428\u0430\u043F\u043A\u0430","\u0421\u043E\u043B\u043E\u043C\u0435\u043D\u043D\u0430\u044F","\u041A\u0430\u043F\u0438\u0442\u0430\u043D\u0441\u043A\u0430\u044F","\u0411\u0430\u043D\u0434\u0430\u043D\u0430","\u041A\u043E\u0432\u0431\u043E\u0439\u0441\u043A\u0430\u044F"],glasses:["\u041D\u0435\u0442","\u0422\u0451\u043C\u043D\u044B\u0435","\u0410\u0432\u0438\u0430\u0442\u043E\u0440\u044B","\u041A\u0440\u0443\u0433\u043B\u044B\u0435","\u041C\u0430\u0441\u043A\u0430 \u043D\u0430 \u043B\u0431\u0443"],top:["\u0425\u0443\u0434\u0438","\u041A\u0443\u0440\u0442\u043A\u0430","\u0416\u0438\u043B\u0435\u0442 \u0440\u044B\u0431\u0430\u043A\u0430","\u0424\u0443\u0442\u0431\u043E\u043B\u043A\u0430","\u0420\u0443\u0431\u0430\u0448\u043A\u0430 \u0432 \u043A\u043B\u0435\u0442\u043A\u0443","\u0414\u043E\u0436\u0434\u0435\u0432\u0438\u043A","\u0422\u0435\u043B\u044C\u043D\u044F\u0448\u043A\u0430"],bottom:["\u041A\u0430\u0440\u0433\u043E","\u0428\u043E\u0440\u0442\u044B","\u0414\u0436\u0438\u043D\u0441\u044B","\u0412\u0435\u0439\u0434\u0435\u0440\u0441\u044B","\u042E\u0431\u043A\u0430"],shoes:["\u0411\u043E\u0442\u0438\u043D\u043A\u0438","\u0421\u0430\u043F\u043E\u0433\u0438","\u041A\u0440\u043E\u0441\u0441\u043E\u0432\u043A\u0438","\u0428\u043B\u0451\u043F\u0430\u043D\u0446\u044B"],gloves:["\u041D\u0435\u0442","\u0411\u0435\u0437 \u043F\u0430\u043B\u044C\u0446\u0435\u0432","\u041F\u0435\u0440\u0447\u0430\u0442\u043A\u0438"],pack:["\u041D\u0435\u0442","\u0420\u044E\u043A\u0437\u0430\u043A","\u042F\u0449\u0438\u043A \u043D\u0430 \u0440\u0435\u043C\u043D\u0435","\u0422\u0443\u0431\u0443\u0441"]},w0={skin:b0,hairC:M0,eyeC:S0,hatC:bs,topC:bs,topC2:bs,botC:bs,shoeC:bs,gloveC:bs,packC:bs},dn={body:1,height:1,skin:"#f3c9a3",eyes:0,eyeC:"#3b2a1a",brows:0,mouth:0,nose:0,cheeks:0,hair:2,hairC:"#5a3a22",beard:0,hat:1,hatC:"#f6c21c",glasses:4,top:1,topC:"#f6c21c",topC2:"#2a2f3a",bottom:0,botC:"#2a2f3a",shoes:0,shoeC:"#f6c21c",gloves:1,gloveC:"#2a2f3a",pack:1,packC:"#2f6fd6"},sr=[{name:"\u0416\u0451\u043B\u0442\u044B\u0439",look:{...dn}},{name:"\u0424\u0438\u043D\u043D",look:{...dn,hair:7,hairC:"#5a3a22",hat:1,hatC:"#22d3ee",glasses:4,top:3,topC:"#22d3ee",topC2:"#f1efe6",bottom:1,botC:"#c9a26b",shoeC:"#22d3ee",gloves:0,packC:"#2a2f3a",mouth:1}},{name:"\u041D\u043E\u0440\u0438",look:{...dn,body:0,height:.95,hair:5,hairC:"#e85d9a",hat:1,hatC:"#e85d9a",glasses:0,top:2,topC:"#c9a26b",topC2:"#f1efe6",bottom:0,botC:"#2a2f3a",shoeC:"#f6c21c",gloveC:"#2a2f3a",pack:2,packC:"#e85d9a",eyes:4,cheeks:1,skin:"#fbe0c8"}},{name:"\u041F\u0438\u043F",look:{...dn,body:3,height:1.04,hair:1,hairC:"#3b2a1a",beard:5,hat:3,hatC:"#2f6fd6",glasses:0,top:2,topC:"#4b5563",topC2:"#a855f7",bottom:1,botC:"#7c5c3a",shoeC:"#a855f7",gloves:1,gloveC:"#2a2f3a",pack:3,packC:"#a855f7",mouth:1,skin:"#e8b48a",brows:2}},{name:"\u041A\u0430\u043F\u0438\u0442\u0430\u043D",look:{...dn,body:2,hair:1,hairC:"#b0b6bf",beard:4,hat:6,hatC:"#f1efe6",glasses:0,top:6,topC:"#f1efe6",topC2:"#2f6fd6",bottom:2,botC:"#2f6fd6",shoes:1,shoeC:"#111827",gloves:0,pack:0,brows:4,mouth:2,skin:"#d99a6c"}},{name:"\u0414\u043E\u0436\u0434\u044C",look:{...dn,body:0,hair:6,hairC:"#1c1410",hat:0,glasses:3,top:5,topC:"#f6c21c",topC2:"#2a2f3a",bottom:3,botC:"#4b5563",shoes:1,shoeC:"#22c55e",gloves:2,gloveC:"#f97316",pack:2,packC:"#22c55e",eyes:2,skin:"#c07f52"}}];function Ms(n){let t={...dn};if(!n||typeof n!="object")return t;for(let e of Object.keys(dn)){let i=n[e];nr[e]?t[e]=Number.isInteger(i)&&i>=0&&i<nr[e].length?i:dn[e]:e==="height"?t[e]=ne(Number(i)||1,.88,1.12):t[e]=typeof i=="string"&&/^#[0-9a-fA-F]{6}$/.test(i)?i:dn[e]}return t}function E0(n=Math.floor(Math.random()*1e9)){let t=bi(n),e=s=>s[Math.floor(t()*s.length)],i={...dn};for(let s of Object.keys(nr))i[s]=Math.floor(t()*nr[s].length);t()<.6&&(i.beard=0),t()<.45&&(i.glasses=0),t()<.3&&(i.hat=0),i.height=.92+t()*.16,i.skin=e(b0),i.hairC=e(M0.slice(0,t()<.8?8:13)),i.eyeC=e(S0);for(let s of["hatC","topC","topC2","botC","shoeC","gloveC","packC"])i[s]=e(bs);return i}var Eb=[{sw:.93,chest:.165,waist:.142,depth:.104,belly:0,limb:.88},{sw:1,chest:.186,waist:.16,depth:.118,belly:0,limb:1},{sw:1.13,chest:.216,waist:.172,depth:.128,belly:0,limb:1.14},{sw:1.06,chest:.206,waist:.212,depth:.15,belly:.05,limb:1.1}],ot=.2,gu=.84;function Tb(n,t,e,i){n.fillStyle=t.skin,n.fillRect(0,0,1024,512);let a=256,o=274,l=zt(t.hairC,-.35);if(t.cheeks===1)for(let d of[-1,1]){let f=n.createRadialGradient(a+d*74,o+44,2,a+d*74,o+44,30);f.addColorStop(0,"rgba(240,110,110,0.5)"),f.addColorStop(1,"rgba(240,110,110,0)"),n.fillStyle=f,n.fillRect(a+d*74-32,o+12,64,64)}else if(t.cheeks===2){n.fillStyle="rgba(120,70,40,0.55)";let d=bi(11);for(let f=0;f<26;f++){let p=f%2?1:-1;n.beginPath(),n.arc(a+p*(38+d()*56),o+26+d()*30,2.2+d()*1.5,0,le),n.fill()}}if(t.beard===1){let d=n.createRadialGradient(a,o+96,20,a,o+90,120);d.addColorStop(0,"rgba(40,30,25,0.34)"),d.addColorStop(.7,"rgba(40,30,25,0.26)"),d.addColorStop(1,"rgba(40,30,25,0)"),n.fillStyle=d,n.fillRect(a-130,o+26,260,150)}let c=t.eyes===4?1.25:1,u=50;for(let d of[-1,1]){let f=a+d*u,p=27*c,x=(t.eyes===2?24:t.eyes===3?20:31)*c;if(e||t.eyes===1){n.strokeStyle="#2a1c14",n.lineWidth=7,n.lineCap="round",n.beginPath(),t.eyes===1&&!e?n.arc(f,o+8,p*.85,Math.PI*1.12,Math.PI*1.88):n.arc(f,o-10,p*.85,Math.PI*.15,Math.PI*.85),n.stroke();continue}n.fillStyle="#ffffff",n.beginPath(),n.ellipse(f,o,p,x,0,0,le),n.fill(),n.save(),n.clip(),n.fillStyle=t.eyeC,n.beginPath(),n.arc(f+d*-2,o+2,17.5*c,0,le),n.fill(),n.fillStyle="#0b0f14",n.beginPath(),n.arc(f+d*-2,o+2,9.5*c,0,le),n.fill(),n.fillStyle="#ffffff",n.beginPath(),n.arc(f+6,o-7,5.5*c,0,le),n.fill(),(t.eyes===2||t.eyes===3)&&(n.fillStyle=zt(t.skin,-.08),n.beginPath(),t.eyes===2?n.rect(f-p-2,o-x-2,p*2+4,x*.62):(n.moveTo(f-d*(p+2),o-x-2),n.lineTo(f+d*(p+2),o-x-2),n.lineTo(f+d*(p+2),o-x*.75),n.lineTo(f-d*(p+2),o-x*.05)),n.fill()),n.restore(),n.strokeStyle="#2a1c14",n.lineWidth=5,n.beginPath(),n.ellipse(f,o,p,x,0,Math.PI*1.08,Math.PI*1.92),n.stroke()}n.strokeStyle=l,n.lineCap="round",n.lineWidth=t.brows===2?13:t.brows===3?5:9;for(let d of[-1,1]){let f=a+d*u,p=o-50*c;n.beginPath(),t.brows===1?(n.moveTo(f-d*26,p+4),n.quadraticCurveTo(f,p-16,f+d*26,p+6)):t.brows===4?(n.moveTo(f-d*26,p+12),n.lineTo(f+d*26,p-8)):(n.moveTo(f-d*26,p+2),n.quadraticCurveTo(f,p-6,f+d*26,p)),n.stroke()}let h=o+82;n.lineWidth=7,n.strokeStyle="#5a2a22",i>0?(n.fillStyle="#5a1f1f",n.beginPath(),n.ellipse(a,h+2,22,8+i*16,0,0,le),n.fill(),n.fillStyle="#e06a6a",n.beginPath(),n.ellipse(a,h+8+i*8,13,5+i*5,0,0,le),n.fill()):t.mouth===1?(n.fillStyle="#5a1f1f",n.beginPath(),n.moveTo(a-40,h-8),n.quadraticCurveTo(a,h+2,a+40,h-8),n.quadraticCurveTo(a,h+44,a-40,h-8),n.fill(),n.fillStyle="#ffffff",n.beginPath(),n.moveTo(a-34,h-5),n.quadraticCurveTo(a,h+4,a+34,h-5),n.quadraticCurveTo(a,h+14,a-34,h-5),n.fill()):(n.beginPath(),t.mouth===0?(n.moveTo(a-32,h-4),n.quadraticCurveTo(a,h+24,a+32,h-4)):t.mouth===2?(n.moveTo(a-26,h+6),n.quadraticCurveTo(a+6,h+12,a+34,h-10)):t.mouth===3?(n.moveTo(a-22,h+4),n.lineTo(a+22,h+4)):n.ellipse(a,h+6,11,14,0,0,le),n.stroke()),(t.beard===2||t.beard>=4)&&(n.fillStyle=t.hairC,n.beginPath(),n.moveTo(a,h-30),n.quadraticCurveTo(a+34,h-34,a+56,h-6),n.quadraticCurveTo(a+26,h-12,a,h-16),n.quadraticCurveTo(a-26,h-12,a-56,h-6),n.quadraticCurveTo(a-34,h-34,a,h-30),n.fill())}var Yn=class{constructor(t){this.group=new he,this.rod=null,this.pose={},this.t=Math.random()*10,this.walk=0,this.blinkT=2+Math.random()*3,this.blink=!1,this.talkQ=0,this.faceCanvas=document.createElement("canvas"),this.faceCanvas.width=1024,this.faceCanvas.height=512,this.faceTex=new yn(this.faceCanvas),this.faceTex.colorSpace=Oe,this.faceTex.anisotropy=4,this.faceMat=new Me({map:this.faceTex,roughness:.7}),this.setLook(t)}dispose(){this.clear(),this.faceTex.dispose(),this.faceMat.dispose()}clear(){let t=this.rod?this.rod.group:null;t&&t.parent&&t.parent.remove(t),this.group.traverse(e=>{e.isMesh&&e.geometry&&e.userData.own&&e.geometry.dispose()}),this.group.clear(),this.patTex&&(this.patTex.dispose(),this.patTex=null)}setLook(t){let e=this.look=Ms(t);this.clear();let i=Eb[e.body],s=i.limb,r=e.skin,a=this.root=new he;a.scale.setScalar(e.height),this.group.add(a);let o=this.j={},l=(O,L,k,G)=>{let V=new he;return V.position.set(L,k,G),O.add(V),V};o.hips=l(a,0,gu,0),o.torso=l(o.hips,0,0,0),o.head=l(o.torso,0,.505+ot*.9,.012);let c=i.chest+.028;o.aR=l(o.torso,-c,.415,0),o.eR=l(o.aR,0,-.26,0),o.aL=l(o.torso,c,.415,0),o.eL=l(o.aL,0,-.26,0);let u=.092*i.sw+(e.body===3?.012:0);o.lR=l(o.hips,-u,-.03,0),o.kR=l(o.lR,0,-.4,0),o.lL=l(o.hips,u,-.03,0),o.kL=l(o.lL,0,-.4,0),o.rod=l(o.eR,0,-.275,.02),o.rod.rotation.x=Math.PI/2+.6;let h=(O,L)=>{if(L.empty)return;let k=L.build(Yi);k.userData.own=!0,O.add(k)},d=e.bottom===0||e.bottom===2||e.bottom===3,f=e.bottom===4?r:e.botC,p=d?e.botC:r,x=e.shoes===1;for(let O of[-1,1]){let L=new Te,k=.086*s*(e.bottom===1?1.1:1);L.add(R.sph(12,8),f,A(0,0,0,k*2.1,k*2.1,k*2.1)),L.add(jt([[-.4,.068*s*(e.bottom===1?1.12:1),.068*s*(e.bottom===1?1.12:1)],[-.2,.08*s,.08*s],[0,k,k]],12),f,A(0,0,0)),e.bottom===1&&L.add(R.cyl(12),zt(e.botC,-.15),A(0,-.385,0,.165*s,.035,.165*s)),e.bottom===0&&(L.add(R.box(),zt(e.botC,-.12),A(O*.075*s,-.2,0,.035,.13,.11)),L.add(R.box(),zt(e.botC,-.22),A(O*.078*s,-.15,0,.035,.03,.115))),h(O<0?o.lR:o.lL,L);let G=new Te;G.add(R.sph(12,8),d?e.botC:r,A(0,0,0,.14*s,.14*s,.14*s)),G.add(jt([[-.36,.05*s,.05*s],[-.14,.066*s,.07*s],[0,.066*s,.066*s]],12),p,A(0,0,0)),e.bottom===2&&G.add(R.cyl(12),zt(e.botC,.25),A(0,-.31,0,.125*s,.05,.125*s));let V=e.shoes===3?r:e.shoeC;if(G.add(jt([[-.1,.05,.035],[-.04,.062,.05],[.08,.066,.052],[.17,.05,.036]],12,2.6),V,A(0,-.385,.02,s,1,1.02,Math.PI/2,0,0)),e.shoes===3)G.add(R.box(),e.shoeC,A(0,-.43,.04,.12*s,.02,.3)),G.add(R.box(),e.shoeC,A(0,-.385,.1,.11*s,.012,.02,.4,0,0));else{G.add(jt([[-.105,.052,.02],[0,.068,.02],[.175,.052,.02]],12,2.8),e.shoes===2?"#f8fafc":"#1c1917",A(0,-.428,.02,s,1,1,Math.PI/2,0,0)),e.shoes!==2&&G.add(R.sph(10,6),zt(V,-.25),A(0,-.385,.165,.11*s,.075,.07)),e.shoes===2&&G.add(R.box(),"#f8fafc",A(0,-.36,.09,.07,.012,.1,-.5,0,0));let at=x?.27:e.shoes===0?.1:.04;if(G.add(jt([[-.36,.058*s,.06*s],[-.36+at,(x?.074:.062)*s,(x?.078:.064)*s]],12),V,A(0,0,0)),e.shoes===0)for(let $=0;$<3;$++)G.add(R.box(),"#f8fafc",A(0,-.345+$*.022,.06*s,.05,.008,.012))}h(O<0?o.kR:o.kL,G)}let m=new Te,g=e.top===6,_=e.top===4,b=[[-.07,i.waist*.96,i.depth*.95],[.04,i.waist*1.04,i.depth*1.02,0,i.belly*.5],[.17,i.waist,i.depth+i.belly,0,i.belly*.7],[.31,i.chest,i.depth*1.05,0,i.belly*.2],[.41,i.chest*1.04,i.depth],[.465,i.chest*.82,i.depth*.82],[.492,.07,.07]],v=jt(b,18,2.5);if(g||_){let O=new yn(Rb(e,_));O.colorSpace=Oe,O.wrapS=O.wrapT=en;let L=new Rt(v,new Me({map:O,roughness:.85}));L.castShadow=L.receiveShadow=!0,L.userData.own=!0,o.torso.add(L),this.patTex=O}else m.add(v,e.top===2?e.topC2:e.topC,A(0,0,0));let E=(e.bottom===4,e.botC);if(m.add(jt([[-.09,i.waist*.9,i.depth*.9],[-.02,i.waist*1.03,i.depth*1.03],[.055,i.waist*1.07,i.depth*1.06,0,i.belly*.5]],18,2.5),E,A(0,0,0)),e.bottom!==3&&e.bottom!==4&&e.top!==5&&(m.add(jt([[.04,i.waist*1.09,i.depth*1.09,0,i.belly*.5],[.075,i.waist*1.09,i.depth*1.09+i.belly*.4,0,i.belly*.55]],18,2.5,!1),"#3b2a1a",A(0,0,0)),m.add(R.box(),"#fbbf24",A(0,.058,i.depth*1.1+i.belly*.95,.045,.04,.012))),e.bottom===4&&m.add(jt([[-.3,i.waist*1.5,i.depth*1.75],[-.1,i.waist*1.22,i.depth*1.3],[.05,i.waist*1.07,i.depth*1.08]],18,2.3),e.botC,A(0,0,0),{grad:[.8,1.05]}),e.bottom===3){m.add(jt([[-.02,i.waist*1.07,i.depth*1.07,0,i.belly*.4],[.17,i.waist*1.05,i.depth*1.06+i.belly,0,i.belly*.7],[.3,i.chest*1.05,i.depth*1.1,0,i.belly*.2]],18,2.5,!1),e.botC,A(0,0,0));for(let O of[-1,1])m.add(R.box(),zt(e.botC,-.2),A(O*i.chest*.55,.39,i.depth*.92,.035,.2,.02,-.18,0,0)),m.add(R.box(),zt(e.botC,-.2),A(O*i.chest*.55,.39,-i.depth*.92,.035,.2,.02,.18,0,0)),m.add(R.cyl(8),"#fbbf24",A(O*i.chest*.55,.3,i.depth*1.1,.03,.012,.03,Math.PI/2,0,0))}let T=i.depth*1.03+i.belly*.5;if(e.top===0||e.top===5)if(m.add(R.sph(14,10),zt(e.topC,-.06),A(0,.455,-i.depth*.75,i.chest*1.5,.15,.17)),e.top===0){for(let O of[-1,1])m.add(R.cyl(5),"#f8fafc",A(O*.035,.36,T+.012,.01,.13,.01));m.add(jt([[.08,i.waist*.62,.02],[.2,i.waist*.5,.02]],10,3),zt(e.topC,-.1),A(0,0,T+i.belly*.5))}else{m.add(jt([[-.27,i.waist*1.24,i.depth*1.34],[-.05,i.waist*1.1,i.depth*1.12,0,i.belly*.4],[.05,i.waist*1.06,i.depth*1.06,0,i.belly*.5]],18,2.4,!1),e.topC,A(0,0,0),{grad:[.85,1.03]});for(let O=0;O<4;O++)m.add(R.sph(8,6),e.topC2,A(0,.36-O*.11,T+.01+(O===2?i.belly*.4:0),.03,.03,.016))}if(e.top===1){m.add(R.torus(.34,16),e.topC2,A(0,.478,0,.19,.19,.22,Math.PI/2,0,0)),m.add(R.box(),e.topC2,A(0,.24,T+.004+i.belly*.3,.02,.44,.012));for(let O of[-1,1])m.add(R.sph(12,8),e.topC2,A(O*i.chest*.82,.425,0,i.chest*.7,.1,i.depth*1.9)),m.add(R.box(),zt(e.topC,-.12),A(O*i.chest*.5,.3,T+.002,.085,.07,.012)),m.add(R.box(),e.topC2,A(O*i.chest*.5,.335,T+.006,.09,.016,.014))}if(e.top===2)for(let O of[-1,1])m.add(jt([[0,i.waist*.56,i.depth*1.1,0,i.belly*.5],[.17,i.waist*.54,i.depth*1.1+i.belly,0,i.belly*.7],[.31,i.chest*.55,i.depth*1.13],[.43,i.chest*.5,i.depth*1.06]],12,3,!1),e.topC,A(O*i.chest*.52,0,0)),m.add(R.box(),zt(e.topC,-.14),A(O*i.chest*.55,.13,T+.03+i.belly*.6,.1,.09,.03)),m.add(R.box(),zt(e.topC,-.24),A(O*i.chest*.55,.18,T+.034+i.belly*.6,.105,.02,.034)),m.add(R.box(),zt(e.topC,-.14),A(O*i.chest*.55,.3,T+.022,.085,.065,.026));(e.top===3||e.top===4||e.top===6)&&m.add(R.torus(.3,16),zt(e.top===6?e.topC2:e.topC,-.15),A(0,.482,0,.17,.17,.2,Math.PI/2,0,0)),e.top===4&&m.add(R.box(),zt(e.topC,.2),A(0,.25,T+.004,.03,.42,.01)),m.add(R.cyl(10),r,A(0,.5,0,.115,.08,.115));let y=-i.depth*1.02;if(e.pack===1){m.add(jt([[.06,.13,.075],[.2,.15,.085],[.38,.13,.075],[.43,.09,.05]],12,3),e.packC,A(0,0,y-.07),{grad:[.8,1.05]}),m.add(R.box(),zt(e.packC,-.18),A(0,.14,y-.15,.16,.11,.04)),m.add(R.cyl(8),zt(e.packC,.25),A(0,.47,y-.07,.07,.24,.07,0,0,Math.PI/2));for(let O of[-1,1])m.add(jt([[.08,.022,i.depth*1.12],[.3,.022,i.depth*1.15],[.455,.022,i.depth*.95]],10,2.4,!1),zt(e.packC,-.25),A(O*i.chest*.62,0,-.01))}else e.pack===2?(m.add(R.box(),e.packC,A(-i.waist-.07,.02,0,.11,.17,.24),{grad:[.8,1.05]}),m.add(R.box(),zt(e.packC,-.2),A(-i.waist-.07,.115,0,.12,.03,.25)),m.add(jt([[0,i.waist*1.1,i.depth*1.15,0,i.belly*.5],[.02,i.waist*1.1,i.depth*1.15,0,i.belly*.5]],16,2.5,!1),"#3b2a1a",A(.02,.27,0,1,1,1,0,0,-.62))):e.pack===3&&(m.add(R.cyl(10),e.packC,A(.03,.3,y-.06,.11,.62,.11,0,0,.5),{grad:[.8,1.05]}),m.add(R.cyl(10),zt(e.packC,-.25),A(.18,.572,y-.06,.12,.04,.12,0,0,.5)),m.add(jt([[0,i.waist*1.08,i.depth*1.12,0,i.belly*.5],[.022,i.waist*1.08,i.depth*1.12,0,i.belly*.5]],16,2.5,!1),"#3b2a1a",A(-.02,.27,0,1,1,1,0,0,.62)));h(o.torso,m);let M=e.top===3?"short":"long",U=e.top===2?e.topC2:e.topC;for(let O of[-1,1]){let L=new Te,k=.058*s;L.add(R.sph(12,8),U,A(0,0,0,k*2.35,k*2.3,k*2.35)),M==="short"?(L.add(jt([[-.13,k*1.08,k*1.08],[0,k*1.12,k*1.12]],12),U,A(0,0,0)),L.add(jt([[-.26,k*.84,k*.84],[-.12,k*.92,k*.92]],12),r,A(0,0,0))):L.add(jt([[-.26,k*.9,k*.9],[-.12,k*1.02,k*1.02],[0,k*1.1,k*1.1]],12),U,A(0,0,0)),e.top===1&&L.add(R.cyl(10),e.topC2,A(0,-.13,0,k*2.12,.035,k*2.12)),h(O<0?o.aR:o.aL,L);let G=new Te,V=M==="long"?U:r;G.add(R.sph(12,8),V,A(0,0,0,k*1.85,k*1.85,k*1.85)),G.add(jt([[-.225,k*.74,k*.74],[-.08,k*.9,k*.9],[0,k*.9,k*.9]],12),V,A(0,0,0)),M==="long"&&G.add(R.cyl(10),zt(U,-.16),A(0,-.212,0,k*1.62,.035,k*1.62));let at=e.gloves,$=at?e.gloveC:r;G.add(R.sph(12,10),$,A(0,-.283,.005,.105*s,.12*s,.09*s)),G.add(R.sph(10,8),at===2?$:r,A(0,-.325,.02,.085*s,.07*s,.085*s)),G.add(R.sph(8,6),at===2?$:r,A(-O*.04*s,-.275,.035,.04,.07,.04,.5,0,0)),at&&G.add(R.cyl(10),zt($,.3),A(0,-.238,0,.1*s,.022,.09*s)),h(O<0?o.eR:o.eL,G)}let P=new Te,C=new Rt(Ab,this.faceMat);C.scale.set(1,1.06,.98),C.castShadow=C.receiveShadow=!0,o.head.add(C);for(let O of[-1,1])P.add(R.sph(10,8),r,A(O*ot*.98,-.025,-.01,.05,.085,.07));let N=-.052;return e.nose===0?P.add(R.sph(10,8),zt(r,-.04),A(0,N,ot*.98,.052,.045,.05)):e.nose===1?P.add(R.sph(10,8),zt(r,-.05),A(0,N-.006,ot*.985,.078,.062,.066)):P.add(R.cone(8),zt(r,-.04),A(0,N,ot*1.02,.05,.085,.05,Math.PI/2,0,0)),this.buildHair(P,e),this.buildHat(P,e),this.buildBeard(P,e),this.buildGlasses(P,e),h(o.head,P),this.group.traverse(O=>{O.isMesh&&(O.castShadow=!0)}),this.rod&&o.rod.add(this.rod.group),this.redrawFace(!0),this}buildHair(t,e){let i=e.hairC,s=e.hat!==0,r=e.hair;if(r===0)return;let a=-.46,o=(l,c,u=1.045)=>t.add(new xi(ot*u,22,12,0,le,l,c-l),i,A(0,.006,-.004,1,1.06,1,a,0,0));if(r===8){if(!s)for(let l=0;l<7;l++){let c=-.9+l*.36;t.add(R.cone(6),i,A(0,Math.cos(c)*ot*1.12,-Math.sin(c)*ot*1.02-.01,.07,.17,.11,-c,0,0))}o(1.25,1.75,1.02);return}if(r===7){let l=bi(31);for(let c=0;c<34;c++){let u=Math.acos(1-l()*1),h=l()*le;if(s&&u<1.05)continue;let d=new D(Math.sin(u)*Math.cos(h),Math.cos(u),Math.sin(u)*Math.sin(h)).applyAxisAngle(new D(1,0,0),a),f=.085+l()*.035;t.add(R.ico(1),zt(i,(l()-.5)*.12),A(d.x*ot*1.02,d.y*ot*1.06,d.z*ot*1,f,f,f))}return}if(s?o(.95,1.86):o(0,1.62),!(s&&r!==4&&r!==5&&r!==6&&r!==10)){if(r===2&&!s){let l=bi(7);for(let c=0;c<9;c++){let u=l()*le,h=.35+l()*.55;t.add(R.cone(5),zt(i,(l()-.5)*.1),A(Math.cos(u)*h*ot*.8,ot*(1+.1*(1-h)),Math.sin(u)*h*ot*.8-.03,.09,.1+l()*.05,.09,Math.sin(u)*h*.9,0,-Math.cos(u)*h*.9))}}else if(r===3&&!s)t.add(R.sph(12,8),i,A(.045,ot*.72,ot*.72,.27,.11,.15,.5,0,-.3));else if(r===4)t.add(R.sph(10,8),i,A(0,.05,-ot*1.04,.1,.1,.1)),t.add(jt([[-.24,.02,.02],[-.12,.05,.045],[0,.04,.04]],10),i,A(0,.03,-ot*1.22,1,1,1,-.3,0,0));else if(r===5){t.add(R.sph(14,10),i,A(0,-.13,-ot*.62,.37,.48,.17));for(let l of[-1,1])t.add(R.sph(10,8),i,A(l*ot*.9,-.14,-.02,.085,.38,.15))}else if(r===6){t.add(R.sph(14,10),i,A(0,-.07,-ot*.6,.39,.34,.18));for(let l of[-1,1])t.add(R.sph(10,8),i,A(l*ot*.93,-.07,0,.09,.29,.21));s||t.add(R.sph(12,8),i,A(0,ot*.74,ot*.7,.3,.09,.12,.5,0,0))}else if(r===9&&!s)t.add(R.sph(12,10),i,A(0,ot*1.02,-ot*.5,.15,.14,.15));else if(r===10)for(let l of[-1,1]){for(let c=0;c<5;c++)t.add(R.sph(8,6),i,A(l*(ot*.86-c*.004),-.07-c*.055,.075+c*.006,.075-c*.006,.07,.075-c*.006));t.add(R.sph(8,6),"#ef4444",A(l*(ot*.84),-.36,.105,.045,.04,.045))}}}buildHat(t,e){let i=e.hatC,s=e.hat;if(!s)return;let r=zt(i,-.22);if(s===1||s===2){let a=s===2?Math.PI:0,o=s===2?-1:1;t.add(new xi(ot*1.1,22,12,0,le,0,1.36),i,A(0,.012,-.004,1,1.02,1,-.14*o,a,0)),t.add(new Fi(.155,.155,.016,20,1,!1,-Math.PI/2,Math.PI),r,A(0,.075,o*ot*.86,1,1,1.25,.16*o,a,0)),t.add(R.sph(8,6),r,A(0,ot*1.13,-.03*o,.04,.025,.04)),t.add(R.box(),"#f8fafc",A(0,.145,o*ot*1.005,.11,.06,.012,-.5*o,a,0))}else if(s===3)t.add(jt([[.05,ot*1.08,ot*1.08],[.17,ot*.98,ot*.98],[.215,ot*.8,ot*.8]],20),i,A(0,0,0)),t.add(new Fi(ot*1.08,ot*1.62,.085,22,1,!0),i,A(0,.03,0),null),t.add(new Fi(ot*1.07,ot*1.6,.08,22,1,!0).scale(-1,1,1),r,A(0,.027,0),null),t.add(jt([[.07,ot*1.09,ot*1.09],[.095,ot*1.08,ot*1.08]],20,2,!1),r,A(0,0,0));else if(s===4)t.add(new xi(ot*1.1,22,12,0,le,0,1.5),i,A(0,.01,-.004,1,1.08,1,-.2,0,0)),t.add(R.torus(.3,22),r,A(0,.05,-.02,ot*2.24,ot*2.24,.2,Math.PI/2-.2,0,0)),t.add(R.ico(1),"#f8fafc",A(0,ot*1.22,-.05,.1,.1,.1));else if(s===5)t.add(R.cyl(24),"#e3c57a",A(0,.092,0,ot*3.5,.014,ot*3.5)),t.add(jt([[.09,ot*1.06,ot*1.06],[.2,ot*.92,ot*.92],[.225,ot*.7,ot*.7]],20),"#e3c57a",A(0,0,0),{grad:[.9,1.05]}),t.add(jt([[.1,ot*1.08,ot*1.08],[.132,ot*1.05,ot*1.05]],20,2,!1),i,A(0,0,0));else if(s===6)t.add(jt([[.07,ot*1.04,ot*1.04],[.13,ot*1.08,ot*1.08],[.19,ot*1.3,ot*1.3],[.215,ot*1.2,ot*1.2]],22),i,A(0,0,0)),t.add(jt([[.07,ot*1.06,ot*1.06],[.115,ot*1.07,ot*1.07]],22,2,!1),"#1e2a44",A(0,0,0)),t.add(new Fi(.15,.15,.014,20,1,!1,-Math.PI/2,Math.PI),"#111827",A(0,.072,ot*.9,1,1,1.05,.22,0,0)),t.add(R.sph(8,6),"#fbbf24",A(0,.13,ot*1.1,.055,.055,.02));else if(s===7){t.add(new xi(ot*1.075,22,12,0,le,0,1.42),i,A(0,.008,-.004,1,1.05,1,-.3,0,0)),t.add(R.sph(8,6),r,A(0,0,-ot*1.08,.07,.06,.06));for(let a of[-1,1])t.add(R.cone(5),i,A(a*.04,-.07,-ot*1.12,.07,.16,.03,.3,0,a*.35))}else s===8&&(t.add(R.cyl(24),i,A(0,.095,0,ot*3.4,.016,ot*3)),t.add(R.torus(.1,24),i,A(0,.105,0,ot*3.4,ot*3,.3,Math.PI/2,0,0)),t.add(jt([[.09,ot*1.06,ot*1.06],[.2,ot*.9,ot*.98],[.245,ot*.55,ot*.86]],20),i,A(0,0,0),{grad:[.88,1.05]}),t.add(jt([[.1,ot*1.08,ot*1.08],[.128,ot*1.06,ot*1.06]],20,2,!1),r,A(0,0,0)))}buildBeard(t,e){let i=e.hairC;if(e.beard===3&&t.add(R.sph(10,8),i,A(0,-.168,ot*.72,.085,.095,.075)),e.beard>=4){let s=e.beard===5?1.1:1.05;t.add(new xi(ot*s,20,10,Math.PI/2-1.5,3,2.3,.84),i,A(0,0,0,1,1.06,1));for(let r of[-1,1])t.add(R.sph(8,6),i,A(r*ot*.9,-.09,.03,.06,.17,.12));e.beard===5&&t.add(R.sph(12,10),i,A(0,-.275,ot*.46,.26,.2,.2))}}buildGlasses(t,e){let i=e.glasses;if(!i)return;let s=-.026,r=ot*.965,a=.066;if(i===4){let l=e.hat===1||e.hat===3||e.hat===4||e.hat===7,c=l?.105:.075,u=l?ot*1:ot*.93;t.add(R.torus(.09,24),"#1f2937",A(0,c,0,ot*2.24,ot*2.24,.26,Math.PI/2-(l?.25:.12),0,0));for(let h of[-1,1])t.add(R.cyl(12),"#1f2937",A(h*.058,c+.004,u,.092,.03,.074,Math.PI/2-.45,0,0)),t.add(R.cyl(12),"#7dd3fc",A(h*.058,c+.006,u+.014,.074,.012,.058,Math.PI/2-.45,0,0));return}let o=i===2?"#d4a017":"#111827";for(let l of[-1,1])i===1?t.add(R.box(),"#0b0f14",A(l*a,s,r+.012,.092,.058,.016,0,l*.3,0)):i===2?(t.add(R.sph(12,8),"#3b2f12",A(l*a,s-.004,r+.01,.098,.084,.02,0,l*.3,0)),t.add(R.torus(.06,16),o,A(l*a,s-.004,r+.012,.098,.084,.1,0,l*.3,0))):t.add(R.torus(.07,16),o,A(l*a,s,r+.012,.086,.086,.1,0,l*.3,0)),t.add(R.box(),o,A(l*(ot*.82),s+.008,ot*.42,.012,.014,ot*1.05,0,l*.16,0));t.add(R.box(),o,A(0,s+.012,r+.022,.05,.012,.012))}redrawFace(t){let e=this.talkQ,i=(this.blink?1:0)+e*2;!t&&i===this.faceKey||(this.faceKey=i,Tb(this.faceCanvas.getContext("2d"),this.look,this.blink,e/2),this.faceTex.needsUpdate=!0)}setRod(t){this.rod&&this.rod.group.parent&&this.rod.group.parent.remove(this.rod.group),this.rod=t,t&&this.j.rod.add(t.group)}update(t,e){let i=this.j;this.t+=t;let s=this.t,r={hy:0,hrx:0,hry:0,trx:0,try:0,trz:0,headX:0,headY:0,aRx:.06,aRz:-.14,eR:-.22,aLx:.06,aLz:.14,eL:-.22,lRx:0,kR:0,lLx:0,kL:0,lRz:-.03,lLz:.03,rod:.6},a=e.mode||"idle",o=Math.sin(s*1.7)*.012;r.trx+=o,r.hrz=Math.sin(s*.6)*.015;let l=Math.min(1.25,(e.speed||0)/2.4);if(l>.03&&!e.sit){this.walk+=t*(4.6+l*5.2);let d=Math.sin(this.walk),f=Math.cos(this.walk),p=.62*Math.min(1,l);r.lRx=-p*d,r.lLx=p*d,r.kR=p*1.25*Math.max(0,f),r.kL=p*1.25*Math.max(0,-f),r.hy-=Math.abs(f)*.03*Math.min(1,l),r.aLx=.06-p*.75*d,r.aRx=.06+p*.75*d,r.eL=-.3-p*.3,r.eR=-.3-p*.3,r.trx+=.07*Math.min(1,l),r.try=d*.06*Math.min(1,l)}if(a!=="idle"&&(r.aRx=-.42+(l>.03?Math.sin(this.walk)*.06:0),r.aRz=-.1,r.eR=-1.2,r.rod=.6),a==="charge"){let d=ne(e.castK??1,0,1);r.aRx=-.42-1.75*d,r.aRz=-.28*d,r.eR=-1.2-.35*d,r.rod=.6-.45*d,r.trx-=.14*d,r.try=-.25*d}else if(a==="cast"){let d=ne(e.castK??0,0,1);r.aRx=-2.17+1.3*d,r.eR=-1.55+1.1*d,r.rod=.15+.9*d,r.trx+=.22*d-.1,r.try=-.25+.4*d}else if(a==="wait")r.aRx=-.52,r.aRz=.02,r.eR=-1.02,r.rod=.96+Math.sin(s*.8)*.02,r.aLx=-.66,r.aLz=-.42,r.eL=-1.32,e.reel&&(r.aLx+=Math.sin(s*11)*.07,r.eL+=Math.cos(s*11)*.1);else if(a==="fight"){let d=Math.sin(s*13)*.02;r.aRx=-.8+d,r.aRz=.02,r.eR=-1.52,r.rod=.5,r.trx-=.17,r.hrx=-.05,r.try=-(e.steer||0)*.3,r.aLx=-.72+(e.reel?Math.sin(s*14)*.09:0),r.aLz=-.42,r.eL=-1.5+(e.reel?Math.cos(s*14)*.12:0),r.lRx=-.18,r.lLx=.2,r.kL=.25}else if(a==="landed"){let d=Math.abs(Math.sin(s*7))*.05;r.hy+=d,r.aLx=-2.7,r.aLz=.25,r.eL=-.25+Math.sin(s*9)*.15,r.aRx=-.9,r.eR=-1.35,r.rod=.3,r.trx-=.08}if(e.emote==="wave")r.aLx=-.3,r.aLz=2.5,r.eL=-.5+Math.sin(s*11)*.45,r.headY=.1;else if(e.emote==="thumb")r.aLx=-1.25,r.aLz=.1,r.eL=-1.35,r.trz=-.05;else if(e.emote==="cheer")r.hy+=Math.abs(Math.sin(s*8))*.1,r.aLx=-2.8,r.aLz=.3,r.eL=-.2,a==="idle"&&(r.aRx=-2.8,r.aRz=-.3,r.eR=-.2);else if(e.emote==="dance"){let d=Math.sin(s*7);r.hy+=Math.abs(d)*.04-.03,r.hrz=d*.12,r.trz=-d*.14,r.try=d*.25,r.aLx=-1.2+d*.5,r.eL=-1.3,r.kR=.25+d*.15,r.kL=.25-d*.15,r.lRx=-.15,r.lLx=-.15}e.variant&&a!=="charge"&&a!=="cast"&&!e.emote&&(e.variant===1?(r.aLx=-1.2,r.aLz=.15,r.eL=-1.4):e.variant===2?(r.aLx=.25,r.aLz=.75,r.eL=-1.75,r.hrz=.05):e.variant===3&&(r.aLx=-.2,r.aLz=2.3,r.eL=-.7+Math.sin(s*6)*.3)),e.sit&&(r.hy=-gu+(e.dangle?.1:.12),r.lRx=r.lLx=-1.52,r.kR=r.kL=e.dangle?1.45+Math.sin(s*1.6)*.12:.12,e.dangle&&(r.kL=1.45-Math.sin(s*1.6)*.12),r.lRz=-.08,r.lLz=.08,r.trx+=.06),r.headX=ne(-(e.pitch||0)*.55,-.5,.5)+(a==="fight"?.1:0);let c=this.pose,u=e.snap?1e6:13;for(let d in r)c[d]=c[d]===void 0?r[d]:_i(c[d],r[d],d==="aRx"||d==="eR"||d==="rod"?20:u,t);i.hips.position.y=gu+c.hy,i.hips.rotation.set(c.hrx,c.hry,c.hrz),i.torso.rotation.set(c.trx,c.try,c.trz),i.head.rotation.set(c.headX,c.headY,0),i.aR.rotation.set(c.aRx,0,c.aRz),i.eR.rotation.x=c.eR,i.aL.rotation.set(c.aLx,0,c.aLz),i.eL.rotation.x=c.eL,i.lR.rotation.set(c.lRx,0,c.lRz),i.kR.rotation.x=c.kR,i.lL.rotation.set(c.lLx,0,c.lLz),i.kL.rotation.x=c.kL,i.rod.rotation.x=Math.PI/2+c.rod,this.blinkT-=t,this.blinkT<=0&&(this.blink=!this.blink,this.blinkT=this.blink?.12:2.2+Math.random()*3.5);let h=e.talk||0;this.talkQ=h>.08?Math.sin(s*17)>0?2:1:0,this.redrawFace(!1)}},Ab=new xi(ot,32,24);function Rb(n,t){let e=document.createElement("canvas");e.width=e.height=128;let i=e.getContext("2d");if(i.fillStyle=n.topC,i.fillRect(0,0,128,128),t){i.globalAlpha=.55,i.fillStyle=n.topC2;for(let s=0;s<8;s++)i.fillRect(s*16+2,0,5,128),i.fillRect(0,s*16+2,128,5);i.globalAlpha=.5,i.fillStyle="#ffffff";for(let s=0;s<8;s++)i.fillRect(s*16+11,0,1.5,128),i.fillRect(0,s*16+11,128,1.5)}else{i.fillStyle=n.topC2;for(let s=0;s<8;s++)i.fillRect(0,s*16+3,128,7)}return e}var Sn=[{key:"common",name:"\u041E\u0431\u044B\u0447\u043D\u0430\u044F",color:"#dbe4ee",mult:1},{key:"uncommon",name:"\u041D\u0435\u043E\u0431\u044B\u0447\u043D\u0430\u044F",color:"#4ade80",mult:.45},{key:"rare",name:"\u0420\u0435\u0434\u043A\u0430\u044F",color:"#38bdf8",mult:.16},{key:"epic",name:"\u042D\u043F\u0438\u0447\u0435\u0441\u043A\u0430\u044F",color:"#c084fc",mult:.05},{key:"legend",name:"\u041B\u0435\u0433\u0435\u043D\u0434\u0430\u0440\u043D\u0430\u044F",color:"#fbbf24",mult:.012}],Kn={pier:{name:"\u0423 \u0441\u0432\u0430\u0439",hint:"\u041F\u043E\u0434 \u0441\u0430\u043C\u044B\u043C \u043F\u0440\u0438\u0447\u0430\u043B\u043E\u043C",act:1.1},shallow:{name:"\u041C\u0435\u043B\u043A\u043E\u0432\u043E\u0434\u044C\u0435",hint:"\u0423 \u0431\u0435\u0440\u0435\u0433\u0430, \u0434\u043E 2,5 \u043C",act:1},mid:{name:"\u0421\u0440\u0435\u0434\u043D\u044F\u044F \u0432\u043E\u0434\u0430",hint:"\u041E\u0442 2,5 \u0434\u043E 6 \u043C",act:1},deep:{name:"\u0413\u043B\u0443\u0431\u0438\u043D\u0430",hint:"\u0413\u043B\u0443\u0431\u0436\u0435 6 \u043C",act:.88},backwater:{name:"\u0417\u0430\u0432\u043E\u0434\u044C",hint:"\u0422\u0438\u0445\u0430\u044F \u0432\u043E\u0434\u0430 \u0441 \u043A\u0443\u0432\u0448\u0438\u043D\u043A\u0430\u043C\u0438 \u043D\u0430 \u0437\u0430\u043F\u0430\u0434\u0435",act:1},reef:{name:"\u0420\u0438\u0444",hint:"\u041A\u0430\u043C\u043D\u0438 \u0438 \u0431\u0435\u0440\u0435\u0433 \u043E\u0441\u0442\u0440\u043E\u0432\u0430",act:1.1},falls:{name:"\u0412\u043E\u0434\u043E\u043F\u0430\u0434",hint:"\u041F\u0440\u0435\u0441\u043D\u0430\u044F \u0432\u043E\u0434\u0430 \u043F\u043E\u0434 \u0441\u043A\u0430\u043B\u0430\u043C\u0438 \u043E\u0441\u0442\u0440\u043E\u0432\u0430",act:1.15},arch:{name:"\u0410\u0440\u043A\u0430",hint:"\u041A\u0430\u043C\u0435\u043D\u043D\u0430\u044F \u0430\u0440\u043A\u0430 \u043D\u0430 \u0432\u043E\u0441\u0442\u043E\u043A\u0435",act:.62}},T0={dawn:"\u0420\u0430\u0441\u0441\u0432\u0435\u0442",day:"\u0414\u0435\u043D\u044C",dusk:"\u0417\u0430\u043A\u0430\u0442",night:"\u041D\u043E\u0447\u044C"},Ne=(n,t,e,i,s,r,a,o,l,c,u,h,d,f={})=>({id:n,name:t,rar:e,w:[i,s],price:r,str:a,zones:o,baits:l,lure:c,time:u||{},look:h,desc:d,...f}),wn=[Ne("bychok","\u0411\u044B\u0447\u043E\u043A",0,.04,.28,9,.6,{pier:6,shallow:5,reef:2,mid:1},{worm:1.4,maggot:1.2,shrimp:1.3,bread:.7},0,null,{shape:"goby",back:"#6b5a3c",side:"#a08a5f",belly:"#e8dcc0",fin:"#7a6a48",pat:"marble",patC:"#4a3d27",lenK:31},"\u0413\u043E\u043B\u043E\u0432\u0430\u0441\u0442\u044B\u0439 \u0436\u0438\u0442\u0435\u043B\u044C \u0441\u0432\u0430\u0439. \u041A\u043B\u044E\u0451\u0442 \u043D\u0430 \u0432\u0441\u0451 \u0438 \u0432\u0441\u0435\u0433\u0434\u0430 \u2014 \u043F\u0435\u0440\u0432\u0430\u044F \u0440\u044B\u0431\u0430 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0440\u044B\u0431\u0430\u043A\u0430."),Ne("plotva","\u041F\u043B\u043E\u0442\u0432\u0430",0,.08,.6,11,.7,{backwater:5,shallow:5,mid:2,falls:1},{bread:1.3,maggot:1.5,worm:1.1,corn:1},0,null,{shape:"std",back:"#5f7480",side:"#cfd9de",belly:"#f4f6f6",fin:"#e2572f",pat:"scales",lenK:34},"\u0421\u0435\u0440\u0435\u0431\u0440\u0438\u0441\u0442\u0430\u044F, \u0441 \u043A\u0440\u0430\u0441\u043D\u044B\u043C\u0438 \u043F\u043B\u0430\u0432\u043D\u0438\u043A\u0430\u043C\u0438. \u041B\u044E\u0431\u0438\u0442 \u0442\u0438\u0445\u0443\u044E \u0432\u043E\u0434\u0443 \u0438 \u0445\u043B\u0435\u0431\u043D\u044B\u0439 \u043C\u044F\u043A\u0438\u0448."),Ne("karas","\u041A\u0430\u0440\u0430\u0441\u044C",0,.15,1.4,16,.9,{backwater:7,shallow:1},{bread:1.4,corn:1.4,worm:1.1,maggot:1.1},0,null,{shape:"tall",back:"#7a6a2a",side:"#d9b14a",belly:"#f1e2a8",fin:"#a8742a",pat:"scales",lenK:29},"\u0417\u043E\u043B\u043E\u0442\u0438\u0441\u0442\u044B\u0439 \u0443\u0432\u0430\u043B\u0435\u043D\u044C \u0438\u0437 \u0437\u0430\u0432\u043E\u0434\u0438. \u0411\u0435\u0440\u0451\u0442 \u043D\u0435\u0442\u043E\u0440\u043E\u043F\u043B\u0438\u0432\u043E, \u043D\u043E \u0443\u043F\u0438\u0440\u0430\u0435\u0442\u0441\u044F \u0447\u0435\u0441\u0442\u043D\u043E."),Ne("stavrida","\u0421\u0442\u0430\u0432\u0440\u0438\u0434\u0430",0,.08,.55,13,.9,{mid:6,deep:3,shallow:1,reef:1},{shrimp:1.4,worm:.8,maggot:.9},1,null,{shape:"slim",back:"#3f7d86",side:"#bcd3d6",belly:"#f2f6f6",fin:"#c9b458",pat:"line",patC:"#e4d24a",lenK:36},"\u0425\u043E\u0434\u0438\u0442 \u0441\u0442\u0430\u044F\u043C\u0438 \u043D\u0430 \u0441\u0440\u0435\u0434\u043D\u0435\u0439 \u0432\u043E\u0434\u0435. \u0425\u043E\u0440\u043E\u0448\u043E \u0438\u0434\u0451\u0442 \u043D\u0430 \u0431\u043B\u0435\u0441\u043D\u0443."),Ne("okun","\u041E\u043A\u0443\u043D\u044C",0,.1,1.3,18,1,{pier:5,reef:4,shallow:2,backwater:2,mid:1,falls:2},{worm:1.5,maggot:1.1,live:1.2,shrimp:1},1.2,null,{shape:"std",back:"#4d6b2f",side:"#9fb04a",belly:"#f0ecc8",fin:"#e0522a",pat:"bars",patC:"#26391a",lenK:32},"\u041F\u043E\u043B\u043E\u0441\u0430\u0442\u044B\u0439 \u0440\u0430\u0437\u0431\u043E\u0439\u043D\u0438\u043A. \u0414\u0435\u0440\u0436\u0438\u0442\u0441\u044F \u0443 \u0441\u0432\u0430\u0439 \u0438 \u043A\u0430\u043C\u043D\u0435\u0439, \u0445\u0432\u0430\u0442\u0430\u0435\u0442 \u0447\u0435\u0440\u0432\u044F \u0441 \u0440\u0430\u0437\u0433\u043E\u043D\u0430."),Ne("kefal","\u041A\u0435\u0444\u0430\u043B\u044C",0,.25,2.2,24,1.1,{shallow:4,mid:4,pier:2,reef:1},{bread:1.5,corn:1.1,maggot:1,worm:.8},0,null,{shape:"slim",back:"#566673",side:"#c2ccd2",belly:"#f4f5f5",fin:"#7d8a94",pat:"lines",patC:"#7c8c97",lenK:37},"\u041E\u0441\u0442\u043E\u0440\u043E\u0436\u043D\u0430\u044F \u0438 \u0431\u044B\u0441\u0442\u0440\u0430\u044F. \u041B\u0443\u0447\u0448\u0435 \u0432\u0441\u0435\u0433\u043E \u043A\u043B\u044E\u0451\u0442 \u043D\u0430 \u0445\u043B\u0435\u0431 \u0443 \u0441\u0430\u043C\u043E\u0433\u043E \u0431\u0435\u0440\u0435\u0433\u0430."),Ne("kambala","\u041A\u0430\u043C\u0431\u0430\u043B\u0430",1,.25,3.2,46,1,{deep:5,mid:3,shallow:1},{worm:1.3,shrimp:1.5,squid:1.3},0,null,{shape:"flat",back:"#6f5a3a",side:"#8b7347",belly:"#efe6d2",fin:"#7b6540",pat:"spots",patC:"#e07b2c",lenK:30},"\u041F\u043B\u043E\u0441\u043A\u0430\u044F \u0445\u0438\u0442\u0440\u044E\u0433\u0430 \u0441 \u043F\u0435\u0441\u0447\u0430\u043D\u043E\u0433\u043E \u0434\u043D\u0430. \u0418\u0449\u0438\u0442\u0435 \u0435\u0451 \u043D\u0430 \u0433\u043B\u0443\u0431\u0438\u043D\u0435."),Ne("skumbria","\u0421\u043A\u0443\u043C\u0431\u0440\u0438\u044F",1,.2,1.6,42,1.4,{mid:4,deep:5,reef:1},{shrimp:1.2,squid:1.2,live:1},1.6,null,{shape:"slim",back:"#1f6f8a",side:"#b9d6d8",belly:"#f5f8f8",fin:"#3d6c7a",pat:"tiger",patC:"#123c4d",lenK:37},"\u0421\u0442\u0440\u0435\u043C\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F, \u0441 \u0442\u0438\u0433\u0440\u043E\u0432\u043E\u0439 \u0441\u043F\u0438\u043D\u043E\u0439. \u041E\u0431\u043E\u0436\u0430\u0435\u0442 \u0431\u043B\u0451\u0441\u043D\u044B."),Ne("lesh","\u041B\u0435\u0449",1,.4,3.5,50,1.1,{backwater:5,mid:2,deep:1},{corn:1.5,maggot:1.4,worm:1.2,bread:1},0,{dawn:1.4,night:1.2},{shape:"tall",back:"#5d5a4a",side:"#b9b39a",belly:"#ece8d8",fin:"#575248",pat:"scales",lenK:33},"\u0428\u0438\u0440\u043E\u043A\u0438\u0439, \u043A\u0430\u043A \u0441\u043A\u043E\u0432\u043E\u0440\u043E\u0434\u0430. \u041B\u0443\u0447\u0448\u0435 \u0432\u0441\u0435\u0433\u043E \u0431\u0435\u0440\u0451\u0442 \u043D\u0430 \u0440\u0430\u0441\u0441\u0432\u0435\u0442\u0435."),Ne("morokun","\u041C\u043E\u0440\u0441\u043A\u043E\u0439 \u043E\u043A\u0443\u043D\u044C",1,.3,3,58,1.3,{reef:6,deep:2,arch:2,pier:1},{shrimp:1.5,squid:1.3,live:1.2,worm:.7},1,null,{shape:"std",back:"#b53a22",side:"#e8643a",belly:"#f6c9a8",fin:"#d8492a",pat:"marble",patC:"#8f2a18",lenK:31,bigEye:!0},"\u041A\u0440\u0430\u0441\u043D\u044B\u0439 \u043A\u043E\u043B\u044E\u0447\u0438\u0439 \u0436\u0438\u0442\u0435\u043B\u044C \u0440\u0438\u0444\u0430. \u041D\u0430 \u0440\u044B\u043D\u043A\u0435 \u0435\u0433\u043E \u0440\u0430\u0437\u0431\u0438\u0440\u0430\u044E\u0442 \u043F\u0435\u0440\u0432\u044B\u043C."),Ne("sargan","\u0421\u0430\u0440\u0433\u0430\u043D",1,.15,1.1,48,1.2,{mid:5,shallow:2,deep:2},{shrimp:1.2,live:1.3},1.5,{dawn:1.3,dusk:1.3},{shape:"needle",back:"#2f8a6a",side:"#c9e0d6",belly:"#f6f9f7",fin:"#5a9a84",pat:"line",patC:"#3fb7a0",lenK:62},"\u0420\u044B\u0431\u0430-\u0441\u0442\u0440\u0435\u043B\u0430 \u0441 \u0434\u043B\u0438\u043D\u043D\u044B\u043C \u043A\u043B\u044E\u0432\u043E\u043C. \u0413\u043E\u043D\u044F\u0435\u0442\u0441\u044F \u0437\u0430 \u0431\u043B\u0435\u0441\u043D\u043E\u0439 \u0443 \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u0438."),Ne("karp","\u041A\u0430\u0440\u043F",1,1,9,95,1.35,{backwater:5,falls:1},{corn:1.7,bread:1.2,worm:1,maggot:.9},0,{dawn:1.3,dusk:1.3,night:1.1},{shape:"carp",back:"#5a4a22",side:"#c08f3a",belly:"#f0dfa6",fin:"#9a5a2a",pat:"scales",lenK:30},"\u0421\u0438\u043B\u0430\u0447 \u0438\u0437 \u0437\u0430\u0432\u043E\u0434\u0438. \u0411\u0435\u0437 \u043A\u0440\u0435\u043F\u043A\u043E\u0439 \u043B\u0435\u0441\u043A\u0438 \u043B\u0443\u0447\u0448\u0435 \u043D\u0435 \u0441\u0432\u044F\u0437\u044B\u0432\u0430\u0442\u044C\u0441\u044F."),Ne("shuka","\u0429\u0443\u043A\u0430",2,.8,11,170,1.6,{backwater:4,falls:3,shallow:1,mid:1},{live:1.8},1.7,{dawn:1.4,dusk:1.3},{shape:"pike",back:"#3d5a2a",side:"#7f9a4a",belly:"#eef0d0",fin:"#a8672a",pat:"spots",patC:"#d7e08a",lenK:47},"\u0417\u0443\u0431\u0430\u0441\u0442\u0430\u044F \u0445\u043E\u0437\u044F\u0439\u043A\u0430 \u0442\u0438\u0445\u043E\u0439 \u0432\u043E\u0434\u044B. \u0411\u0435\u0440\u0451\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0436\u0438\u0432\u0446\u0430 \u0438 \u0431\u043B\u0435\u0441\u043D\u0443."),Ne("sudak","\u0421\u0443\u0434\u0430\u043A",2,.6,7.5,190,1.5,{deep:5,mid:2,backwater:1},{live:1.7,squid:1,worm:.5},1.5,{dusk:1.6,night:1.6,day:.6},{shape:"slim",back:"#56664a",side:"#aab592",belly:"#f0f0e0",fin:"#6b7558",pat:"bars",patC:"#39452f",lenK:42},"\u041D\u043E\u0447\u043D\u043E\u0439 \u043E\u0445\u043E\u0442\u043D\u0438\u043A \u0433\u043B\u0443\u0431\u0438\u043D\u044B. \u0414\u043D\u0451\u043C \u043F\u043E\u0447\u0442\u0438 \u043D\u0435 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F."),Ne("forel","\u0424\u043E\u0440\u0435\u043B\u044C",2,.3,4.5,210,1.5,{falls:8,reef:1},{maggot:1.3,worm:1.2,corn:1,shrimp:1},1.5,{dawn:1.4,dusk:1.2,night:.6},{shape:"std",back:"#5b6b3a",side:"#c9b79a",belly:"#f3ead8",fin:"#b0703a",pat:"dots",patC:"#2c2c22",band:"#e37a8c",lenK:38},"\u0416\u0438\u0432\u0451\u0442 \u0432 \u043F\u0440\u0435\u0441\u043D\u043E\u0439 \u0441\u0442\u0440\u0443\u0435 \u043F\u043E\u0434 \u0432\u043E\u0434\u043E\u043F\u0430\u0434\u043E\u043C. \u041A\u0440\u0430\u0441\u0438\u0432\u0430 \u0438 \u0441\u0438\u043B\u044C\u043D\u0430."),Ne("dorado","\u0414\u043E\u0440\u0430\u0434\u0430",2,.4,4.5,230,1.5,{reef:6,arch:2,deep:1},{shrimp:1.7,squid:1.3,worm:.7},0,null,{shape:"tall",back:"#6f8794",side:"#d5dde0",belly:"#f6f7f7",fin:"#8795a0",pat:"scales",band:"#e8b830",lenK:31},"\u0421\u0435\u0440\u0435\u0431\u0440\u044F\u043D\u0430\u044F, \u0441 \u0437\u043E\u043B\u043E\u0442\u043E\u0439 \u0431\u0440\u043E\u0432\u044C\u044E. \u0420\u0438\u0444\u043E\u0432\u0430\u044F \u043B\u0430\u043A\u043E\u043C\u043A\u0430 \u2014 \u043F\u043E\u0434\u0430\u0432\u0430\u0439 \u0435\u0439 \u043A\u0440\u0435\u0432\u0435\u0442\u043A\u0443."),Ne("sibas","\u0421\u0438\u0431\u0430\u0441",2,.6,8,240,1.7,{reef:4,deep:3,mid:2,arch:2},{live:1.6,shrimp:1.3,squid:1.2},1.6,{dawn:1.3,dusk:1.4,night:1.1},{shape:"std",back:"#4a5a66",side:"#c3ccd2",belly:"#f5f6f6",fin:"#5c6a75",pat:"scales",lenK:40},"\u041C\u043E\u0440\u0441\u043A\u043E\u0439 \u0432\u043E\u043B\u043A. \u0411\u044C\u0451\u0442\u0441\u044F \u0434\u043E \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0433\u043E \u0438 \u0447\u0430\u0441\u0442\u043E \u0440\u0432\u0451\u0442 \u0441\u043B\u0430\u0431\u0443\u044E \u043B\u0435\u0441\u043A\u0443."),Ne("ugor","\u0423\u0433\u043E\u0440\u044C",2,.4,4.5,260,1.6,{pier:3,backwater:3,deep:2,reef:2},{worm:1.6,live:1.3,shrimp:1},0,{night:2.2,dusk:1.2,day:.25,dawn:.6},{shape:"eel",back:"#3a3d26",side:"#6f6b3a",belly:"#d9d2a0",fin:"#4a4a2c",pat:"none",lenK:78},"\u0421\u043A\u043E\u043B\u044C\u0437\u043A\u0438\u0439 \u043D\u043E\u0447\u043D\u043E\u0439 \u0433\u043E\u0441\u0442\u044C. \u0414\u043D\u0451\u043C \u0435\u0433\u043E \u043F\u043E\u0447\u0442\u0438 \u043D\u0435 \u043F\u043E\u0439\u043C\u0430\u0442\u044C."),Ne("som","\u0421\u043E\u043C",3,4,45,900,1.7,{backwater:3,deep:2},{live:1.8,squid:1.5,worm:.8},.6,{night:2.2,dusk:1.5,day:.35,dawn:.8},{shape:"cat",back:"#2f3a2c",side:"#5c6648",belly:"#e6e0c4",fin:"#39422f",pat:"marble",patC:"#1c241a",lenK:44},"\u0423\u0441\u0430\u0442\u044B\u0439 \u0432\u0435\u043B\u0438\u043A\u0430\u043D. \u0412\u044B\u0445\u043E\u0434\u0438\u0442 \u043D\u0430 \u043E\u0445\u043E\u0442\u0443 \u0432 \u0442\u0435\u043C\u043D\u043E\u0442\u0435 \u0438 \u0442\u044F\u043D\u0435\u0442, \u043A\u0430\u043A \u0442\u0440\u0430\u043A\u0442\u043E\u0440."),Ne("tunec","\u0422\u0443\u043D\u0435\u0446",3,6,70,1500,2.3,{deep:3,arch:2},{live:1.5,squid:1.6},1.8,{dawn:1.3,day:1.1},{shape:"tuna",back:"#17335c",side:"#9fb3c4",belly:"#f0f3f5",fin:"#e8c62a",pat:"none",lenK:37},"\u0422\u043E\u0440\u043F\u0435\u0434\u0430 \u043E\u0442\u043A\u0440\u044B\u0442\u043E\u0433\u043E \u043C\u043E\u0440\u044F. \u0417\u0430\u0445\u043E\u0434\u0438\u0442 \u0432 \u0431\u0443\u0445\u0442\u0443 \u0442\u043E\u043B\u044C\u043A\u043E \u043D\u0430 \u0431\u043E\u043B\u044C\u0448\u0443\u044E \u0433\u043B\u0443\u0431\u0438\u043D\u0443.",{minDepth:9}),Ne("losos","\u041B\u043E\u0441\u043E\u0441\u044C",3,1.5,16,800,1.9,{falls:4,reef:1},{shrimp:1.3,live:1.3,maggot:.8},1.7,{dawn:1.7,dusk:1.5,day:.7,night:.5},{shape:"std",back:"#4a5f6b",side:"#c9c4c8",belly:"#f6f1f1",fin:"#6a6f78",pat:"dots",patC:"#22262b",band:"#e08a8a",lenK:43},"\u041A\u043E\u0440\u043E\u043B\u044C \u0432\u043E\u0434\u043E\u043F\u0430\u0434\u0430. \u041F\u0440\u0438\u0445\u043E\u0434\u0438\u0442 \u043D\u0430 \u0437\u0430\u0440\u0435 \u0438 \u043D\u0430 \u0437\u0430\u043A\u0430\u0442\u0435."),Ne("skat","\u0421\u043A\u0430\u0442",3,2.5,28,1e3,1.8,{deep:4,reef:1,arch:1},{squid:1.7,shrimp:1.4,live:1},0,{night:1.4},{shape:"ray",back:"#8a744e",side:"#8a744e",belly:"#f1ead8",fin:"#6f5c3c",pat:"spots",patC:"#3f8fd0",lenK:34},"\u041F\u0430\u0440\u0438\u0442 \u043D\u0430\u0434 \u043F\u0435\u0441\u043A\u043E\u043C \u043D\u0430 \u0433\u043B\u0443\u0431\u0438\u043D\u0435. \u041F\u043E\u0434\u043D\u044F\u0442\u044C \u0435\u0433\u043E \u0441\u043E \u0434\u043D\u0430 \u2014 \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u0439 \u0442\u0440\u0443\u0434.",{minDepth:6}),Ne("mech","\u0420\u044B\u0431\u0430-\u043C\u0435\u0447",4,25,160,6500,2.5,{arch:.8,deep:.3},{live:1.5,squid:1.7},1.6,null,{shape:"sword",back:"#2a3d6b",side:"#8fa0b8",belly:"#eef1f4",fin:"#24345c",pat:"none",lenK:52},"\u041B\u0435\u0433\u0435\u043D\u0434\u0430 \u0431\u0443\u0445\u0442\u044B. \u0413\u043E\u0432\u043E\u0440\u044F\u0442, \u0435\u0451 \u0432\u0438\u0434\u0435\u043B\u0438 \u0443 \u043A\u0430\u043C\u0435\u043D\u043D\u043E\u0439 \u0430\u0440\u043A\u0438.",{minDepth:9}),Ne("koi","\u0417\u043E\u043B\u043E\u0442\u043E\u0439 \u043A\u043E\u0438",4,1.5,11,4200,1.5,{backwater:1.5,falls:.6},{corn:1.6,bread:1.2,maggot:1},0,{dawn:1.8},{shape:"carp",back:"#f0a020",side:"#f7c948",belly:"#fff3c4",fin:"#f08a1c",pat:"koi",patC:"#ffffff",lenK:30},"\u041F\u0440\u0438\u043D\u043E\u0441\u0438\u0442 \u0443\u0434\u0430\u0447\u0443. \u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0432 \u0437\u0430\u0432\u043E\u0434\u0438 \u043D\u0430 \u0440\u0430\u0441\u0441\u0432\u0435\u0442\u0435 \u2014 \u0438 \u0442\u043E \u043D\u0435 \u043A\u0430\u0436\u0434\u043E\u043C\u0443."),Ne("starik","\u041C\u0435\u0440\u043E\u0443 \xAB\u0421\u0442\u0430\u0440\u0438\u043A\xBB",4,35,140,8e3,2.4,{arch:1},{live:1.6,squid:1.6},1,{dusk:1.5,night:1.3},{shape:"grouper",back:"#4a3a2a",side:"#8a6f4f",belly:"#d9c9a8",fin:"#5a4532",pat:"marble",patC:"#cdb890",lenK:31},"\u0421\u0442\u0430\u0440\u043E\u0436\u0438\u043B \u0430\u0440\u043A\u0438. \u0421\u043C\u043E\u0442\u0440\u0438\u0442\u0435\u043B\u0438 \u043C\u0430\u044F\u043A\u0430 \u0440\u0430\u0441\u0441\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442 \u043E \u043D\u0451\u043C \u0443\u0436\u0435 \u0441\u043E\u0440\u043E\u043A \u043B\u0435\u0442.")],Ue=Object.fromEntries(wn.map(n=>[n.id,n])),xu=[{id:"boot",name:"\u0421\u0442\u0430\u0440\u044B\u0439 \u0431\u043E\u0442\u0438\u043D\u043E\u043A",price:2,w:[.4,.9],desc:"\u041B\u0435\u0432\u044B\u0439. \u041F\u0440\u0430\u0432\u044B\u0439, \u0433\u043E\u0432\u043E\u0440\u044F\u0442, \u043F\u043E\u0439\u043C\u0430\u043B\u0438 \u0435\u0449\u0451 \u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C \u0433\u043E\u0434\u0443."},{id:"can",name:"\u041A\u043E\u043D\u0441\u0435\u0440\u0432\u043D\u0430\u044F \u0431\u0430\u043D\u043A\u0430",price:1,w:[.05,.12],desc:"\u0428\u043F\u0440\u043E\u0442\u044B. \u0411\u044B\u043B\u0438."},{id:"weed",name:"\u041F\u0443\u0447\u043E\u043A \u0432\u043E\u0434\u043E\u0440\u043E\u0441\u043B\u0435\u0439",price:1,w:[.1,.5],desc:"\u0422\u044F\u043D\u0443\u043B \u043A\u0430\u043A \u043A\u0430\u0440\u043F. \u041E\u043A\u0430\u0437\u0430\u043B\u0441\u044F \u0441\u0430\u043B\u0430\u0442."},{id:"bottle",name:"\u0411\u0443\u0442\u044B\u043B\u043A\u0430 \u0441 \u0437\u0430\u043F\u0438\u0441\u043A\u043E\u0439",price:60,w:[.3,.5],desc:"\xAB\u041A\u0442\u043E \u043D\u0430\u0448\u0451\u043B \u2014 \u0442\u043E\u043C\u0443 60 \u043C\u043E\u043D\u0435\u0442 \u0443 \u0442\u043E\u0440\u0433\u043E\u0432\u0446\u0430\xBB."},{id:"chest",name:"\u0421\u0443\u043D\u0434\u0443\u0447\u043E\u043A",price:450,w:[3,6],desc:"\u041A\u0442\u043E-\u0442\u043E \u0443\u0440\u043E\u043D\u0438\u043B \u0441 \u043B\u043E\u0434\u043A\u0438. \u0422\u043E\u0440\u0433\u043E\u0432\u0435\u0446 \u0434\u0430\u0441\u0442 \u0445\u043E\u0440\u043E\u0448\u0443\u044E \u0446\u0435\u043D\u0443.",rare:!0}],Zn=Object.fromEntries(xu.map(n=>[n.id,n])),ar=[{id:"rod1",name:"\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F",price:0,cast:16,line:3,reel:1,col:["#1f3f8f","#ffc928","#2a2f3a","#ffc928"],desc:"\u041D\u0430\u0434\u0451\u0436\u043D\u0430\u044F \u0443\u0434\u043E\u0447\u043A\u0430 \u043D\u0430 \u0432\u0441\u0435 \u0441\u043B\u0443\u0447\u0430\u0438."},{id:"rod2",name:"\u0420\u0438\u0444\u043E\u0432\u0430\u044F",price:450,cast:24,line:4.5,reel:1.1,col:["#2a3340","#22d3ee","#3b4656","#22d3ee"],desc:"\u0414\u043E\u0441\u0442\u0430\u0451\u0442 \u0434\u043E \u043A\u0430\u043C\u043D\u0435\u0439. \u041F\u0435\u0440\u0432\u0430\u044F \u0441\u0435\u0440\u044C\u0451\u0437\u043D\u0430\u044F \u043F\u043E\u043A\u0443\u043F\u043A\u0430."},{id:"rod3",name:"\u0420\u0435\u0447\u043D\u043E\u0439 \u0440\u0430\u0437\u0432\u0435\u0434\u0447\u0438\u043A",price:1600,cast:32,line:7,reel:1.2,col:["#3d4a2a","#a3e635","#c9a26b","#84cc16"],desc:"\u041F\u0440\u043E\u0431\u043A\u043E\u0432\u0430\u044F \u0440\u0443\u043A\u043E\u044F\u0442\u044C, \u0443\u043F\u0440\u0443\u0433\u0438\u0439 \u0431\u043B\u0430\u043D\u043A. \u0414\u043B\u044F \u0449\u0443\u043A\u0438 \u0438 \u043A\u0430\u0440\u043F\u0430."},{id:"rod4",name:"\u0413\u043B\u0443\u0431\u043E\u043A\u0430\u044F \u0441\u0438\u043D\u044C",price:5200,cast:41,line:10.5,reel:1.32,col:["#1d4ed8","#e2e8f0","#1e40af","#60a5fa"],desc:"\u0414\u0430\u043B\u044C\u043D\u0438\u0439 \u0437\u0430\u0431\u0440\u043E\u0441 \u0438 \u043C\u043E\u0449\u043D\u0430\u044F \u043A\u0430\u0442\u0443\u0448\u043A\u0430 \u2014 \u0434\u043B\u044F \u0433\u043B\u0443\u0431\u0438\u043D\u044B."},{id:"rod5",name:"\u0417\u0430\u043A\u0430\u0442 \u041F\u0440\u043E",price:12e3,cast:50,line:15,reel:1.45,col:["#33343c","#fb923c","#27272a","#f97316"],desc:"\u0412\u044B\u0431\u043E\u0440 \u0442\u0435\u0445, \u043A\u0442\u043E \u0445\u043E\u0434\u0438\u0442 \u0437\u0430 \u0441\u0438\u0431\u0430\u0441\u043E\u043C \u0438 \u043B\u043E\u0441\u043E\u0441\u0435\u043C."},{id:"rod6",name:"\u041F\u043E\u0432\u0435\u043B\u0438\u0442\u0435\u043B\u044C \u043F\u0440\u0438\u043B\u0438\u0432\u043E\u0432",price:3e4,cast:60,line:22,reel:1.6,col:["#5b21b6","#fbbf24","#3b0764","#f59e0b"],desc:"\u0414\u043E\u0441\u0442\u0430\u0451\u0442 \u0434\u043E \u0430\u0440\u043A\u0438 \u0438 \u0434\u0435\u0440\u0436\u0438\u0442 \u0440\u044B\u0431\u0443-\u043C\u0435\u0447."}],Co=[{id:"line1",name:"\u041C\u043E\u043D\u043E\u043B\u0435\u0441\u043A\u0430",price:0,mult:1,col:"#e8f4ff",desc:"\u041E\u0431\u044B\u0447\u043D\u0430\u044F \u043B\u0435\u0441\u043A\u0430 \u0438\u0437 \u043D\u0430\u0431\u043E\u0440\u0430."},{id:"line2",name:"\u041F\u043B\u0435\u0442\u0451\u043D\u043A\u0430",price:320,mult:1.2,col:"#fde047",desc:"\u041F\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u043B\u0435\u0441\u043A\u0438 +20%."},{id:"line3",name:"\u0424\u043B\u044E\u043E\u0440\u043E\u043A\u0430\u0440\u0431\u043E\u043D",price:1700,mult:1.45,col:"#a7f3d0",desc:"\u041F\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u043B\u0435\u0441\u043A\u0438 +45%. \u041F\u043E\u0447\u0442\u0438 \u043D\u0435 \u0432\u0438\u0434\u043D\u0430 \u0432 \u0432\u043E\u0434\u0435."},{id:"line4",name:"\u0422\u0438\u0442\u0430\u043D\u043E\u0432\u044B\u0439 \u0448\u043D\u0443\u0440",price:7500,mult:1.7,col:"#cbd5e1",desc:"\u041F\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u043B\u0435\u0441\u043A\u0438 +70%. \u0414\u043B\u044F \u0432\u0435\u043B\u0438\u043A\u0430\u043D\u043E\u0432."}],jr=[{id:"reel1",name:"\u041F\u0440\u043E\u0441\u0442\u0430\u044F \u043A\u0430\u0442\u0443\u0448\u043A\u0430",price:0,mult:1,col:"#ffc928",desc:"\u041A\u0440\u0443\u0442\u0438\u0442 \u2014 \u0438 \u043B\u0430\u0434\u043D\u043E."},{id:"reel2",name:"\u0411\u044B\u0441\u0442\u0440\u0430\u044F \u043A\u0430\u0442\u0443\u0448\u043A\u0430",price:380,mult:1.15,col:"#22d3ee",desc:"\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u043F\u043E\u0434\u043C\u043E\u0442\u043A\u0438 +15%."},{id:"reel3",name:"\u041C\u0443\u043B\u044C\u0442\u0438\u043F\u043B\u0438\u043A\u0430\u0442\u043E\u0440",price:2400,mult:1.3,col:"#f97316",desc:"\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u043F\u043E\u0434\u043C\u043E\u0442\u043A\u0438 +30%, \u043D\u0430\u0442\u044F\u0436\u0435\u043D\u0438\u0435 \u0440\u0430\u0441\u0442\u0451\u0442 \u043F\u043B\u0430\u0432\u043D\u0435\u0435."},{id:"reel4",name:"\u0422\u0443\u0440\u0431\u043E",price:9500,mult:1.45,col:"#a855f7",desc:"\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u043F\u043E\u0434\u043C\u043E\u0442\u043A\u0438 +45%, \u0441\u0430\u043C\u044B\u0439 \u043C\u044F\u0433\u043A\u0438\u0439 \u0444\u0440\u0438\u043A\u0446\u0438\u043E\u043D."}],vu=[{id:"hook1",name:"\u041E\u0431\u044B\u0447\u043D\u044B\u0435 \u043A\u0440\u044E\u0447\u043A\u0438",price:0,win:1,hold:1,desc:"\u0418\u0437 \u043A\u043E\u0440\u043E\u0431\u043A\u0438 \u0441\u043E \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u044B\u043C \u043D\u0430\u0431\u043E\u0440\u043E\u043C."},{id:"hook2",name:"\u041E\u0441\u0442\u0440\u044B\u0435 \u043A\u0440\u044E\u0447\u043A\u0438",price:220,win:1.3,hold:.8,desc:"\u041D\u0430 \u043F\u043E\u0434\u0441\u0435\u0447\u043A\u0443 \u0431\u043E\u043B\u044C\u0448\u0435 \u0432\u0440\u0435\u043C\u0435\u043D\u0438, \u0440\u044B\u0431\u0430 \u0441\u0445\u043E\u0434\u0438\u0442 \u0440\u0435\u0436\u0435."},{id:"hook3",name:"\u0422\u0440\u043E\u0439\u043D\u0438\u043A",price:1300,win:1.6,hold:.6,desc:"\u0422\u0440\u0438 \u0436\u0430\u043B\u0430: \u043F\u043E\u0434\u0441\u0435\u0447\u044C \u043B\u0435\u0433\u043A\u043E, \u0441\u043E\u0440\u0432\u0430\u0442\u044C\u0441\u044F \u0442\u0440\u0443\u0434\u043D\u043E."},{id:"hook4",name:"\u041A\u043E\u0432\u0430\u043D\u044B\u0435 \u043A\u0440\u044E\u0447\u043A\u0438",price:4800,win:2,hold:.4,desc:"\u0420\u0443\u0447\u043D\u0430\u044F \u0440\u0430\u0431\u043E\u0442\u0430. \u0420\u044B\u0431\u0430 \u043F\u043E\u0447\u0442\u0438 \u043D\u0435 \u0441\u0445\u043E\u0434\u0438\u0442."}],Po=[{id:"float1",name:"\u041A\u043B\u0430\u0441\u0441\u0438\u043A\u0430",price:0,win:1,bite:1,col:["#ef4444","#ffffff","#111827"],desc:"\u041A\u0440\u0430\u0441\u043D\u043E-\u0431\u0435\u043B\u044B\u0439 \u043F\u043E\u043F\u043B\u0430\u0432\u043E\u043A, \u0437\u043D\u0430\u043A\u043E\u043C\u044B\u0439 \u0441 \u0434\u0435\u0442\u0441\u0442\u0432\u0430."},{id:"float2",name:"\u0413\u0443\u0441\u0438\u043D\u043E\u0435 \u043F\u0435\u0440\u043E",price:180,win:1.2,bite:1,col:["#f8fafc","#fb923c","#1f2937"],desc:"\u0427\u0443\u0442\u043A\u0438\u0439: \u043D\u0430 \u043F\u043E\u0434\u0441\u0435\u0447\u043A\u0443 \u0431\u043E\u043B\u044C\u0448\u0435 \u0432\u0440\u0435\u043C\u0435\u043D\u0438."},{id:"float3",name:"\u0421\u0432\u0435\u0442\u043B\u044F\u0447\u043E\u043A",price:750,win:1.1,bite:1,night:1.25,glow:!0,col:["#a3e635","#fef9c3","#14532d"],desc:"\u0421\u0432\u0435\u0442\u0438\u0442\u0441\u044F \u0432 \u0442\u0435\u043C\u043D\u043E\u0442\u0435. \u041D\u043E\u0447\u044C\u044E \u043A\u043B\u044E\u0451\u0442 \u0447\u0430\u0449\u0435."},{id:"float4",name:"\u0427\u0435\u043C\u043F\u0438\u043E\u043D",price:2800,win:1.25,bite:1.12,col:["#22d3ee","#fde047","#0f172a"],desc:"\u041A\u043B\u044E\u0451\u0442 \u0447\u0430\u0449\u0435, \u043F\u043E\u0434\u0441\u0435\u043A\u0430\u0442\u044C \u043F\u0440\u043E\u0449\u0435."}],yu=[{id:"bread",name:"\u0425\u043B\u0435\u0431\u043D\u044B\u0439 \u043C\u044F\u043A\u0438\u0448",price:0,pack:0,attract:.75,rare:1,size:1,desc:"\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E \u0438 \u0431\u0435\u0437 \u0441\u0447\u0451\u0442\u0430. \u041C\u0438\u0440\u043D\u0430\u044F \u0440\u044B\u0431\u0430 \u0435\u0433\u043E \u043B\u044E\u0431\u0438\u0442."},{id:"worm",name:"\u0427\u0435\u0440\u0432\u044C",price:3,pack:10,attract:1,rare:1,size:1,desc:"\u0423\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B\u044C\u043D\u0430\u044F \u043D\u0430\u0436\u0438\u0432\u043A\u0430. \u041E\u043A\u0443\u043D\u044C \u043E\u0442 \u043D\u0435\u0451 \u0431\u0435\u0437 \u0443\u043C\u0430."},{id:"maggot",name:"\u041E\u043F\u0430\u0440\u044B\u0448",price:4,pack:10,attract:1.1,rare:1,size:1,desc:"\u041A\u043B\u044E\u0451\u0442 \u0447\u0430\u0449\u0435. \u041F\u043B\u043E\u0442\u0432\u0430, \u043B\u0435\u0449 \u0438 \u0444\u043E\u0440\u0435\u043B\u044C."},{id:"corn",name:"\u041A\u0443\u043A\u0443\u0440\u0443\u0437\u0430",price:5,pack:10,attract:1,rare:1.1,size:1.1,desc:"\u0421\u043B\u0430\u0434\u043A\u0430\u044F. \u041A\u0430\u0440\u043F, \u043A\u0430\u0440\u0430\u0441\u044C \u0438 \u043B\u0435\u0449."},{id:"shrimp",name:"\u041A\u0440\u0435\u0432\u0435\u0442\u043A\u0430",price:12,pack:10,attract:1.15,rare:1.3,size:1.1,desc:"\u041C\u043E\u0440\u0441\u043A\u0430\u044F \u0440\u044B\u0431\u0430 \u0438 \u0440\u0438\u0444. \u0420\u0435\u0434\u043A\u0430\u044F \u0440\u044B\u0431\u0430 \u0431\u0435\u0440\u0451\u0442 \u043E\u0445\u043E\u0442\u043D\u0435\u0435."},{id:"live",name:"\u0416\u0438\u0432\u0435\u0446",price:28,pack:5,attract:.8,rare:1.7,size:1.35,desc:"\u0416\u0434\u0430\u0442\u044C \u0434\u043E\u043B\u044C\u0448\u0435, \u0437\u0430\u0442\u043E \u043F\u0440\u0438\u0445\u043E\u0434\u0438\u0442 \u0445\u0438\u0449\u043D\u0438\u043A \u2014 \u0438 \u043A\u0440\u0443\u043F\u043D\u044B\u0439."},{id:"squid",name:"\u041A\u0430\u043B\u044C\u043C\u0430\u0440",price:40,pack:5,attract:.9,rare:1.9,size:1.45,desc:"\u0414\u043B\u044F \u0433\u043B\u0443\u0431\u0438\u043D\u044B \u0438 \u0430\u0440\u043A\u0438. \u041D\u0430 \u043D\u0435\u0433\u043E \u0432\u044B\u0445\u043E\u0434\u044F\u0442 \u0432\u0435\u043B\u0438\u043A\u0430\u043D\u044B."}],_u=[{id:"spoon",name:"\u0411\u043B\u0435\u0441\u043D\u0430-\u043A\u043E\u043B\u0435\u0431\u0430\u043B\u043A\u0430",price:260,power:1,rare:1.2,size:1.1,col:["#d9dee6","#ef4444"],desc:"\u041F\u0440\u043E\u0441\u0442\u0430\u044F \u0438 \u0443\u043B\u043E\u0432\u0438\u0441\u0442\u0430\u044F. \u041F\u043E\u0434\u043C\u0430\u0442\u044B\u0432\u0430\u0439\u0442\u0435 \u2014 \u0445\u0438\u0449\u043D\u0438\u043A \u0434\u043E\u0433\u043E\u043D\u0438\u0442."},{id:"spinner",name:"\u0412\u0435\u0440\u0442\u0443\u0448\u043A\u0430",price:700,power:1.25,rare:1.35,size:1.15,col:["#fbbf24","#1f2937"],desc:"\u041B\u0435\u043F\u0435\u0441\u0442\u043E\u043A \u0438\u0433\u0440\u0430\u0435\u0442 \u043D\u0430 \u043C\u0435\u0434\u043B\u0435\u043D\u043D\u043E\u0439 \u043F\u043E\u0434\u043C\u043E\u0442\u043A\u0435."},{id:"wobbler",name:"\u0412\u043E\u0431\u043B\u0435\u0440",price:1900,power:1.5,rare:1.5,size:1.25,col:["#22c55e","#f97316"],desc:"\u041F\u043E\u0445\u043E\u0436 \u043D\u0430 \u043C\u0430\u043B\u044C\u043A\u0430. \u0429\u0443\u043A\u0430 \u0438 \u0441\u0443\u0434\u0430\u043A \u043D\u0435 \u043F\u0440\u043E\u0439\u0434\u0443\u0442 \u043C\u0438\u043C\u043E."},{id:"jig",name:"\u0414\u0436\u0438\u0433",price:4200,power:1.7,rare:1.7,size:1.35,col:["#a855f7","#fde047"],desc:"\u0420\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0443 \u0434\u043D\u0430 \u043D\u0430 \u0433\u043B\u0443\u0431\u0438\u043D\u0435."},{id:"goldspoon",name:"\u0417\u043E\u043B\u043E\u0442\u0430\u044F \u0431\u043B\u0435\u0441\u043D\u0430",price:12e3,power:2,rare:2.2,size:1.5,col:["#fbbf24","#fde68a"],desc:"\u041D\u0430 \u043D\u0435\u0451 \u0432\u044B\u0445\u043E\u0434\u044F\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u0435, \u043E \u043A\u043E\u043C \u0440\u0430\u0441\u0441\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442 \u0438\u0441\u0442\u043E\u0440\u0438\u0438."}],bu=[{id:"bag1",name:"\u0421\u0430\u0434\u043E\u043A",price:0,cap:8,desc:"\u041F\u043E\u043C\u0435\u0449\u0430\u0435\u0442\u0441\u044F 8 \u0440\u044B\u0431."},{id:"bag2",name:"\u0412\u0435\u0434\u0440\u043E",price:280,cap:14,desc:"\u041F\u043E\u043C\u0435\u0449\u0430\u0435\u0442\u0441\u044F 14 \u0440\u044B\u0431."},{id:"bag3",name:"\u041A\u0443\u043B\u0435\u0440",price:1400,cap:22,desc:"\u041F\u043E\u043C\u0435\u0449\u0430\u0435\u0442\u0441\u044F 22 \u0440\u044B\u0431\u044B."},{id:"bag4",name:"\u0411\u043E\u043B\u044C\u0448\u043E\u0439 \u043A\u0443\u043B\u0435\u0440",price:5500,cap:34,desc:"\u041F\u043E\u043C\u0435\u0449\u0430\u0435\u0442\u0441\u044F 34 \u0440\u044B\u0431\u044B."},{id:"bag5",name:"\u0420\u044B\u0431\u0430\u0446\u043A\u0438\u0439 \u044F\u0449\u0438\u043A",price:16e3,cap:50,desc:"\u041F\u043E\u043C\u0435\u0449\u0430\u0435\u0442\u0441\u044F 50 \u0440\u044B\u0431 \u2014 \u043C\u043E\u0436\u043D\u043E \u043D\u0435 \u0445\u043E\u0434\u0438\u0442\u044C \u043D\u0430 \u0440\u044B\u043D\u043E\u043A \u043F\u043E\u043B\u0434\u043D\u044F."}],Cb=[{id:"net",name:"\u041F\u043E\u0434\u0441\u0430\u0447\u0435\u043A",price:900,desc:"\u0420\u044B\u0431\u0443 \u043C\u043E\u0436\u043D\u043E \u0431\u0440\u0430\u0442\u044C, \u043A\u043E\u0433\u0434\u0430 \u0432\u044B\u0432\u0430\u0436\u0438\u0432\u0430\u043D\u0438\u0435 \u0434\u043E\u0448\u043B\u043E \u0434\u043E 85%."},{id:"sonar",name:"\u042D\u0445\u043E\u043B\u043E\u0442",price:3e3,desc:"\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043D\u0430 \u043A\u0430\u0440\u0442\u0435 \u043A\u043E\u0441\u044F\u043A\u0438 \u0440\u044B\u0431\u044B, \u0430 \u0443 \u0442\u043E\u0447\u043A\u0438 \u0437\u0430\u0431\u0440\u043E\u0441\u0430 \u2014 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C \u043A\u043B\u0451\u0432\u0430."}],Io=[{key:"rod",name:"\u0423\u0434\u043E\u0447\u043A\u0438",items:ar,slot:"rod"},{key:"tackle",name:"\u041D\u0430\u0436\u0438\u0432\u043A\u0430",items:yu,slot:"tackle",count:!0},{key:"lure",name:"\u041F\u0440\u0438\u043C\u0430\u043D\u043A\u0438",items:_u,slot:"tackle",count:!0},{key:"reel",name:"\u041A\u0430\u0442\u0443\u0448\u043A\u0438",items:jr,slot:"reel"},{key:"line",name:"\u041B\u0435\u0441\u043A\u0430",items:Co,slot:"line"},{key:"hook",name:"\u041A\u0440\u044E\u0447\u043A\u0438",items:vu,slot:"hook"},{key:"float",name:"\u041F\u043E\u043F\u043B\u0430\u0432\u043A\u0438",items:Po,slot:"float"},{key:"bag",name:"\u0421\u0430\u0434\u043A\u0438",items:bu,slot:"bag"},{key:"extra",name:"\u0420\u0430\u0437\u043D\u043E\u0435",items:Cb,slot:null}],Qt={};for(let n of Io)for(let t of n.items)Qt[t.id]={...t,cat:n.key,slot:n.slot,count:!!n.count};var Ss=n=>!!Qt[n]&&Qt[n].cat==="lure";var Pb=2880,rr=.78;function A0(n,t=8){let e=Ib(t),i=((n/Pb+e)%1+1)%1;return i<rr?5+i/rr*16:(21+(i-rr)/(1-rr)*8)%24}function Ib(n){if(n=(n%24+24)%24,n>=5&&n<21)return(n-5)/16*rr;let t=n>=21?n-21:n+3;return rr+t/8*(1-rr)}function Qr(n){return n>=5&&n<8?"dawn":n>=8&&n<18?"day":n>=18&&n<21?"dusk":"night"}var R0=n=>{let t=Math.floor(n)%24,e=Math.floor((n-Math.floor(n))*60);return`${String(t).padStart(2,"0")}:${String(e).padStart(2,"0")}`},Mu=8,sh=600;var un=n=>n<1?Math.round(n*1e3)+" \u0433":(n>=10?n.toFixed(1):n.toFixed(2)).replace(".",",")+" \u043A\u0433",En=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g," ");var Do="#3b424c",Lb=1.98,or=10;function ws(n,t="reel1",e="line1",i=-1){let s=Qt[n]||ar[0],r=Qt[t]||jr[0],a=Qt[e]||Co[0],[o,l,c,u]=s.col,h=r.id==="reel1"?u:r.col,d=new he,f=new Te;f.add(R.cyl(12),l,A(0,-.285,0,.044,.04,.044)),f.add(jt([[-.27,.019,.019],[-.2,.0175,.0175],[-.06,.0165,.0165]],12),c,A(0,0,0)),f.add(R.cyl(12),l,A(0,-.055,0,.04,.022,.04)),f.add(R.cyl(12),zt(o,-.25),A(0,.03,0,.03,.15,.03)),f.add(R.cyl(12),l,A(0,.112,0,.04,.022,.04)),f.add(jt([[.12,.0165,.0165],[.2,.016,.016],[.245,.0125,.0125]],12),c,A(0,0,0)),f.add(R.cyl(12),l,A(0,.252,0,.03,.016,.03)),f.add(R.box(),Do,A(0,.03,.036,.012,.03,.06)),f.add(R.sph(14,10),h,A(0,.03,.082,.062,.07,.056)),f.add(R.cyl(14),zt(h,-.3),A(0,.085,.082,.05,.03,.05)),f.add(R.cyl(14),a.col,A(0,.115,.082,.054,.034,.054)),f.add(R.cyl(14),l,A(0,.136,.082,.064,.008,.064)),f.add(R.cyl(14),zt(h,-.15),A(0,.097,.082,.068,.008,.068)),f.add(R.torus(.06,12,Math.PI*1.1),"#cbd5e1",A(0,.118,.082,.09,.09,.09,Math.PI/2,0,.6)),f.add(R.cyl(8),Do,A(i*.022,.03,.082,.014,.05,.014,0,0,Math.PI/2));let p=f.build(Yi,!1);d.add(p);let x=new he;x.position.set(i*.046,.03,.082);let m=new Te;m.add(R.box(),"#cbd5e1",A(0,.022,0,.007,.05,.012)),m.add(R.cyl(8),"#cbd5e1",A(i*.012,.045,0,.008,.026,.008,0,0,Math.PI/2)),m.add(R.sph(10,8),zt(c,-.1),A(i*.03,.045,0,.032,.026,.026)),x.add(m.build(Yi,!1)),d.add(x);let g=[],b=(Lb-.26)/or,v=d,E=ln(o,.45,.1),T=ln(l,.5,.1),y=ln(Do,.4,.5);for(let U=0;U<or;U++){let P=new he;P.position.y=U?b:.26,v.add(P);let C=.0105-.0083*U/or,N=.0105-.0083*(U+1)/or,O=new Rt(new Fi(N,C,b,7),E);if(O.position.y=b/2,P.add(O),U%2===1||U===or-1){let L=.017-U*.0012,k=new Rt(R.torus(.22,10),y);k.scale.setScalar(L*2),k.position.set(0,b,N+L),k.rotation.x=Math.PI/2,P.add(k);let G=new Rt(R.cyl(7),T);G.scale.set(N*2.5,.03,N*2.5),G.position.y=b-.02,P.add(G)}g.push(P),v=P}let M=new Ze;return M.position.set(0,b,.006),v.add(M),d.traverse(U=>{U.isMesh&&(U.receiveShadow=!1)}),{group:d,tip:M,handle:x,id:n,setBend(U,P=0){for(let C=0;C<or;C++){let N=Math.pow((C+1)/or,1.6);g[C].rotation.x=U*.26*N,g[C].rotation.z=P*.09*N}}}}function No(n="float1"){let t=Qt[n]||Po[0],[e,i,s]=t.col,r=new he,a=new Te;a.add(jt([[0,.072,.072],[.045,.06,.06],[.09,.03,.03],[.115,.012,.012]],14),e,A(0,0,0)),a.add(jt([[-.12,.012,.012],[-.08,.04,.04],[-.035,.066,.066],[0,.072,.072]],14),i,A(0,0,0)),a.add(R.cyl(6),e,A(0,.2,0,.012,.18,.012)),a.add(R.sph(8,6),t.glow?"#fef08a":e,A(0,.3,0,.034,.034,.034)),a.add(R.cyl(6),s,A(0,-.19,0,.012,.16,.012));let o=a.build(Yi);if(r.add(o),t.glow){let l=new Rt(R.sph(8,6),new Wi({color:"#d9f99d"}));l.scale.setScalar(.05),l.position.y=.3,r.add(l)}return r}function Lo(n,t,e,i,s,r=0){let a=Bi([[0,.5,0],[0,0,0],[.02,-.28,0],[.16,-.4,0],[.3,-.26,0],[.3,-.1,0]],.022,5);n.add(a,"#cbd5e1",A(t,e,i,s,s,s,0,r,0))}function Uo(n){let t=Qt[n]||Qt.spoon,[e,i]=t.col||["#d9dee6","#ef4444"],s=new Te;n==="spinner"?(s.add(R.cyl(5),"#cbd5e1",A(0,0,0,.012,.5,.012)),s.add(R.sph(10,8),e,A(.05,.05,0,.16,.3,.03,0,0,-.35)),s.add(R.sph(8,6),"#ef4444",A(0,-.08,0,.06,.07,.06)),s.add(R.sph(8,6),i,A(0,-.15,0,.05,.05,.05)),Lo(s,0,-.3,0,.26)):n==="wobbler"?(s.add(jt([[-.3,.01,.008],[-.18,.07,.045],[.05,.085,.055],[.24,.05,.035],[.32,.012,.01]],12),e,A(0,0,0,1,1,1,0,0,Math.PI/2),{top:[i,.35]}),s.add(R.box(),"#e2e8f0",A(-.3,-.06,0,.1,.012,.09,0,0,.6)),s.add(R.sph(8,6),"#111827",A(-.2,.03,.045,.035,.035,.02)),s.add(R.sph(8,6),"#111827",A(-.2,.03,-.045,.035,.035,.02)),Lo(s,0,-.17,0,.2),Lo(s,.3,-.12,0,.2)):n==="jig"?(s.add(R.sph(10,8),"#9ca3af",A(-.2,.02,0,.14,.14,.14)),s.add(Bi([[-.15,0,0],[.05,-.02,0],[.2,.03,0],[.32,-.04,0],[.4,.08,0]],.05,8,a=>1-a*.75),e,A(0,0,0,1,1,1),null),s.add(R.sph(8,6),i,A(.4,.08,0,.05,.11,.02,0,0,.5)),Lo(s,-.05,-.12,0,.22)):(s.add(R.sph(14,10),e,A(0,0,0,.2,.52,.035)),s.add(R.sph(8,6),i,A(0,.1,.012,.09,.2,.02)),s.add(R.torus(.25,8),"#cbd5e1",A(0,.28,0,.06,.06,.06)),Lo(s,0,-.36,0,.26));let r=new he;return r.add(s.build(Ao)),r}var Db=(n,t,e,i,s,r="#b9c7d1",a="#5f7480",o=0)=>{n.add(jt([[-.5,.01,.006],[-.3,.13,.07],[.05,.15,.08],[.36,.05,.03],[.42,.02,.012]],10),r,A(t,e,i,s,s,s,0,0,Math.PI/2+o),{top:[a,.4]}),n.add(R.cone(4),a,A(t+.5*s*Math.cos(o),e+.5*s*Math.sin(o),i,.3*s,.26*s,.03*s,0,0,Math.PI/2+o)),n.add(R.sph(6,5),"#111827",A(t-.3*s*Math.cos(o),e-.3*s*Math.sin(o)+.05*s,i+.06*s,.05*s,.05*s,.03*s))};function rh(n){let t=Qt[n],e=new he,i=new Te,s=t?t.cat:"junk";if(s==="rod"){let r=ws(n,"reel1","line1",-1);return r.setBend(.25),e.add(r.group),e.userData.rod=!0,e}if(s==="float"){let r=No(n);return r.scale.setScalar(2.2),r.position.y=-.1,r.rotation.z=-.3,e.add(r),e}if(s==="lure"){let r=Uo(n);return r.scale.setScalar(1.15),r.rotation.z=n==="wobbler"||n==="jig"?.25:-.5,e.add(r),e}if(s==="reel"){let r=t.col;i.add(R.box(),Do,A(0,.36,0,.09,.2,.3)),i.add(R.box(),Do,A(0,.47,0,.1,.05,.6)),i.add(R.sph(16,12),r,A(0,.05,0,.42,.5,.4)),i.add(R.cyl(16),zt(r,-.3),A(0,.05,.24,.36,.14,.36,Math.PI/2,0,0)),i.add(R.cyl(16),"#e8f4ff",A(0,.05,.36,.4,.16,.4,Math.PI/2,0,0)),i.add(R.cyl(16),zt(r,.2),A(0,.05,.46,.46,.04,.46,Math.PI/2,0,0)),i.add(R.torus(.07,14,Math.PI*1.2),"#cbd5e1",A(0,.05,.36,.62,.62,.62,0,0,.4)),i.add(R.box(),"#cbd5e1",A(-.3,-.05,0,.05,.3,.07,0,0,.5)),i.add(R.sph(10,8),"#1f2937",A(-.42,-.2,0,.16,.13,.13)),e.rotation.set(.2,-.7,0)}else if(s==="line")i.add(R.cyl(18),"#334155",A(0,0,-.22,.8,.06,.8,Math.PI/2,0,0)),i.add(R.cyl(18),"#334155",A(0,0,.22,.8,.06,.8,Math.PI/2,0,0)),i.add(R.cyl(18),t.col,A(0,0,0,.62,.4,.62,Math.PI/2,0,0)),i.add(R.cyl(12),"#0f172a",A(0,0,0,.2,.5,.2,Math.PI/2,0,0)),e.rotation.set(.25,-.8,0);else if(s==="hook"){let r=n==="hook3"?3:1,a=n==="hook4"?"#fbbf24":"#cbd5e1";for(let o=0;o<r;o++){let l=Bi([[0,.5,0],[0,0,0],[.03,-.3,0],[.2,-.44,0],[.36,-.28,0],[.34,-.08,0]],n==="hook1"?.028:.034,6);i.add(l,a,A(0,0,0,1,1,1,0,o*Math.PI*2/3,0))}i.add(R.torus(.3,8),a,A(0,.55,0,.1,.1,.1)),e.rotation.set(0,-.4,.15)}else if(s==="bag"){if(n==="bag1"){for(let r=0;r<4;r++)i.add(R.torus(.035,18),"#3f6212",A(0,.36-r*.24,0,.62,.62,.62,Math.PI/2,0,0));i.add(R.cyl(14),"#65a30d",A(0,0,0,.58,.74,.58),{grad:[.6,1.1]}),i.add(R.torus(.04,12,Math.PI),"#1f2937",A(0,.4,0,.5,.5,.5))}else if(n==="bag2")i.add(R.cyl(16,1,.78),"#64748b",A(0,0,0,.74,.7,.74),{grad:[.7,1.1]}),i.add(R.torus(.05,18),"#94a3b8",A(0,.35,0,.76,.76,.76,Math.PI/2,0,0)),i.add(R.torus(.04,14,Math.PI),"#1f2937",A(0,.35,0,.74,.9,.74));else{let r=n==="bag3"?"#2f6fd6":n==="bag4"?"#0ea5e9":"#c9975c",a=n==="bag3"?.8:.96;if(i.add(R.box(),r,A(0,-.08,0,a,.5,.56),{grad:[.8,1.06]}),i.add(R.box(),n==="bag5"?zt(r,-.2):"#eef3f8",A(0,.22,0,a+.04,.12,.6)),i.add(R.box(),"#1f2937",A(0,.3,0,.34,.05,.1)),n==="bag4")for(let o of[-.36,.36])i.add(R.cyl(10),"#1f2937",A(o,-.34,.2,.16,.08,.16,Math.PI/2,0,0));if(n==="bag5")for(let o of[-.25,.25])i.add(R.box(),"#fbbf24",A(o,.12,.29,.1,.12,.03))}e.rotation.set(.35,-.6,0)}else if(n==="net")i.add(R.torus(.05,20),"#22d3ee",A(.12,.14,0,.62,.62,.62)),i.add(R.sph(14,8),"#e2e8f0",A(.12,.14,-.1,.56,.56,.36),{grad:[.6,1]}),i.add(R.cyl(8),"#1f2937",A(-.3,-.26,0,.05,.56,.05,0,0,-.82)),e.rotation.set(-.2,.3,0);else if(n==="sonar"){i.add(R.box(),"#1f2937",A(0,0,0,.78,.56,.16)),i.add(R.box(),"#083344",A(0,.03,.085,.64,.4,.02));for(let r=0;r<4;r++)i.add(R.torus(.06,12,Math.PI*.6),"#22d3ee",A(0,-.14,.1,.16+r*.13,.16+r*.13,.1,0,0,Math.PI*.2));i.add(R.box(),"#fbbf24",A(.2,.08,.1,.1,.05,.02)),i.add(R.cyl(6),"#64748b",A(.3,.38,0,.03,.22,.03)),e.rotation.set(.1,-.35,0)}else if(n==="bread")i.add(R.ico(1),"#f1d9a8",A(0,0,0,.62,.5,.56),{flat:!0}),i.add(R.ico(1),"#e6c88e",A(.3,-.18,.1,.26,.22,.24),{flat:!0}),i.add(R.ico(1),"#f6e3b9",A(-.3,-.2,.12,.2,.18,.2),{flat:!0});else if(n==="worm")i.add(Bi([[-.4,-.12,0],[-.2,.14,.05],[0,-.04,-.03],[.18,.18,.04],[.4,.02,0]],.07,9,r=>.8+.3*Math.sin(r*Math.PI)),"#f08a8a",A(0,0,0,1,1,1),null),i.add(Bi([[-.06,.03,0],[0,-.035,-.03],[.06,.05,.02]],.078,9),"#f6b0a8",A(0,0,0,1,1,1),null),e.scale.setScalar(1.1),e.userData.tubeR=.07;else if(n==="maggot")for(let[r,a,o]of[[-.18,.1,.5],[.12,-.02,-.3],[-.05,-.22,1.2]])for(let l=0;l<5;l++)i.add(R.sph(8,6),l%2?"#f5efdc":"#fffaf0",A(r+Math.cos(o)*(l-2)*.07,a+Math.sin(o)*(l-2)*.07,0,.13-Math.abs(l-2)*.015,.13-Math.abs(l-2)*.015,.13));else if(n==="corn")for(let[r,a,o]of[[-.2,.08,0],[.16,.14,.05],[0,-.16,.1],[.28,-.14,-.05],[-.26,-.2,-.05]])i.add(R.sph(10,8),"#fbbf24",A(r,a,o,.26,.3,.2,0,0,r),{grad:[.85,1.15]});else if(n==="shrimp"){i.add(Bi([[-.34,.1,0],[-.1,.24,0],[.18,.16,0],[.32,-.08,0],[.2,-.28,0]],.085,10,r=>1.25-r*.85),"#fb923c",A(0,0,0,1,1,1),null),i.add(R.cone(5),"#fdba74",A(.12,-.36,0,.2,.18,.05,0,0,2.2)),i.add(R.sph(6,5),"#111827",A(-.34,.16,.06,.05,.05,.05));for(let r of[.05,-.05])i.add(R.cyl(4),"#fdba74",A(-.5,.2,r,.012,.3,.012,0,0,1));e.userData.tubeR=.085}else if(n==="live")Db(i,0,0,0,.95);else if(n==="squid"){i.add(jt([[-.1,.16,.14],[.2,.15,.13],[.42,.02,.02]],12),"#f5c6d6",A(0,.02,0,1,1,1),{grad:[.9,1.1]}),i.add(R.cone(4),"#f9a8d4",A(0,.34,0,.5,.2,.05));for(let r=0;r<6;r++)i.add(Bi([[(r-2.5)*.05,-.1,0],[(r-2.5)*.08,-.28,.03],[(r-2.5)*.1,-.44,0]],.03,5,a=>1-a*.6),"#f9a8d4",A(0,0,0,1,1,1),null);for(let r of[-.07,.07])i.add(R.sph(6,5),"#111827",A(r,-.04,.13,.05,.05,.04));e.userData.tubeR=.03}else if(n==="boot")i.add(R.box(),"#6b4f3a",A(-.08,.1,0,.3,.6,.3),{grad:[.8,1.05]}),i.add(jt([[-.2,.17,.12],[.1,.16,.13],[.36,.12,.1]],10,2.6),"#5b4230",A(.05,-.22,0,1,1,1,0,0,-Math.PI/2)),i.add(R.box(),"#2b2118",A(.06,-.36,0,.64,.06,.3)),i.add(R.torus(.2,10),"#3f2f22",A(-.08,.4,0,.36,.36,.36,Math.PI/2,0,0)),e.rotation.set(.1,-.6,.12);else if(n==="can")i.add(R.cyl(14),"#94a3b8",A(0,0,0,.46,.62,.46),{grad:[.75,1.1]}),i.add(R.cyl(14),"#ef4444",A(0,0,0,.47,.32,.47)),i.add(R.cyl(14),"#cbd5e1",A(0,.32,.1,.4,.02,.4,.5,0,0)),e.rotation.set(.3,.3,.25);else if(n==="weed"){for(let r=0;r<6;r++)i.add(Bi([[(r-2.5)*.06,-.4,0],[(r-2.5)*.14+.05,-.1,.05],[(r-2.5)*.1,.18,-.04],[(r-2.5)*.2,.42,0]],.045,5,a=>1.3-a),r%2?"#3f9a3a":"#2f7d32",A(0,0,0,1,1,1),null);e.userData.tubeR=.045}else if(n==="bottle")i.add(jt([[-.4,.15,.15],[.05,.16,.16],[.18,.06,.06],[.36,.055,.055]],12),"#5eead4",A(0,0,0,1,1,1),{grad:[.8,1.1]}),i.add(R.cyl(10),"#b45309",A(0,.4,0,.1,.1,.1)),i.add(R.cyl(10),"#fef3c7",A(0,-.14,0,.2,.34,.2)),e.rotation.z=.7;else if(n==="chest"){i.add(R.box(),"#8a5a2b",A(0,-.12,0,.84,.4,.52),{grad:[.8,1.05]}),i.add(R.cyl(12),"#9c6a36",A(0,.08,0,.52,.84,.52,0,0,Math.PI/2));for(let r of[-.3,0,.3])i.add(R.box(),"#fbbf24",A(r,-.04,0,.07,.6,.55));i.add(R.box(),"#fde047",A(0,-.02,.27,.14,.16,.04)),e.rotation.set(.3,-.6,0)}if(!i.empty){let r=i.build(Ao);e.add(r)}return e}var Su=new D(.2,-.275,-.5),C0=new D(.44,-.7,-.08),P0=new D(-.16,-.72,-.1),Nb=new D(-.058,.135,.012),Ub=Math.PI/180,I0=new si,L0=new si,Fb=new si().setFromAxisAngle(new D(0,1,0),Math.PI),D0=new D(1,0,0),Ob=new D(0,1,0),Bw=new D(0,0,1),Ki=new D,ah=new D,oh=class{constructor(t){this.camera=t,this.root=new he,t.add(this.root),this.pivot=new he,this.root.add(this.pivot),this.fishSlot=new he,this.fishSlot.position.set(-.2,-.1,-.78),this.root.add(this.fishSlot),this.rod=null,this.hands=[],this.p={th:54,be:.24,ox:0,oy:0,oz:0,bend:.03,side:0},this.t=0,this.walk=0,this.crank=0,this.swayX=0,this.swayY=0}setVisible(t){this.root.visible=t}setLook(t){for(let p of this.hands)p.parent.remove(p),p.geometry&&p.geometry.dispose();this.hands=[];let e=t.gloves,i=t.skin,s=e?t.gloveC:i,r=e===2?t.gloveC:i,a=t.top!==3,o=t.top===2?t.topC2:t.topC,l=(p,x)=>{let m=x.build(Yi,!1);return p.add(m),this.hands.push(m),m},c=new Te;for(let p=0;p<4;p++){let x=.144+p*.0265,m=.054-(p===3?.004:0);c.add(R.torus(.44,10,Math.PI),s,A(0,x,0,m,m,m,Math.PI/2,-Math.PI/2,0)),c.add(R.torus(.44,10,Math.PI),r,A(0,x,0,m,m,m,Math.PI/2,Math.PI/2,0))}c.add(R.sph(14,10),s,A(-.036,.182,-.004,.064,.122,.08)),c.add(R.sph(10,8),s,A(-.026,.2,-.028,.044,.064,.04)),c.add(R.sph(10,8),r,A(-.004,.232,-.03,.031,.062,.03,.25,0,0)),e&&c.add(R.box(),zt(t.gloveC,.45),A(-.066,.186,-.02,.01,.06,.04,0,0,.1)),l(this.pivot,c);let u=(p,x)=>{let m=new Te,g=jt([[0,.036,.034],[.07,.04,.038],[.5,.052,.05],[1,.06,.058]],14);g.rotateX(Math.PI/2),m.add(g,p,A(0,0,0));let _=jt([[0,.043,.041],[.075,.046,.044]],14,2,!1);return _.rotateX(Math.PI/2),m.add(_,x,A(0,0,0)),l(this.root,m)},h=a?o:i,d=a?zt(o,-.2):e?zt(t.gloveC,.3):i;this.foreR=u(h,d),this.foreL=u(h,d);let f=new Te;f.add(R.sph(14,10),s,A(0,0,0,.078,.068,.09));for(let p=0;p<4;p++)f.add(R.sph(8,6),r,A(.02,-.014,-.034+p*.022,.032,.036,.026));f.add(R.sph(8,6),r,A(.028,.02,-.02,.03,.03,.06,0,.3,0)),this.handL=l(this.root,f),this.look=t}setRod(t,e,i){this.rod&&(this.pivot.remove(this.rod.group),this.rod.group.traverse(s=>s.isMesh&&s.geometry&&s.geometry.dispose&&s.userData.own&&s.geometry.dispose())),this.rod=ws(t,e,i,1),this.rod.group.traverse(s=>{s.isMesh&&(s.castShadow=!1)}),this.pivot.add(this.rod.group)}update(t,e){if(!this.rod||!this.handL)return;this.t+=t;let i=this.t,s={th:54,be:.24,ox:0,oy:0,oz:0,bend:.04,side:0},r=!1;switch(e.mode){case"charge":{let c=ne(e.power,0,1);s.th=54-64*c,s.be=.24-.1*c,s.ox=.05*c,s.oy=.03*c,s.oz=.06*c;break}case"cast":{let c=ne(e.castK,0,1),u=1-(1-c)*(1-c);s.th=-10+96*u,s.be=.12,s.oy=.03*(1-u),s.bend=-.25*Math.sin(c*Math.PI),r=!0;break}case"wait":s.th=64+Math.sin(i*.9)*.8,s.be=.1;break;case"bite":s.th=61+Math.sin(i*40)*1.5,s.be=.1,s.bend=.3;break;case"fight":{let c=e.tension||0;s.th=46-16*c+Math.sin(i*31)*c*.9,s.be=.1-(e.steer||0)*.3,s.oy=.03+c*.02,s.bend=.28+.72*c,s.side=-(e.steer||0)*.6-(e.pull||0)*.5;break}case"landed":s.th=36,s.be=-.5,s.ox=.1,s.oy=-.05;break;default:break}let a=Math.min(1,(e.speed||0)/3);a>.02&&(this.walk+=t*(5+a*5)),s.ox+=Math.sin(this.walk)*.007*a,s.oy+=Math.abs(Math.cos(this.walk))*.009*a+Math.sin(i*1.5)*.002,this.swayX=_i(this.swayX,ne((e.lookDX||0)*.02,-.06,.06),10,t),this.swayY=_i(this.swayY,ne((e.lookDY||0)*.02,-.05,.05),10,t);let o=this.p,l=r?40:14;for(let c in s)o[c]=_i(o[c],s[c],c==="bend"||c==="side"?18:l,t);this.pivot.position.set(Su.x+o.ox-this.swayX*.3,Su.y+o.oy+this.swayY*.3,Su.z+o.oz),I0.setFromAxisAngle(Ob,o.be+this.swayX),L0.setFromAxisAngle(D0,-o.th*Ub+this.swayY),this.pivot.quaternion.copy(I0).multiply(L0).multiply(Fb),this.rod.setBend(o.bend,o.side),e.reel&&(this.crank+=t*(e.mode==="fight"?13:9)),this.rod.handle.rotation.x=this.crank,Ki.copy(Nb).applyQuaternion(this.pivot.quaternion).add(this.pivot.position),this.foreR.position.copy(Ki),this.foreR.lookAt(ah.copy(C0).applyMatrix4(this.root.matrixWorld)),this.foreR.scale.set(1,1,Ki.distanceTo(C0)),Ki.set(.03,.045,0).applyAxisAngle(D0,this.crank).add(this.rod.handle.position),Ki.applyQuaternion(this.pivot.quaternion).add(this.pivot.position),Ki.x-=.03,Ki.y-=.012,this.handL.position.copy(Ki),this.handL.rotation.set(.2,.5,-.5),ah.set(Ki.x-.02,Ki.y-.028,Ki.z+.04),this.foreL.position.copy(ah),this.foreL.lookAt(Ki.copy(P0).applyMatrix4(this.root.matrixWorld)),this.foreL.scale.set(1,1,ah.distanceTo(P0))}tipWorld(t){return this.rod.tip.getWorldPosition(t)}};function kb(n){return n>>>=0,()=>{n=n+1831565813>>>0;let t=n;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function Eu(n){let t=2166136261;for(let e=0;e<n.length;e++)t^=n.charCodeAt(e),t=Math.imul(t,16777619);return t>>>0}var lr=(n,t,e)=>Math.max(t,Math.min(e,n));function cr(n){let t=Qt[n.equip.rod]||ar[0],e=Qt[n.equip.line]||Co[0],i=Qt[n.equip.reel]||jr[0],s=Qt[n.equip.hook]||vu[0],r=Qt[n.equip.float]||Po[0],a=Qt[n.equip.bag]||bu[0];return{cast:t.cast,lineKg:t.line*e.mult,reel:t.reel*i.mult,smooth:1+jr.findIndex(o=>o.id===i.id)*.13,hookWin:.95*s.win*r.win,hold:s.hold,biteMult:r.bite||1,nightMult:r.night||1,bagCap:a.cap,net:!!(n.owned&&n.owned.net),sonar:!!(n.owned&&n.owned.sonar)}}var F0=n=>({cast:n.cast/60,line:Math.sqrt(n.line/22),reel:(n.reel-.55)/1.05});function lh(n){let t=Qt[n]||Qt.bread;return t.cat==="lure"?{id:t.id,lure:!0,attract:.9*Math.sqrt(t.power),power:t.power,rare:t.rare,size:t.size}:{id:t.id,lure:!1,attract:t.attract,power:0,rare:t.rare,size:t.size}}function zb(n,t,e){let i=lh(t),s=Qr(e),r=[];for(let a of wn){let o=a.zones[n.zone]||0;if(n.pier&&n.zone!=="pier"&&(o+=(a.zones.pier||0)*.8),!o||a.minDepth&&n.depth<a.minDepth)continue;let l=i.lure?a.lure*i.power:a.baits[i.id]??.3;if(!l)continue;let c=i.rare*(n.hot?1.5:1),u=Sn[a.rar].mult*(a.rar>=2?c:a.rar===1?Math.sqrt(c):1),h=o*l*(a.time[s]??1)*u;h>0&&r.push({f:a,w:h})}return r}function O0(n,t,e,i){let s=lh(t),r=s.lure?.015:{shallow:.07,pier:.07,backwater:.06,mid:.025}[n.zone]||.008,a=zb(n,t,e);if(!a.length||i()<r){let p=xu[Math.floor(i()*4)];return i()<.05&&(p=Zn.chest),{sp:p.id,junk:!0,w:N0(p.w[0]+(p.w[1]-p.w[0])*i()),len:0,trophy:!1}}let o=0;for(let p of a)o+=p.w;let l=i()*o,c=a[a.length-1].f;for(let p of a)if(l-=p.w,l<=0){c=p.f;break}let u=s.size*(n.hot?1.15:1),h=lr(2.6-(u-1)*1.6,1.3,2.6),d=Math.pow(i(),h),f=N0(c.w[0]+(c.w[1]-c.w[0])*d);return{sp:c.id,w:f,len:Math.round(c.look.lenK*Math.cbrt(f)),trophy:d>.8,junk:!1}}var N0=n=>Math.round(n*1e3)/1e3;function k0(n,t,e,i,s){let r=lh(t),a=Qr(e),o={dawn:1.2,day:1,dusk:1.2,night:.85}[a],l=1/10.5*(Kn[n.zone]?Kn[n.zone].act:1)*r.attract*i.biteMult*o;n.hot&&(l*=1.8),a==="night"&&(l*=i.nightMult);let c=lr(-Math.log(1-s()*.999)/l,2.5,28);return{t:r.lure?c*.5:c,nibbles:r.lure?0:Math.floor(s()*3)}}function z0(n,t,e,i){let s=lh(t),r=Qr(e),a=(Kn[n.zone]?Kn[n.zone].act:1)*s.attract*i.biteMult*{dawn:1.2,day:1,dusk:1.2,night:.85}[r];return n.hot&&(a*=1.8),lr(a/2.4,.05,1)}function B0(n,t){let e=Math.floor(t/sh),i=kb(Eu(n+":"+e)),s={};for(let o of wn)s[o.id]=Math.round((.85+i()*.35)*100)/100;let r=o=>{let l=wn.filter(c=>o.includes(c.rar));return l[Math.floor(i()*l.length)].id},a=[r([0]),r([1]),r([2,3])];for(let o of a)s[o]=1.6;return{period:e,mult:s,hot:a,nextIn:sh-(t-e*sh)}}function Fo(n,t){if(n.junk){let r=Zn[n.sp];return r?r.id==="chest"?Math.round(r.price*(.7+n.w/10)):r.price:1}let e=Ue[n.sp];if(!e)return 1;let i=e.w[0]+(e.w[1]-e.w[0])*.28,s=e.price*Math.pow(n.w/i,.9);return n.trophy&&(s*=1.25),t&&t.mult[n.sp]&&(s*=t.mult[n.sp]),Math.max(1,Math.round(s))}var ta=.22,Es=.78;function H0(n,t,e){let i=Ue[n.sp],s=n.junk||!i?.25:i.str*Math.pow(n.w,.55),r=s/(t.lineKg*.9);return{power:s,rho:r,junk:!!n.junk,temper:i?i.str:.5,stamina:1.7+2.9*Math.pow(s,.75),T:.45,p:.06,strain:0,slack:0,phase:"calm",phaseT:1.2+e()*1.2,pull:.35,dir:0,t:0,result:null,next:null,warned:!1}}function G0(n,t,e,i,s){let r=[];if(n.result)return r;n.t+=e,n.phaseT-=e;let a=Math.min(1.6,n.rho);n.next==null&&(n.next=Bb(n,s)),n.phase==="calm"&&n.next==="run"&&!n.warned&&n.phaseT<=.5&&(n.warned=!0,r.push("warn")),n.phaseT<=0&&(n.next==="run"?(n.phase="run",n.phaseT=.9+s()*1.5+.6*Math.min(1,n.rho),n.pull=(.9+.5*Math.min(1,n.rho)+s()*.15)*(.72+.28*wu(n)),n.dir=s()<.5?-1:1,r.push("run"),s()<.4&&r.push("jump")):(n.phase="calm",n.phaseT=(1.6+s()*2.2)*(1.25-.35*Math.min(1,n.rho)),n.pull=(.25+s()*.25)*(n.p>.75?.8:1),n.dir=0,r.push("calm")),n.next=null,n.warned=!1);let o=n.phase==="run",l;if(t.reel?l=(.1+.55*n.pull*(.3+a))/i.smooth:l=-(.5-.38*n.pull*Math.min(1.2,.2+a)),o&&n.dir&&(t.steer===-n.dir?l-=.22:t.steer===n.dir&&(l+=.2)),n.T=lr(n.T+l*e,0,1),n.T>Es){if(n.strain+=e*lr(n.rho*1.1+.3,.4,1.6)*(1+2.5*(n.T-Es)/(1-Es)),n.strain>=1)return n.result="snap",r.push("snap"),r}else n.strain=Math.max(0,n.strain-e*1);if(n.T<ta){if(n.slack+=e*(.4+.6*n.pull)*i.hold*(o?1.6:1),n.slack>=1.6&&!n.junk)return n.result="escape",r.push("escape"),r}else n.slack=Math.max(0,n.slack-e*.5);let c=n.T<ta?.35:n.T>Es?.85:1;return t.reel?n.p+=i.reel*c*(o?t.steer===-n.dir?.75:.35:1)*e/n.stamina:n.p-=(o?.1:.03)*(.5+Math.min(1.2,n.rho))*wu(n)*e/Math.sqrt(n.stamina),n.p=lr(n.p,0,1),n.p>=(i.net?.85:1)&&(n.result="landed",r.push("landed")),r}var wu=n=>1/(1+n.t/35);function Bb(n,t){if(n.junk||n.phase==="run")return"calm";let e=lr(.35+.5*Math.min(1,n.rho)+(n.temper-1)*.3,.15,.95);return t()<e*(.55+.45*wu(n))?"run":"calm"}function Hb(n){if(n.junk)return 2;let t=Ue[n.sp];return Math.round(6*Math.pow(t.rar+1,1.6)*(n.trophy?1.5:1)+3*Math.sqrt(n.w))}var U0=["\u041D\u043E\u0432\u0438\u0447\u043E\u043A","\u041D\u043E\u0432\u0438\u0447\u043E\u043A","\u041B\u044E\u0431\u0438\u0442\u0435\u043B\u044C","\u041B\u044E\u0431\u0438\u0442\u0435\u043B\u044C","\u0420\u044B\u0431\u0430\u043A","\u0420\u044B\u0431\u0430\u043A","\u0411\u044B\u0432\u0430\u043B\u044B\u0439","\u0411\u044B\u0432\u0430\u043B\u044B\u0439","\u0417\u043D\u0430\u0442\u043E\u043A","\u0417\u043D\u0430\u0442\u043E\u043A","\u041C\u0430\u0441\u0442\u0435\u0440","\u041C\u0430\u0441\u0442\u0435\u0440","\u041A\u0430\u043F\u0438\u0442\u0430\u043D","\u041A\u0430\u043F\u0438\u0442\u0430\u043D","\u041C\u043E\u0440\u0441\u043A\u043E\u0439 \u0432\u043E\u043B\u043A"];function Jn(n){let t=1,e=60,i=n;for(;i>=e&&t<99;)i-=e,t++,e=Math.round(60*Math.pow(t,1.45));return{lvl:t,cur:i,need:e,title:t>=20?"\u041B\u0435\u0433\u0435\u043D\u0434\u0430 \u0431\u0443\u0445\u0442\u044B":U0[Math.min(U0.length-1,t-1)]}}var V0=1;function Oo(){return{v:V0,name:"",look:null,coins:40,xp:0,owned:{rod1:1,line1:1,reel1:1,hook1:1,float1:1,bag1:1},equip:{rod:"rod1",line:"line1",reel:"reel1",hook:"hook1",float:"float1",bag:"bag1",tackle:"worm"},tackle:{worm:20},cooler:[],journal:{},stats:{casts:0,caught:0,sold:0,earned:0,snaps:0,escapes:0,best:null,legends:0},seenIntro:!1}}function W0(n){let t=Oo();if(!n||typeof n!="object")return t;for(let e of Object.keys(t))(n[e]===void 0||n[e]===null)&&(n[e]=t[e]);for(let e of["owned","equip","tackle","journal","stats"])typeof n[e]!="object"&&(n[e]=t[e]);for(let e of Object.keys(t.owned))n.owned[e]=1;for(let e of Object.keys(t.equip))(!Qt[n.equip[e]]||e!=="tackle"&&!n.owned[n.equip[e]])&&(n.equip[e]=t.equip[e]);for(let e of Object.keys(t.stats))n.stats[e]===void 0&&(n.stats[e]=t.stats[e]);return Array.isArray(n.cooler)||(n.cooler=[]),n.cooler=n.cooler.filter(e=>e&&(Ue[e.sp]||Zn[e.sp])&&e.w>0),n.coins=Math.max(0,Math.round(Number(n.coins)||0)),n.xp=Math.max(0,Math.round(Number(n.xp)||0)),jn(n,n.equip.tackle)<=0&&(n.equip.tackle="bread"),n.v=V0,n}var jn=(n,t)=>t==="bread"?1/0:n.tackle[t]||0,ko=(n,t)=>{let e=Qt[t];return e?e.count?jn(n,t)>0:!!n.owned[t]:!1};function ea(n){let t=Qt[n];return t?t.cat==="tackle"?t.price*t.pack:t.price:0}function X0(n,t){let e=Qt[t];if(!e)return{ok:!1,error:"\u0422\u0430\u043A\u043E\u0433\u043E \u0442\u043E\u0432\u0430\u0440\u0430 \u043D\u0435\u0442"};if(t==="bread")return{ok:!1,error:"\u0425\u043B\u0435\u0431 \u0438 \u0442\u0430\u043A \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u044B\u0439"};if(!e.count&&n.owned[t])return{ok:!1,error:"\u0423\u0436\u0435 \u043A\u0443\u043F\u043B\u0435\u043D\u043E"};let i=ea(t);return n.coins<i?{ok:!1,error:`\u041D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 ${i-n.coins} \u043C\u043E\u043D\u0435\u0442`}:(n.coins-=i,e.count?(n.tackle[t]=(n.tackle[t]||0)+(e.cat==="tackle"?e.pack:1),(e.cat==="lure"||n.equip.tackle==="bread")&&(n.equip.tackle=t)):(n.owned[t]=1,e.slot&&(n.equip[e.slot]=t)),{ok:!0,price:i})}function q0(n,t){let e=Qt[t];return!e||!e.slot?{ok:!1,error:"\u042D\u0442\u043E \u043D\u0435\u043B\u044C\u0437\u044F \u0432\u0437\u044F\u0442\u044C \u0432 \u0440\u0443\u043A\u0438"}:ko(n,t)?(n.equip[e.slot]=t,{ok:!0}):{ok:!1,error:"\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043A\u0443\u043F\u0438\u0442\u0435 \u044D\u0442\u043E \u043D\u0430 \u0440\u044B\u043D\u043A\u0435"}}function ch(n){let t=n.equip.tackle;return t==="bread"?{left:1/0,switched:!1}:(n.tackle[t]=Math.max(0,(n.tackle[t]||0)-1),n.tackle[t]<=0?(delete n.tackle[t],n.equip.tackle="bread",{left:0,switched:!0}):{left:n.tackle[t],switched:!1})}function $0(n,t,e){return n.cooler.length>=e.bagCap?{ok:!1,full:!0}:(n.cooler.push({sp:t.sp,w:t.w,len:t.len,trophy:!!t.trophy,junk:!!t.junk}),{ok:!0})}function Y0(n,t,e){let i=Math.round(Hb(t)*(e?1.3:1)),s=Jn(n.xp).lvl;n.xp+=i,n.stats.caught++;let r=!1,a=!1;if(!t.junk){let o=n.journal[t.sp]||(n.journal[t.sp]={n:0,best:0});r=o.n===0,o.n++,t.w>o.best&&(a=!r,o.best=t.w),Ue[t.sp].rar===4&&n.stats.legends++,(!n.stats.best||t.w>n.stats.best.w)&&(n.stats.best={sp:t.sp,w:t.w})}return{xp:i,isNew:r,record:a,levelUp:Jn(n.xp).lvl>s?Jn(n.xp).lvl:0}}function K0(n,t,e){let i=t==null?n.cooler.slice():[n.cooler[t]].filter(Boolean);if(!i.length)return{ok:!1,error:"\u0421\u0430\u0434\u043E\u043A \u043F\u0443\u0441\u0442"};let s=0;for(let r of i)s+=Fo(r,e);return t==null?n.cooler=[]:n.cooler.splice(t,1),n.coins+=s,n.stats.sold+=i.length,n.stats.earned+=s,{ok:!0,total:s,n:i.length}}function Z0(n,t){let e=0;for(let i of n.cooler)e+=Fo(i,t);return e}var j0="rybak.profile.v1",Q0="rybak.settings.v1",ia={get(n){try{return JSON.parse(localStorage.getItem(n))}catch{return null}},set(n,t){try{localStorage.setItem(n,JSON.stringify(t))}catch{}}};function tm(){let n=ia.get(j0),t=W0(n||Oo());return t.look=Ms(t.look||sr[Math.floor(Math.random()*4)].look),t.fresh=!n,t}var J0=null;function fn(n){clearTimeout(J0),J0=setTimeout(()=>{let{fresh:t,...e}=n;ia.set(j0,e)},300)}var Gb={sens:1,invertY:!1,quality:"auto",fov:62,master:.8,amb:.7,sfx:.85,voiceVol:1,ptt:!1,near:!1,hints:!0},Fe=Object.assign({},Gb,ia.get(Q0)||{}),Tu=()=>ia.set(Q0,Fe),na={get:()=>ia.get("rybak.session")||null,set:n=>ia.set("rybak.session",n)};var hh=class{constructor(t){this.canvas=t,this.keys=new Set,this.lookDX=0,this.lookDY=0,this.primary=!1,this.pressed=new Set,this.locked=!1,this.lockedAt=0,this.free=!1,this.everLocked=!1,this.lockFails=0,this.failAt=0,this.mouse={x:.5,y:.5,in:!1},this.onFree=()=>{},this.enabled=!1,this.touch={on:!1,mx:0,mz:0,primary:!1},this.pad={on:!1,last:{}},this.device="kb",this.onLockChange=()=>{},this.typing=()=>!1,addEventListener("keydown",e=>{this.typing()||((e.code==="Tab"||e.code==="Space")&&e.preventDefault(),e.repeat||(this.keys.add(e.code),this.enabled&&this.pressed.add(e.code)),this.device="kb")}),addEventListener("keyup",e=>this.keys.delete(e.code)),addEventListener("blur",()=>{this.keys.clear(),this.primary=!1}),t.addEventListener("mousedown",e=>{if(this.enabled){if(!this.locked&&!this.free&&!this.touch.on)return this.lock();e.button===0?(this.primary=!0,this.pressed.add("Primary")):e.button===2&&this.pressed.add("Secondary")}}),addEventListener("mouseup",e=>{e.button===0&&(this.primary=!1)}),t.addEventListener("contextmenu",e=>e.preventDefault()),addEventListener("mousemove",e=>{if(this.free){if(this.mouse.x=e.clientX/innerWidth,this.mouse.y=e.clientY/innerHeight,this.mouse.in=!0,!this.enabled)return}else if(!this.locked)return;this.lookDX+=e.movementX,this.lookDY+=e.movementY}),document.addEventListener("mouseleave",()=>this.mouse.in=!1),document.addEventListener("pointerlockerror",()=>this.lockFailed()),document.addEventListener("pointerlockchange",()=>{if(this.locked=document.pointerLockElement===t,this.locked?(this.lockedAt=performance.now(),this.everLocked=!0):this.primary=!1,this.locked&&!this.enabled)return document.exitPointerLock();this.onLockChange(this.locked)})}lock(){if(!(this.touch.on||this.locked||this.free||!this.enabled)){this.lockedAt=performance.now();try{let t=this.canvas.requestPointerLock();t&&t.catch&&t.catch(()=>this.lockFailed())}catch{this.lockFailed()}}}lockFailed(){let t=performance.now();this.everLocked||this.free||t-this.failAt<300||(this.failAt=t,!(++this.lockFails<2)&&(this.free=!0,this.canvas.style.cursor="crosshair",this.onFree()))}get grab(){return this.locked||this.free}unlock(){document.pointerLockElement===this.canvas&&document.exitPointerLock()}hit(t){return this.pressed.has(t)}poll(){let t=navigator.getGamepads?[...navigator.getGamepads()].find(a=>a&&a.connected):null;this.pad.on=!!t;let e=0,i=0,s=0;this.enabled&&((this.keys.has("KeyW")||this.keys.has("ArrowUp"))&&(i+=1),(this.keys.has("KeyS")||this.keys.has("ArrowDown"))&&(i-=1),(this.keys.has("KeyD")||this.keys.has("ArrowRight"))&&(e+=1),(this.keys.has("KeyA")||this.keys.has("ArrowLeft"))&&(e-=1),s=e);let r=this.primary||this.touch.primary;if(this.free&&this.enabled&&this.mouse.in&&(this.lookDX+=(this.mouse.x<.07?-1:this.mouse.x>.93?1:0)*11,this.lookDY+=(this.mouse.y<.06?-1:this.mouse.y>.94?1:0)*6),this.touch.on&&(e+=this.touch.mx,i+=this.touch.mz,s+=this.touch.mx),t&&this.enabled){let a=h=>Math.abs(h)<.18?0:h,o=a(t.axes[0]||0),l=a(t.axes[1]||0);e+=o,i-=l,s+=o,this.lookDX+=a(t.axes[2]||0)*14,this.lookDY+=a(t.axes[3]||0)*10;let c=h=>!!(t.buttons[h]&&t.buttons[h].pressed),u={7:"Primary",0:"KeyE",1:"Secondary",2:"Tab",3:"KeyJ",9:"Escape",10:"ShiftLeft",4:"KeyC",5:"KeyM"};for(let h in u){let d=c(+h);d&&!this.pad.last[h]&&(this.pressed.add(u[h]),this.device="pad"),this.pad.last[h]=d}c(7)&&(r=!0),Math.abs(o)+Math.abs(l)>.3&&(this.device="pad")}this.moveX=ne(e,-1,1),this.moveZ=ne(i,-1,1),this.steer=Math.abs(s)>.35?Math.sign(s):0,this.hold=this.enabled&&r,this.sprint=this.keys.has("ShiftLeft")||this.keys.has("ShiftRight")}endFrame(){this.pressed.clear(),this.lookDX=0,this.lookDY=0}},dh=class{constructor(t){this.camera=t,this.x=lu.x,this.z=lu.z,this.y=Jc(this.x,this.z),this.yaw=0,this.pitch=-.06,this.speed=0,this.jump=0,this.vy=0,this.sit=!1,this.wade=0,this.dangle=!1,this.walk=0,this.eye=1.62,this.eyeNow=1.62,this.onStep=()=>{},this.shake=0}place(t,e,i=0){this.x=t,this.z=e,this.y=Jc(t,e),this.yaw=i,this.pitch=-.06,this.sit=!1}update(t,e,i){let s=.0022*Fe.sens;this.yaw-=e.lookDX*s,this.pitch=ne(this.pitch-e.lookDY*s*(Fe.invertY?-1:1),-1.45,1.45);let r=i?e.moveX:0,a=i?e.moveZ:0,o=Math.hypot(r,a);o>1&&(r/=o,a/=o),this.sit&&o>.1&&i&&(this.sit=!1),this.wade=this.onDeck?0:Math.max(0,-Se(this.x,this.z));let l=(this.sit?0:e.sprint?5.4:3.5)*(1-Math.min(.55,this.wade*.9)),c=Math.sin(this.yaw),u=Math.cos(this.yaw),h=(r*u-a*c)*l,d=(-r*c-a*u)*l,f=this.x+h*t,p=this.z+d*t,x=!1;o>.01&&!this.sit&&(To(f,p)?(this.x=f,this.z=p,x=!0):To(f,this.z)?(this.x=f,x=!0):To(this.x,p)&&(this.z=p,x=!0)),this.speed=_i(this.speed,x?Math.hypot(h,d):0,12,t);let m=Jc(this.x,this.z);if(this.y=_i(this.y,m,m>this.y?16:11,t),e.hit("Space")&&this.jump<=.001&&i&&!this.sit&&(this.vy=3.4),(this.vy!==0||this.jump>0)&&(this.jump+=this.vy*t,this.vy-=10.5*t,this.jump<=0&&(this.jump=0,this.vy=0,this.onStep(!0))),this.speed>.4&&this.jump===0){let b=Math.floor(this.walk/Math.PI);this.walk+=t*(4.6+this.speed/2.4*5.2),Math.floor(this.walk/Math.PI)!==b&&this.onStep(!1)}this.eyeNow=_i(this.eyeNow,this.sit?this.dangle?.86:.8:this.eye,9,t);let g=this.speed>.4?Math.abs(Math.cos(this.walk))*.035*Math.min(1,this.speed/3):0;this.shake=Math.max(0,this.shake-t*3);let _=this.shake*.012;this.camera.position.set(this.x+(Math.random()-.5)*_,this.y+this.eyeNow+this.jump-g+(Math.random()-.5)*_,this.z),this.camera.rotation.set(this.pitch,this.yaw,0,"YXZ")}toggleSit(){if(this.sit=!this.sit,this.sit){let t=this.x-Math.sin(this.yaw)*.7,e=this.z-Math.cos(this.yaw)*.7;this.dangle=!!zi(this.x,this.z,0)&&!To(t,e)}return this.sit}get onDeck(){return!!zi(this.x,this.z,-.05)}};var em={std:[[0,.012,.01,0],[.06,.07,.04,0],[.2,.13,.065,.005],[.42,.15,.07,.01],[.65,.115,.055,.005],[.85,.055,.028,0],[1,.03,.012,0]],tall:[[0,.012,.01,0],[.06,.085,.04,0],[.2,.19,.065,.01],[.42,.225,.07,.015],[.65,.17,.055,.01],[.85,.065,.028,0],[1,.035,.012,0]],carp:[[0,.02,.015,0],[.06,.085,.055,0],[.2,.15,.085,.01],[.42,.175,.095,.015],[.65,.135,.075,.01],[.85,.065,.035,0],[1,.04,.014,0]],goby:[[0,.03,.03,0],[.05,.085,.075,0],[.18,.11,.085,0],[.4,.095,.065,0],[.65,.07,.045,0],[.85,.045,.025,0],[1,.03,.012,0]],slim:[[0,.01,.008,0],[.06,.05,.032,0],[.2,.09,.05,0],[.42,.1,.055,.004],[.65,.08,.045,0],[.85,.04,.022,0],[1,.022,.01,0]],pike:[[0,.012,.02,-.005],[.08,.04,.04,-.005],[.2,.065,.05,0],[.45,.08,.055,0],[.7,.075,.048,0],[.86,.04,.025,0],[1,.024,.01,0]],needle:[[0,.004,.004,0],[.15,.012,.01,0],[.25,.03,.022,0],[.5,.035,.025,0],[.78,.03,.02,0],[.92,.016,.01,0],[1,.012,.006,0]],eel:[[0,.012,.012,0],[.04,.03,.028,0],[.12,.036,.032,0],[.5,.034,.03,0],[.8,.026,.02,0],[.95,.014,.008,0],[1,.006,.004,0]],tuna:[[0,.012,.012,0],[.06,.075,.06,0],[.2,.14,.105,0],[.4,.16,.115,0],[.62,.12,.085,0],[.82,.045,.03,0],[.94,.018,.022,0],[1,.016,.01,0]],sword:[[0,.012,.012,0],[.06,.06,.045,0],[.2,.105,.075,0],[.42,.115,.08,0],[.65,.085,.06,0],[.84,.035,.025,0],[.95,.016,.02,0],[1,.014,.01,0]],grouper:[[0,.04,.035,-.01],[.06,.11,.085,-.005],[.2,.19,.12,.005],[.42,.21,.125,.01],[.65,.165,.095,.005],[.85,.08,.04,0],[1,.05,.016,0]],cat:[[0,.03,.05,-.01],[.05,.07,.1,-.01],[.16,.105,.115,0],[.35,.11,.095,0],[.6,.08,.06,0],[.82,.05,.03,0],[1,.03,.01,0]],flat:[[0,.012,.008,0],[.06,.1,.022,0],[.22,.2,.03,0],[.45,.23,.03,0],[.68,.17,.026,0],[.86,.06,.016,0],[1,.035,.008,0]]},Vb={std:{tail:"fork",d:[.3,.62,.1],a:[.6,.78,.07]},tall:{tail:"fork",d:[.28,.68,.1],a:[.58,.8,.08]},carp:{tail:"fork",d:[.3,.72,.09],a:[.64,.8,.07]},goby:{tail:"round",d:[.25,.42,.08],d2:[.48,.8,.075],a:[.5,.8,.05]},slim:{tail:"fork",d:[.3,.5,.075],d2:[.58,.76,.06],a:[.6,.78,.055]},pike:{tail:"fork",d:[.68,.84,.085],a:[.68,.84,.075]},needle:{tail:"fork",d:[.76,.9,.04],a:[.74,.9,.04],tailK:.5},eel:{tail:"none",d:[.3,1,.03],a:[.42,1,.025]},tuna:{tail:"cres",d:[.26,.44,.11],d2:[.55,.66,.13],a:[.58,.69,.12]},sword:{tail:"cres",d:[.16,.36,.22],d2:[.7,.78,.05],a:[.62,.74,.08]},grouper:{tail:"round",d:[.24,.8,.09],a:[.6,.8,.08]},cat:{tail:"round",d:[.26,.36,.08],a:[.45,.95,.055],tailK:.75},flat:{tail:"round",d:[.1,.9,.055],a:[.12,.9,.055]}};function sa(n,t){let e=0;for(;e<n.length-2&&n[e+1][0]<t;)e++;let i=n[e],s=n[e+1],r=Math.max(0,Math.min(1,(t-i[0])/(s[0]-i[0]))),a=r*r*(3-2*r);return[i[1]+(s[1]-i[1])*a,i[2]+(s[2]-i[2])*a,i[3]+(s[3]-i[3])*a]}function Wb(n,t){return Mn(128,256,s=>{let r=bi(t),a=s.createLinearGradient(0,0,128,0);a.addColorStop(0,n.belly),a.addColorStop(.16,n.belly),a.addColorStop(.3,n.side),a.addColorStop(.4,n.back),a.addColorStop(.6,n.back),a.addColorStop(.7,n.side),a.addColorStop(.84,n.belly),a.addColorStop(1,n.belly),s.fillStyle=a,s.fillRect(0,0,128,256);let o=n.patC||zt(n.back,-.4),l=h=>{h(1),h(-1)},c=(h,d)=>128/2+d*h*(128/2);if(n.band&&(s.globalAlpha=.75,s.fillStyle=n.band,l(h=>s.fillRect(Math.min(c(.42,h),c(.58,h)),n.shape==="tall"?256*.8:0,Math.abs(c(.58,h)-c(.42,h)),n.shape==="tall"?256*.08:256*.92)),s.globalAlpha=1),n.pat==="scales"||n.pat==="koi"){s.strokeStyle="rgba(0,0,0,0.13)",s.lineWidth=1;for(let h=6;h<256*.88;h+=7)for(let d=h/7%2?0:4;d<128;d+=8)s.beginPath(),s.arc(d,h,4,.1,Math.PI-.1),s.stroke()}if(n.pat==="bars"){s.fillStyle=o;for(let h=0;h<6;h++){let d=256*(.12+h*.13);s.globalAlpha=.8,l(f=>{s.beginPath(),s.moveTo(c(0,f),d-7),s.lineTo(c(0,f),d+7),s.lineTo(c(.62,f),d+2),s.lineTo(c(.62,f),d-2),s.fill()})}s.globalAlpha=1}else if(n.pat==="spots"||n.pat==="dots"){s.fillStyle=o;let h=n.pat==="dots"?90:46;for(let d=0;d<h;d++){let f=r()*.6,p=r()*256*.9,x=n.pat==="dots"?1.2+r()*1.3:2.5+r()*3;s.globalAlpha=.85,l(m=>{s.beginPath(),s.ellipse(c(f,m),p,x*.8,x*1.5,0,0,7),s.fill()})}s.globalAlpha=1}else if(n.pat==="line"||n.pat==="lines"){s.fillStyle=o;let h=n.pat==="lines"?[.3,.42,.54,.66]:[.47];for(let d of h)l(f=>s.fillRect(c(d,f)-(n.pat==="line"?2:1),0,n.pat==="line"?4:2,256*.9))}else if(n.pat==="tiger"){s.strokeStyle=o,s.lineWidth=3.5;for(let h=0;h<16;h++){let d=256*(.06+h*.052);l(f=>{s.beginPath(),s.moveTo(c(0,f),d),s.quadraticCurveTo(c(.2,f),d+9,c(.42,f),d-3),s.stroke()})}}else if(n.pat==="marble"||n.pat==="koi"){let h=n.pat==="koi"?9:26;for(let d=0;d<h;d++){s.fillStyle=n.pat==="koi"&&d%3===2?"#e2452f":o,s.globalAlpha=n.pat==="koi"?.95:.5;let f=r()*.75,p=r()*256*.9,x=n.pat==="koi"?9+r()*14:4+r()*9,m=r()<.5?1:-1;s.beginPath(),s.ellipse(c(f,m),p,x*.7,x*1.3,r()*3,0,7),s.fill(),n.pat==="marble"&&(s.beginPath(),s.ellipse(c(f,-m),p,x*.7,x*1.3,r()*3,0,7),s.fill())}s.globalAlpha=1}let u=s.createLinearGradient(0,256*.84,0,256);u.addColorStop(0,"rgba(0,0,0,0)"),u.addColorStop(1,"rgba(0,0,0,0.16)"),s.fillStyle=u,s.fillRect(0,256*.84,128,256*.16),s.strokeStyle="rgba(0,0,0,0.22)",s.lineWidth=2,l(h=>{s.beginPath(),s.moveTo(c(.12,h),256*.8),s.quadraticCurveTo(c(.5,h),256*.74,c(.85,h),256*.82),s.stroke()})})}var uh=new Map;function Xb(n){if(uh.has(n))return uh.get(n);let e=Ue[n].look,i=em[e.shape]?e.shape:"std",s=em[i],r=Vb[i],a={look:e,shape:i,fins:r,P:s};if(i==="ray")return uh.set(n,a),a;let o=26,l=[];for(let u=0;u<=o;u++){let h=u/o,[d,f,p]=sa(s,h),x=i==="eel"?Math.sin(h*Math.PI*2.6)*.035*h:0;l.push([h-.5,d,f,-p,x])}let c=jt(l,18,i==="flat"?2:2.2,!0);return c.rotateZ(-Math.PI/2),a.body=c,a.tex=Wb(e,n.length*77+n.charCodeAt(0)),a.bodyMat=new Me({map:a.tex,roughness:.42,metalness:.08}),a.finMat=new Me({color:e.fin,roughness:.6,side:Xe,transparent:!0,opacity:.92}),uh.set(n,a),a}function Au(n,t,e,i){let[s,r]=t,a=[],o=6,l=i?1:-1;for(let c=0;c<=o;c++){let u=s+(r-s)*c/o,[h,,d]=sa(n,u);a.push([u-.5,d+l*(h-.012)])}for(let c=o;c>=0;c--){let u=c/o,h=s+(r-s)*u+.03,[d,,f]=sa(n,Math.min(1,h)),p=e*(.35+.65*Math.sin(Math.PI*Math.min(1,u*1.25+.12)));a.push([h-.5,f+l*(d+p)])}return ir(a)}function ra(n){let t=Xb(n),{look:e,shape:i,fins:s,P:r}=t,a=new he,o=ln("#f8fafc",.3),l=ln("#0b0f14",.2);if(e.shape==="ray"){let v=new Rt(R.sph(20,12),new Me({map:qb(e),roughness:.5}));v.scale.set(.86,.1,1),a.add(v);let E=new Rt(Bi([[.36,0,0],[.7,.01,.03],[1,0,-.02]],.016,6,y=>1-y*.8),ln(e.back,.6));a.add(E);for(let y of[-1,1]){let M=new Rt(R.sph(8,6),l);M.scale.setScalar(.035),M.position.set(-.26,.045,y*.09),a.add(M)}a.rotation.x=.95;let T=new he;return T.add(a),T.userData={tail:E,shape:"ray"},T}a.add(new Rt(t.body,t.bodyMat));let c=t.finMat,u=new he;u.position.x=.49;let h=s.tailK||1,d=null;if(s.tail==="fork"?d=ir([[0,.02],[.2*h,.17*h],[.24*h,.16*h],[.14*h,0],[.24*h,-.16*h],[.2*h,-.17*h],[0,-.02]]):s.tail==="cres"?d=ir([[0,.015],[.1,.2],[.2,.3],[.17,.2],[.1,0],[.17,-.2],[.2,-.3],[.1,-.2],[0,-.015]]):s.tail==="round"&&(d=ir([[0,.03],[.1*h,.12*h],[.2*h,.11*h],[.25*h,0],[.2*h,-.11*h],[.1*h,-.12*h],[0,-.03]])),d&&u.add(new Rt(d,c)),a.add(u),a.add(new Rt(Au(r,s.d,s.d[2],!0),c)),s.d2&&a.add(new Rt(Au(r,s.d2,s.d2[2],!0),c)),s.a&&a.add(new Rt(Au(r,s.a,s.a[2],!1),c)),i!=="eel"&&i!=="flat"){let[v,E,T]=sa(r,.26);for(let P of[-1,1]){let C=new Rt(ir([[0,0],[.13,.035],[.15,-.03],[.04,-.05]]),c);C.position.set(-.24,T-v*.35,P*E*.95),C.rotation.set(.2*P,-.55*P,-.5),a.add(C)}let[y,,M]=sa(r,.42),U=new Rt(ir([[0,0],[.1,-.02],[.1,-.075],[.02,-.04]]),c);U.position.set(-.1,M-y+.012,0),a.add(U)}let[f,p,x]=sa(r,i==="pike"||i==="needle"?.2:i==="sword"?.07:.1),m=(e.bigEye?.034:i==="needle"||i==="eel"?.013:.023)*(i==="grouper"||i==="cat"?.8:1),g=(i==="pike"||i==="needle"?.2:i==="sword"?.07:.1)-.5,_=i==="flat"?[1]:[-1,1];for(let v of _){let E=new Rt(R.sph(10,8),o);E.scale.set(m*2,m*2,m*.9),E.position.set(g,x+f*.3,v*p*.93),a.add(E);let T=new Rt(R.sph(8,6),l);T.scale.set(m*1.15,m*1.15,m*.7),T.position.set(g-m*.2,x+f*.3,v*(p*.93+m*.25)),a.add(T)}if(i==="flat"){let v=new Rt(R.sph(10,8),l);v.scale.set(.04,.04,.03),v.position.set(-.36,.09,.03),a.add(v)}if(i==="sword"){let v=new Rt(R.cone(6),ln(e.back,.5));v.scale.set(.03,.36,.02),v.rotation.z=Math.PI/2,v.position.set(-.66,0,0),a.add(v)}if(i==="cat"){let v=ln(e.back,.7);for(let E of[-1,1])a.add(new Rt(Bi([[-.47,-.02,E*.04],[-.56,0,E*.14],[-.5,.05,E*.26]],.005,4),v)),a.add(new Rt(Bi([[-.46,-.04,E*.03],[-.5,-.1,E*.07],[-.44,-.16,E*.1]],.004,4),v))}if(i==="needle"){let v=new Rt(R.cone(5),ln(e.back,.5));v.scale.set(.014,.16,.012),v.rotation.z=Math.PI/2,v.position.set(-.57,0,0),a.add(v)}a.traverse(v=>{v.isMesh&&(v.castShadow=!0)});let b=new he;return b.add(a),b.userData={tail:u,shape:i},b}function qb(n){return Mn(128,128,t=>{t.fillStyle=n.back,t.fillRect(0,0,128,128),t.fillStyle=n.belly,t.fillRect(0,64,128,64);let e=bi(9);t.fillStyle=n.patC;for(let i=0;i<60;i++)t.beginPath(),t.arc(e()*128,e()*60,1.5+e()*2.5,0,7),t.fill()})}function zo(n,t,e=1){let i=n.userData;!i||!i.shape||!n.children[0]||(i.tail&&i.shape!=="ray"&&(i.tail.rotation.y=Math.sin(t*9)*.5*e),n.children[0].rotation.y=Math.sin(t*9+1)*.12*e)}var im=new oi,fh=new D,aa=class extends lo{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";let t=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],e=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],i=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(i),this.setAttribute("position",new Wt(t,3)),this.setAttribute("uv",new Wt(e,2))}applyMatrix4(t){let e=this.attributes.instanceStart,i=this.attributes.instanceEnd;return e!==void 0&&(e.applyMatrix4(t),i.applyMatrix4(t),e.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(t){let e;t instanceof Float32Array?e=t:Array.isArray(t)&&(e=new Float32Array(t));let i=new ms(e,6,1);return this.setAttribute("instanceStart",new sn(i,3,0)),this.setAttribute("instanceEnd",new sn(i,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(t){let e;t instanceof Float32Array?e=t:Array.isArray(t)&&(e=new Float32Array(t));let i=new ms(e,6,1);return this.setAttribute("instanceColorStart",new sn(i,3,0)),this.setAttribute("instanceColorEnd",new sn(i,3,3)),this}fromWireframeGeometry(t){return this.setPositions(t.attributes.position.array),this}fromEdgesGeometry(t){return this.setPositions(t.attributes.position.array),this}fromMesh(t){return this.fromWireframeGeometry(new no(t.geometry)),this}fromLineSegments(t){let e=t.geometry;return this.setPositions(e.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new oi);let t=this.attributes.instanceStart,e=this.attributes.instanceEnd;t!==void 0&&e!==void 0&&(this.boundingBox.setFromBufferAttribute(t),im.setFromBufferAttribute(e),this.boundingBox.union(im))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ui),this.boundingBox===null&&this.computeBoundingBox();let t=this.attributes.instanceStart,e=this.attributes.instanceEnd;if(t!==void 0&&e!==void 0){let i=this.boundingSphere.center;this.boundingBox.getCenter(i);let s=0;for(let r=0,a=t.count;r<a;r++)fh.fromBufferAttribute(t,r),s=Math.max(s,i.distanceToSquared(fh)),fh.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(fh));this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}};St.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new dt},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};Ci.line={uniforms:yo.merge([St.common,St.fog,St.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		float trimSegmentAlpha( const in vec4 start, const in vec4 end ) {

			// compute the interpolation factor needed to trim the segment so it terminates
			// between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column

			// we need different nearEstimate formula for reversed and default depth buffer
			// a is positive with a reversed depth buffer so it can be used for controlling the code flow
			float nearEstimate = ( a > 0.0 ) ? ( - b / ( a + 1.0 ) ) : ( - 0.5 * b / a );

			return ( nearEstimate - start.z ) / ( end.z - start.z );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef USE_DASH

				float lineDistanceStart = dashScale * instanceDistanceStart;
				float lineDistanceEnd = dashScale * instanceDistanceEnd;

			#endif

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( start, end );
					end.xyz = mix( start.xyz, end.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceEnd = mix( lineDistanceStart, lineDistanceEnd, alpha );

					#endif

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( end, start );
					start.xyz = mix( end.xyz, start.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceStart = mix( lineDistanceEnd, lineDistanceStart, alpha );

					#endif

				}

			}

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? lineDistanceStart : lineDistanceEnd;
				vUv = uv;

			#endif

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = perspective ? normalize( mix( start.xyz, end.xyz, 0.5 ) ) : vec3( 0.0, 0.0, - 1.0 );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;

				// only shift the depth of vertices in front of the camera (#35137)
				if ( clip.w > 0.0 ) clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			float alpha = opacity;
			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			#ifdef WORLD_UNITS

				float len;

				if ( isOrthographic ) {

					// View rays are parallel to the z axis so the distance reduces to camera-space XY
					vec2 lineDir = worldEnd.xy - worldStart.xy;
					float t = clamp( dot( worldPos.xy - worldStart.xy, lineDir ) / dot( lineDir, lineDir ), 0.0, 1.0 );
					len = length( worldStart.xy + lineDir * t - worldPos.xy );

				} else {

					// Find the closest points on the view ray and the line segment
					vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
					vec3 lineDir = worldEnd - worldStart;
					vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

					vec3 p1 = worldStart + lineDir * params.x;
					vec3 p2 = rayEnd * params.y;
					vec3 delta = p1 - p2;
					len = length( delta );

				}

				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};var Ts=class extends Ge{constructor(t){super({type:"LineMaterial",uniforms:yo.clone(Ci.line.uniforms),vertexShader:Ci.line.vertexShader,fragmentShader:Ci.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(t)}get color(){return this.uniforms.diffuse.value}set color(t){this.uniforms.diffuse.value=t}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(t){t===!0!==this.worldUnits&&(this.needsUpdate=!0),t===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(t){this.uniforms.linewidth&&(this.uniforms.linewidth.value=t)}get dashed(){return"USE_DASH"in this.defines}set dashed(t){t===!0!==this.dashed&&(this.needsUpdate=!0),t===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(t){this.uniforms.dashScale.value=t}get dashSize(){return this.uniforms.dashSize.value}set dashSize(t){this.uniforms.dashSize.value=t}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(t){this.uniforms.dashOffset.value=t}get gapSize(){return this.uniforms.gapSize.value}set gapSize(t){this.uniforms.gapSize.value=t}get opacity(){return this.uniforms.opacity.value}set opacity(t){this.uniforms&&(this.uniforms.opacity.value=t)}get resolution(){return this.uniforms.resolution.value}set resolution(t){this.uniforms.resolution.value.copy(t)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(t){this.defines&&(t===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),t===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}};var Ru=new _e,nm=new D,sm=new D,ci=new _e,hi=new _e,Tn=new _e,Cu=new D,Pu=new ge,di=new co,rm=new D,ph=new oi,mh=new Ui,An=new _e,Rn,hr;function am(n,t,e){return An.set(0,0,-t,1).applyMatrix4(n.projectionMatrix),An.multiplyScalar(1/An.w),An.x=hr/e.width,An.y=hr/e.height,An.applyMatrix4(n.projectionMatrixInverse),An.multiplyScalar(1/An.w),Math.abs(Math.max(An.x,An.y))}function $b(n,t){let e=n.matrixWorld,i=n.geometry,s=i.attributes.instanceStart,r=i.attributes.instanceEnd,a=Math.min(i.instanceCount,s.count);for(let o=0,l=a;o<l;o++){di.start.fromBufferAttribute(s,o),di.end.fromBufferAttribute(r,o),di.applyMatrix4(e);let c=new D,u=new D;Rn.distanceSqToSegment(di.start,di.end,u,c),u.distanceTo(c)<hr*.5&&t.push({point:u,pointOnLine:c,distance:Rn.origin.distanceTo(u),object:n,face:null,faceIndex:o,uv:null,uv1:null})}}function Yb(n,t,e){let i=t.projectionMatrix,r=n.material.resolution,a=n.matrixWorld,o=n.geometry,l=o.attributes.instanceStart,c=o.attributes.instanceEnd,u=Math.min(o.instanceCount,l.count),h=-t.near;Rn.at(1,Tn),Tn.w=1,Tn.applyMatrix4(t.matrixWorldInverse),Tn.applyMatrix4(i),Tn.multiplyScalar(1/Tn.w),Tn.x*=r.x/2,Tn.y*=r.y/2,Tn.z=0,Cu.copy(Tn),Pu.multiplyMatrices(t.matrixWorldInverse,a);for(let d=0,f=u;d<f;d++){if(ci.fromBufferAttribute(l,d),hi.fromBufferAttribute(c,d),ci.w=1,hi.w=1,ci.applyMatrix4(Pu),hi.applyMatrix4(Pu),ci.z>h&&hi.z>h)continue;if(ci.z>h){let b=ci.z-hi.z,v=(ci.z-h)/b;ci.lerp(hi,v)}else if(hi.z>h){let b=hi.z-ci.z,v=(hi.z-h)/b;hi.lerp(ci,v)}ci.applyMatrix4(i),hi.applyMatrix4(i),ci.multiplyScalar(1/ci.w),hi.multiplyScalar(1/hi.w),ci.x*=r.x/2,ci.y*=r.y/2,hi.x*=r.x/2,hi.y*=r.y/2,di.start.copy(ci),di.start.z=0,di.end.copy(hi),di.end.z=0;let x=di.closestPointToPointParameter(Cu,!0);di.at(x,rm);let m=kd.lerp(ci.z,hi.z,x),g=m>=-1&&m<=1,_=Cu.distanceTo(rm)<hr*.5;if(g&&_){di.start.fromBufferAttribute(l,d),di.end.fromBufferAttribute(c,d),di.start.applyMatrix4(a),di.end.applyMatrix4(a);let b=new D,v=new D;Rn.distanceSqToSegment(di.start,di.end,v,b),e.push({point:v,pointOnLine:b,distance:Rn.origin.distanceTo(v),object:n,face:null,faceIndex:d,uv:null,uv1:null})}}}var gh=class extends Rt{constructor(t=new aa,e=new Ts({color:Math.random()*16777215})){super(t,e),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let t=this.geometry,e=t.attributes.instanceStart,i=t.attributes.instanceEnd,s=new Float32Array(2*e.count);for(let a=0,o=0,l=e.count;a<l;a++,o+=2)nm.fromBufferAttribute(e,a),sm.fromBufferAttribute(i,a),s[o]=o===0?0:s[o-1],s[o+1]=s[o]+nm.distanceTo(sm);let r=new ms(s,2,1);return t.setAttribute("instanceDistanceStart",new sn(r,1,0)),t.setAttribute("instanceDistanceEnd",new sn(r,1,1)),this}raycast(t,e){let i=this.material.worldUnits,s=t.camera;if(s===null&&!i&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.'),i===!1&&(this.material.resolution.x===0||this.material.resolution.y===0))return;let r=t.params.Line2!==void 0&&t.params.Line2.threshold||0;Rn=t.ray;let a=this.matrixWorld,o=this.geometry,l=this.material;hr=l.linewidth+r,o.boundingSphere===null&&o.computeBoundingSphere(),mh.copy(o.boundingSphere).applyMatrix4(a);let c;if(i)c=hr*.5;else{let h=Math.max(s.near,mh.distanceToPoint(Rn.origin));c=am(s,h,l.resolution)}if(mh.radius+=c,Rn.intersectsSphere(mh)===!1)return;o.boundingBox===null&&o.computeBoundingBox(),ph.copy(o.boundingBox).applyMatrix4(a);let u;if(i)u=hr*.5;else{let h=Math.max(s.near,ph.distanceToPoint(Rn.origin));u=am(s,h,l.resolution)}ph.expandByScalar(u),Rn.intersectsBox(ph)!==!1&&(i?$b(this,e):Yb(this,s,e))}onBeforeRender(t){let e=this.material.uniforms;e&&e.resolution&&(t.getViewport(Ru),this.material.uniforms.resolution.value.set(Ru.z,Ru.w))}};var oa=class extends aa{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(t){let e=t.length-3,i=new Float32Array(2*e);for(let s=0;s<e;s+=3)i[2*s]=t[s],i[2*s+1]=t[s+1],i[2*s+2]=t[s+2],i[2*s+3]=t[s+3],i[2*s+4]=t[s+4],i[2*s+5]=t[s+5];return super.setPositions(i),this}setColors(t){let e=t.length-3,i=new Float32Array(2*e);for(let s=0;s<e;s+=3)i[2*s]=t[s],i[2*s+1]=t[s+1],i[2*s+2]=t[s+2],i[2*s+3]=t[s+3],i[2*s+4]=t[s+4],i[2*s+5]=t[s+5];return super.setColors(i),this}setFromPoints(t){let e=t.length-1,i=new Float32Array(6*e);for(let s=0;s<e;s++)i[6*s]=t[s].x,i[6*s+1]=t[s].y,i[6*s+2]=t[s].z||0,i[6*s+3]=t[s+1].x,i[6*s+4]=t[s+1].y,i[6*s+5]=t[s+1].z||0;return super.setPositions(i),this}fromLine(t){let e=t.geometry;return this.setPositions(e.attributes.position.array),this}};var xh=class extends gh{constructor(t=new oa,e=new Ts({color:Math.random()*16777215})){super(t,e),this.isLine2=!0,this.type="Line2"}};var Iu=16,la=class{constructor(t,e="#e8f4ff"){let i=new oa;i.setPositions(new Float32Array((Iu+1)*3)),this.mat=new Ts({color:e,linewidth:1.6,transparent:!0,opacity:.9,depthWrite:!1}),this.line=new xh(i,this.mat),this.line.frustumCulled=!1,this.line.visible=!1,this.line.renderOrder=5,t.add(this.line),this.arr=i.attributes.instanceStart.data.array,this.buf=i.attributes.instanceStart.data}setColor(t){this.mat.color.set(t)}resize(t,e){this.mat.resolution.set(t,e)}hide(){this.line.visible=!1}set(t,e,i=.3,s=.02){let r=this.arr,a=t.x,o=t.y,l=t.z;for(let c=0;c<Iu;c++){let u=(c+1)/Iu,h=t.x+(e.x-t.x)*u,d=t.z+(e.z-t.z)*u,f=t.y+(e.y-t.y)*u-i*4*u*(1-u);u<1&&f<s&&(f=s);let p=c*6;r[p]=a,r[p+1]=o,r[p+2]=l,r[p+3]=h,r[p+4]=f,r[p+5]=d,a=h,o=f,l=d}this.buf.needsUpdate=!0,this.line.visible=!0}dispose(){this.line.parent&&this.line.parent.remove(this.line),this.line.geometry.dispose(),this.mat.dispose()}};var ke={X:0,Y:1,Z:2,YAW:3,PITCH:4,SPEED:5,FS:6,BX:7,BY:8,BZ:9,T:10,FLAGS:11,K:12,STEER:13,TALK:14},om={idle:0,charge:1,cast:2,wait:3,bite:4,fight:5,landed:6},lm=["hold","charge","cast","wait","wait","fight","landed"],Cn={sit:1,reel:2,dangle:4,lure:8},ca=[{shape:"tri",color:"#22d3ee"},{shape:"diamond",color:"#ffd60a"},{shape:"circle",color:"#a78bfa"},{shape:"square",color:"#f472b6"},{shape:"tri",color:"#4ade80"},{shape:"diamond",color:"#fb923c"},{shape:"circle",color:"#f8fafc"},{shape:"square",color:"#f87171"}];function vh(n,t=18){let e=ca[n%ca.length],i=e.shape==="tri"?'<path d="M12 3l9.5 17h-19z"/>':e.shape==="diamond"?'<path d="M12 2l10 10-10 10L2 12z"/>':e.shape==="circle"?'<circle cx="12" cy="12" r="9.5"/>':'<rect x="3" y="3" width="18" height="18" rx="3"/>';return`<svg class="mark" viewBox="0 0 24 24" width="${t}" height="${t}" fill="${e.color}">${i}</svg>`}var dr=new D,Bo=new D,pn=new D,Kb=.85,yh=class{constructor({scene:t,camera:e,vm:i,fx:s,schools:r,profile:a,hour:o,emit:l}){Object.assign(this,{scene:t,camera:e,vm:i,fx:s,schools:r,profile:a,hour:o,emit:l}),this.state="idle",this.kit=cr(a),this.line=new la(t),this.bob=null,this.bobId=null,this.fish=null,this.aim={ok:!1,x:0,z:0,dist:0,spot:null,clamped:!1,act:0},this.power=0,this.t=0,this.castK=0,this.target={x:0,z:0},this.bx=this.by=this.bz=0,this.dip=0,this.fight=null,this.catch=null,this.landT=0,this.reeling=!1,this.refreshGear()}refreshGear(){let t=this.profile;this.kit=cr(t);let e=Ss(t.equip.tackle),i=e?t.equip.tackle:t.equip.float;i!==this.bobId&&(this.bob&&this.scene.remove(this.bob),this.bob=e?Uo(i):No(i),e&&this.bob.scale.setScalar(.42),this.bob.visible=!1,this.scene.add(this.bob),this.bobId=i),this.lure=e,this.line.setColor((Qt[t.equip.line]||{}).col||"#e8f4ff"),this.vm.setRod(t.equip.rod,t.equip.reel,t.equip.line)}get busy(){return this.state!=="idle"}get lineOut(){return this.state!=="idle"&&this.state!=="charge"}updateAim(t){let e=this.aim,i=Math.cos(t.pitch);pn.set(-Math.sin(t.yaw)*i,Math.sin(t.pitch),-Math.cos(t.yaw)*i);let s=this.kit.cast,r;if(pn.y<-.03){let c=-this.camera.position.y/pn.y;r=Math.hypot(pn.x*c,pn.z*c)}else r=999;let a=pn.x/(Math.hypot(pn.x,pn.z)||1),o=pn.z/(Math.hypot(pn.x,pn.z)||1);e.clamped=r>s,r=ne(r,2.2,s);let l=null;for(let c=0;c<14&&!l;c++){let u=r+c*.6;if(u>s+.01)break;l=jc(t.x+a*u,t.z+o*u),l&&(r=u)}return e.ok=!!l,e.dist=r,e.x=t.x+a*r,e.z=t.z+o*r,e.spot=l,l&&(l.hot=this.schools.isHot(e.x,e.z),e.act=this.kit.sonar?z0(l,this.profile.equip.tackle,this.hour(),this.kit):0),e}startBite(){let t=k0(this.spot,this.profile.equip.tackle,this.hour(),this.kit,Math.random);this.biteLeft=t.t,this.nibbles=[];let e=t.t;for(let i=0;i<t.nibbles;i++)e-=.7+Math.random()*1.1,e>1&&this.nibbles.push(e)}toIdle(){this.state="idle",this.bob.visible=!1,this.line.hide(),this.fight=null,this.reeling=!1,this.fish&&(this.fish.parent&&this.fish.parent.remove(this.fish),this.fish=null)}reelIn(t){return this.state==="fight"||this.state==="landed"?!1:(this.state!=="idle"&&!t&&this.emit("reelin"),this.toIdle(),!0)}update(t,e,i,s){let r=this.profile;this.t+=t,this.reeling=!1;let a=this.state;if((a==="idle"||a==="charge")&&this.updateAim(s),a==="idle")i.hit("Primary")&&i.enabled&&(this.aim.ok?s.sit&&!s.dangle?this.emit("toast","\u0421\u0438\u0434\u044F \u043D\u0430 \u0437\u0435\u043C\u043B\u0435 \u043D\u0435 \u0437\u0430\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u2014 \u0432\u0441\u0442\u0430\u043D\u044C\u0442\u0435 \u0438\u043B\u0438 \u0441\u044F\u0434\u044C\u0442\u0435 \u043D\u0430 \u043A\u0440\u0430\u0439 \u043F\u0440\u0438\u0447\u0430\u043B\u0430"):(this.state="charge",this.power=0):this.emit("toast","\u041E\u0442\u0441\u044E\u0434\u0430 \u0434\u043E \u0432\u043E\u0434\u044B \u043D\u0435 \u0434\u043E\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u2014 \u043F\u043E\u0434\u043E\u0439\u0434\u0438\u0442\u0435 \u043A \u043A\u0440\u0430\u044E"));else if(a==="charge"){if(this.power=Math.min(1,this.power+t/Kb),!i.hold)if(!this.aim.ok)this.toIdle();else{let o=this.aim.dist/this.kit.cast,l=Math.max(2.2,Math.min(this.aim.dist,Math.max(this.power,.12)*this.kit.cast)),c=l/this.aim.dist;this.target.x=s.x+(this.aim.x-s.x)*c,this.target.z=s.z+(this.aim.z-s.z)*c;let u=jc(this.target.x,this.target.z);u||(this.target.x=this.aim.x,this.target.z=this.aim.z,u=this.aim.spot),u.hot=this.schools.isHot(this.target.x,this.target.z),this.spot=u,this.short=this.power<o-.04,this.state="cast",this.castK=0,this.castT=0,this.flyT=.45+l/46,this.castDist=l,r.stats.casts++,this.emit("cast",{x:this.target.x,z:this.target.z,d:l,fly:this.flyT})}}else if(a==="cast"){this.castT+=t,this.castK=Math.min(1,this.castT/.26);let o=ne((this.castT-.16)/this.flyT,0,1);if(this.vm.tipWorld(dr),this.castT>.16){this.bob.visible||(this.bob.visible=!0,this.from=dr.clone());let l=1.1+this.castDist*.11;this.bx=$i(this.from.x,this.target.x,o),this.bz=$i(this.from.z,this.target.z,o),this.by=$i(this.from.y,0,o)+Math.sin(Math.PI*o)*l,this.bob.position.set(this.bx,this.by,this.bz),this.bob.rotation.set(o*9,0,o*5),this.line.set(dr,this.bob.position,.35+Math.sin(Math.PI*o)*1.2,-5)}o>=1&&(this.state="wait",this.bob.rotation.set(0,0,0),this.dip=-.35,this.fx.splash(this.bx,this.bz,.45),this.startBite(),this.emit("land",{x:this.bx,z:this.bz,zone:this.spot.zone,hot:this.spot.hot,short:this.short}))}else if(a==="wait"||a==="bite"){let o=this.bx-s.x,l=this.bz-s.z,c=Math.hypot(o,l);if(i.hit("Secondary")||i.hit("KeyR")){this.reelIn();return}let u=!1;if(a==="wait"){if(this.lure&&i.hold){u=!0;let h=1.7*t;this.bx-=o/c*h,this.bz-=l/c*h;let d=jc(this.bx,this.bz);if(c<2.8||!d){this.emit("toast","\u041F\u0440\u0438\u043C\u0430\u043D\u043A\u0430 \u0443 \u043D\u043E\u0433 \u2014 \u0437\u0430\u0431\u0440\u0430\u0441\u044B\u0432\u0430\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430"),this.reelIn(!0);return}d.hot=this.schools.isHot(this.bx,this.bz),this.spot=d,Math.random()<t*5&&this.fx.ripple(this.bx,this.bz,.35,.7)}for((!this.lure||u)&&(this.biteLeft-=t);this.nibbles.length&&this.biteLeft<=this.nibbles[0];)this.nibbles.shift(),this.dip=-.09,this.fx.ripple(this.bx,this.bz,.45,.8),this.emit("nibble");i.hit("Primary")&&!this.lure&&this.t-(this.lastEarly||0)>.6&&(this.lastEarly=this.t,this.emit("early")),this.biteLeft<=0&&(this.state="bite",this.biteT=this.kit.hookWin*(this.lure?1.5:1),this.dip=-.42,this.fx.splash(this.bx,this.bz,.55),this.emit("bite",{win:this.biteT}))}else{if(this.biteT-=t,i.hit("Primary")){this.hook(c);return}if(this.biteT<=0){if(this.lure)this.emit("missed",{left:1});else{let h=ch(r);this.emit("missed",h),h.switched&&this.refreshGear()}this.state="wait",this.startBite()}}this.reeling=u,this.dip=_i(this.dip,a==="bite"?-.4+Math.sin(this.t*30)*.05:0,a==="bite"?20:5,t),this.by=_s(this.bx,this.bz,e)+this.dip+(this.lure?-.06:0),this.bob.position.set(this.bx,this.by,this.bz),this.bob.rotation.set(Math.sin(e*1.7+this.bx)*.12,this.lure?Math.atan2(o,l)+Math.PI/2:0,Math.cos(e*1.3)*.12+(a==="bite"?.5:0)),this.vm.tipWorld(dr),Bo.copy(this.bob.position),this.lure||(Bo.y+=.28),this.line.set(dr,Bo,u||a==="bite"?.08:Math.min(1.2,.25+c*.03))}else if(a==="fight"){let o=this.fight,l=G0(o,{reel:i.hold,steer:i.steer},t,this.kit,Math.random);this.reeling=i.hold;let c=2.4+(this.startDist-2.4)*(1-o.p);this.side=_i(this.side,o.phase==="run"?o.dir*Math.min(4,c*.4):Math.sin(this.t*.9)*.6,2.2,t);let u=s.x+this.hx*c+-this.hz*this.side,h=s.z+this.hz*c+this.hx*this.side,d=-.28;if(this.jumpT>0){this.jumpT-=t;let x=1-this.jumpT/.75;d=-.28+Math.sin(Math.PI*x)*(.75+this.fishLen*.35),this.fish.rotation.z=Math.cos(Math.PI*x)*.9,this.jumpT<=0&&this.fx.splash(u,h,.9)}else this.fish.rotation.z=_i(this.fish.rotation.z,0,6,t);let f=this.bx,p=this.bz;this.bx=u,this.bz=h,this.by=d+_s(u,h,e),this.fish.position.set(u,this.by,h),Math.hypot(u-f,h-p)>.002&&(this.fish.rotation.y+=wo(this.fish.rotation.y,Math.atan2(h-p,-(u-f)))*(1-Math.exp(-6*t))),zo(this.fish,this.t,o.phase==="run"?1.6:.9),this.wakeT-=t,this.wakeT<=0&&(this.wakeT=o.phase==="run"?.12:.4,this.fx.ripple(u,h,o.phase==="run"?.7:.4,.9));for(let x of l)if(x==="jump")this.jumpT=.75,this.fx.splash(u,h,1),this.emit("jump",{x:u,z:h});else if(x==="run")this.fx.splash(u,h,.6),this.emit("run",{dir:o.dir});else if(x==="warn")this.emit("warn");else if(x==="calm")this.emit("calm");else{if(x==="landed")return this.land();if(x==="snap"||x==="escape"){x==="snap"?r.stats.snaps++:r.stats.escapes++;let m=!1;if(x==="snap"&&this.lure){let g=ch(r);m=!0,g.switched&&(this.bobId=null)}this.fx.splash(u,h,.8),this.emit("lost",{why:x,sp:this.catch.sp,w:this.catch.w,lostLure:m}),this.toIdle(),this.refreshGear();return}}this.vm.tipWorld(dr),Bo.set(u,Math.max(this.by+.05,-.05),h),this.line.set(dr,Bo,o.T<ta?.5:.02,-5)}else if(a==="landed"){this.landT+=t;let o=Math.min(1,this.landT/.5);if(this.fish.rotation.y+=t*.9,this.fish.position.y=-.4*(1-o)*(1-o)+Math.sin(this.t*2)*.01,zo(this.fish,this.t,.5),this.landT>.4&&(i.hit("Primary")||i.hit("KeyE")))return this.finish(!1);if(this.landT>.4&&i.hit("KeyR"))return this.finish(!0);if(this.landT>9)return this.finish(!1)}}hook(t){let e=this.profile,i=O0(this.spot,e.equip.tackle,this.hour(),Math.random);if(!this.lure){let l=ch(e);l.switched&&(this.pendingGear=!0),this.emit("bait",l)}this.catch=i,this.fight=H0(i,this.kit,Math.random),this.state="fight",this.startDist=Math.max(3,t);let s=this.bx-this.camera.position.x,r=this.bz-this.camera.position.z,a=Math.hypot(s,r)||1;this.hx=s/a,this.hz=r/a,this.side=0,this.jumpT=0,this.wakeT=0,this.bob.visible=!1;let o=Ue[i.sp];this.fishLen=i.junk?.3:ne(i.len/100,.16,2.6),this.fish=i.junk?new he:ra(i.sp),this.fish.scale.setScalar(this.fishLen),this.fish.position.set(this.bx,-.3,this.bz),this.scene.add(this.fish),this.fx.splash(this.bx,this.bz,.8),this.emit("hook",{rho:this.fight.rho,rar:o?o.rar:0})}land(){let t=this.catch;this.state="landed",this.landT=0,this.line.hide(),this.fx.splash(this.bx,this.bz,.7),this.scene.remove(this.fish),t.junk&&(this.fish=this.junkModel(t.sp));let e=t.junk?.3:ne(.2+this.fishLen*.22,.24,.62);this.fish.scale.setScalar(e),this.fish.position.set(0,-.4,0),this.fish.rotation.set(0,0,0),this.vm.fishSlot.add(this.fish);let i=this.profile.cooler.length>=this.kit.bagCap;this.emit("caught",{c:t,full:i})}finish(t){if(this.state!=="landed")return;let e=this.profile,i=this.catch,s=t;s||$0(e,i,this.kit).ok||(s=!0);let r=Y0(e,i,s);this.emit("kept",{c:i,released:s,forced:s&&!t,...r}),this.toIdle(),this.pendingGear&&(this.pendingGear=!1,this.refreshGear())}junkModel(t){return this.makeJunk?this.makeJunk(t):new he}net(t){let e=this.state;return t.fs=om[e]??0,t.bx=this.bx,t.by=this.by,t.bz=this.bz,t.t=e==="fight"?this.fight.T:e==="charge"?this.power:0,t.k=e==="cast"?this.castK:e==="charge"?this.power:0,t.flags=(this.reeling?Cn.reel:0)|(this.lure?Cn.lure:0),t}view(){return{mode:this.state,power:this.power,castK:this.castK,tension:this.fight?this.fight.T:0,pull:this.fight&&this.fight.phase==="run"?this.fight.dir:0,reel:this.reeling}}};var cm=20,ha=220,_h=class{constructor(t){let e=new to(.84,1,40);e.rotateX(-Math.PI/2),this.rings=[];for(let s=0;s<cm;s++){let r=new Rt(e,new Wi({color:"#ffffff",transparent:!0,opacity:0,depthWrite:!1}));r.visible=!1,r.renderOrder=3,t.add(r),this.rings.push({m:r,t:0,life:0,size:1})}this.pos=new Float32Array(ha*3),this.vel=new Float32Array(ha*3),this.life=new Float32Array(ha);for(let s=0;s<ha;s++)this.pos[s*3+1]=-50;let i=new ve;i.setAttribute("position",new ni(this.pos,3)),this.points=new Ba(i,new Fr({color:"#eafcff",size:.085,sizeAttenuation:!0,transparent:!0,opacity:.92,depthWrite:!1})),this.points.frustumCulled=!1,this.points.renderOrder=4,t.add(this.points),this.next=0,this.nextRing=0,this.time=0}ripple(t,e,i=1,s=1.3,r=0){let a=this.rings[this.nextRing++%cm];a.m.position.set(t,.04,e),a.t=-r,a.life=s,a.size=i,a.m.visible=!0,a.m.material.opacity=0}splash(t,e,i=1){let s=Math.round(10+22*i),r=_s(t,e,this.time);for(let a=0;a<s;a++){let o=this.next++%ha,l=Math.random()*Math.PI*2,c=(.5+Math.random()*1.6)*(.6+i*.6);this.pos[o*3]=t+Math.cos(l)*.08,this.pos[o*3+1]=r+.05,this.pos[o*3+2]=e+Math.sin(l)*.08,this.vel[o*3]=Math.cos(l)*c,this.vel[o*3+1]=(1.8+Math.random()*2.6)*(.6+i*.5),this.vel[o*3+2]=Math.sin(l)*c,this.life[o]=1.2}this.ripple(t,e,.7+i*.9,1.1),this.ripple(t,e,1.1+i*1.5,1.6,.18)}update(t,e){this.time=e;for(let s of this.rings){if(!s.m.visible||(s.t+=t,s.t<0))continue;let r=s.t/s.life;if(r>=1){s.m.visible=!1;continue}let a=s.size*(.15+.85*Math.sqrt(r));s.m.scale.set(a,1,a),s.m.position.y=_s(s.m.position.x,s.m.position.z,e)+.035,s.m.material.opacity=.75*(1-r)*(1-r)}let i=!1;for(let s=0;s<ha;s++)this.life[s]<=0||(i=!0,this.life[s]-=t,this.vel[s*3+1]-=9.5*t,this.pos[s*3]+=this.vel[s*3]*t,this.pos[s*3+1]+=this.vel[s*3+1]*t,this.pos[s*3+2]+=this.vel[s*3+2]*t,(this.pos[s*3+1]<-.05||this.life[s]<=0)&&(this.life[s]=0,this.pos[s*3+1]=-50));(i||this.dirty)&&(this.points.geometry.attributes.position.needsUpdate=!0),this.dirty=i}};var hm=new D,dm=new D,Zb=.14,bh=class{constructor(t,e){this.scene=t,this.id=e.id,this.slot=e.slot,this.mode=e.mode,this.card=null,this.char=new Yn(e.card.look),this.char.group.visible=!1,t.add(this.char.group),this.line=new la(t),this.bob=null,this.fish=null,this.a=null,this.b=null,this.cur=null,this.emote=null,this.emoteT=0,this.say="",this.sayT=0,this.talk=0,this.wake=0,this.held=null,this.setCard(e.card),e.st&&this.push(e.st,performance.now()/1e3)}setCard(t){let e=this.card||{};if(this.card=t,JSON.stringify(e.look)!==JSON.stringify(t.look)&&this.char.setLook(t.look),(e.rod!==t.rod||e.line!==t.line||!this.char.rod)&&(this.char.setRod(ws(t.rod||"rod1","reel1",t.line||"line1",1)),this.line.setColor((Qt[t.line]||{}).col||"#e8f4ff")),e.fl!==t.fl||!this.bob){this.bob&&this.scene.remove(this.bob);let i=Ss(t.fl);this.bob=i?Uo(t.fl):No(t.fl||"float1"),i&&this.bob.scale.setScalar(.42),this.bob.visible=!1,this.scene.add(this.bob),this.lure=i}}push(t,e){this.a=this.b||{t:e-.08,s:t},this.b={t:e,s:t}}event(t,e,i){if(e=e||{},t==="land"&&i)i.splash(e.x,e.z,.45);else if(t==="bite"&&i)i.splash(e.x,e.z,.55);else if(t==="jump"&&i)i.splash(e.x,e.z,1);else if(t==="hook")this.dropFish(),Ue[e.sp]&&(this.fish=ra(e.sp),this.fishLen=ne((e.len||30)/100,.16,2.6),this.fish.scale.setScalar(this.fishLen),this.scene.add(this.fish));else if(t==="lost")this.dropFish();else if(t==="catch"){if(this.fish){this.scene.remove(this.fish);let s=ne(.2+this.fishLen*.3,.26,.8);this.fish.scale.setScalar(s),this.fish.position.set(0,-.3-s*.5,.05),this.fish.rotation.set(0,0,-Math.PI/2),this.char.j.eL.add(this.fish),this.held=this.fish,this.fish=null,this.heldT=6}}else t==="emote"&&(this.emote=e.k,this.emoteT=2.6)}dropFish(){this.fish&&(this.scene.remove(this.fish),this.fish=null)}bubble(t,e=5){this.say=t,this.sayT=e}update(t,e,i,s,r){let a=this.char.group;if(!this.b||!r){a.visible=!1,this.bob.visible=!1,this.line.hide(),this.fish&&(this.fish.visible=!1);return}let o=this.a.s,l=this.b.s,c=ne((e-Zb-this.a.t)/Math.max(.03,this.b.t-this.a.t),0,1.25),u=y=>$i(o[y]??0,l[y]??0,c),h=u(ke.X),d=u(ke.Y),f=u(ke.Z),p=o[ke.YAW]+wo(o[ke.YAW],l[ke.YAW])*Math.min(1,c);a.visible=!0,a.position.set(h,d,f),a.rotation.y=p+Math.PI;let x=l[ke.FS]|0,m=l[ke.FLAGS]|0;this.emoteT>0&&(this.emoteT-=t),this.sayT>0&&(this.sayT-=t),this.held&&(this.heldT-=t,this.held.rotation.x=Math.sin(i*9)*.25,(this.heldT<=0||x!==6&&x!==0)&&(this.held.parent&&this.held.parent.remove(this.held),this.held=null)),this.char.update(t,{speed:u(ke.SPEED),mode:this.held?"landed":lm[x]||"hold",castK:u(ke.K),reel:!!(m&Cn.reel),steer:l[ke.STEER]||0,sit:!!(m&Cn.sit),dangle:!!(m&Cn.dangle),emote:this.emoteT>0?this.emote:null,talk:this.talk,pitch:u(ke.PITCH)});let g=this.char.rod,_=l[ke.T]||0;g.setBend(x===5?.25+.75*_:x===4?.3:.04,0);let b=u(ke.BX),v=u(ke.BY),E=u(ke.BZ),T=x>=2&&x<=5;if(this.bob.visible=T&&x!==5,x===5&&this.fish){this.fish.visible=!0;let y=this.fish.position.x,M=this.fish.position.z;this.fish.position.set(b,v,E),Math.hypot(b-y,E-M)>.004&&(this.fish.rotation.y+=wo(this.fish.rotation.y,Math.atan2(E-M,-(b-y)))*Math.min(1,t*6)),this.fish.rotation.z=v>.15?.6:0,zo(this.fish,i,1.3),this.wake-=t,this.wake<=0&&s&&(this.wake=.3,s.ripple(b,E,.5,.9))}else this.fish&&(this.fish.visible=!1);if(T){g.tip.getWorldPosition(hm),this.bob.position.set(b,v,E),dm.set(b,v+(this.lure||x===5?.02:.28),E);let y=Math.hypot(b-h,E-f);this.line.set(hm,dm,x===2?.8:x===5||x===4?.04:Math.min(1.2,.25+y*.03),x===2||x===5?-5:.02),x===2?this.bob.rotation.set(i*9,0,i*5):this.bob.rotation.set(Math.sin(i*1.7+b)*.12,0,Math.cos(i*1.3)*.12+(x===4?.5:0))}else this.line.hide()}lobbyPose(t,e,i,s,r){let a=this.char.group;a.visible=!0,a.position.set(e,i,s),a.rotation.y=0,this.bob.visible=!1,this.line.hide(),this.fish&&(this.fish.visible=!1),this.emoteT>0&&(this.emoteT-=t),this.sayT>0&&(this.sayT-=t),this.char.rod.setBend(.04,0),this.char.update(t,{mode:"hold",variant:r,talk:this.talk,emote:this.emoteT>0?this.emote:null})}head(t){return t.set(this.char.group.position.x,this.char.group.position.y+1.98*this.char.look.height,this.char.group.position.z)}dispose(){this.scene.remove(this.char.group),this.char.dispose(),this.bob&&this.scene.remove(this.bob),this.dropFish(),this.line.dispose()}};var Mh=class{constructor(t){this.on=t,this.ws=null,this.room=null,this.offset=0,this.rtt=0,this.retry=0,this.want=null,this.closed=!0,this.pingT=null}now(){return Date.now()+this.offset}get open(){return this.ws&&this.ws.readyState===1}send(t){this.open&&this.ws.send(JSON.stringify(t))}sendBin(t){this.open&&this.ws.bufferedAmount<128*1024&&this.ws.send(t)}connect(){this.closed=!1;let t=`${location.protocol==="https:"?"wss":"ws"}://${location.host}/ws`,e;try{e=new WebSocket(t)}catch{this.on.error({code:"NET",message:"\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u0432\u044F\u0437\u0430\u0442\u044C\u0441\u044F \u0441 \u0441\u0435\u0440\u0432\u0435\u0440\u043E\u043C"});return}e.binaryType="arraybuffer",this.ws=e,e.onopen=()=>{this.ping(),clearInterval(this.pingT),this.pingT=setInterval(()=>this.ping(),5e3);let i=this.want;i&&this.send(i.t==="create"?{t:"create",card:this.getCard()}:{t:"join",code:i.code,token:i.token,card:this.getCard()})},e.onmessage=i=>{if(typeof i.data!="string")return this.on.bin(i.data);let s;try{s=JSON.parse(i.data)}catch{return}this.handle(s)},e.onclose=()=>{clearInterval(this.pingT),this.ws===e&&(this.ws=null,!this.closed&&(this.room&&(this.on.down(),this.want={t:"join",code:this.room.code,token:this.room.token}),this.want&&this.retry<40?(this.retry++,setTimeout(()=>!this.closed&&this.connect(),Math.min(4e3,600+this.retry*350))):this.want&&this.on.error({code:"NET",message:"\u0421\u0435\u0440\u0432\u0435\u0440 \u043D\u0435 \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0438\u043D\u0442\u0435\u0440\u043D\u0435\u0442 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437."})))},e.onerror=()=>{}}ping(){this.send({t:"ping",c:Date.now()})}handle(t){switch(t.t){case"pong":{let e=Date.now()-t.c,i=t.at-(t.c+e/2);this.offset=this.rtt?this.offset*.7+i*.3:i,this.rtt=e;return}case"joined":{let e=!!this.room&&this.room.code===t.code;return this.room={code:t.code,id:t.id,token:t.token,seed:t.seed,t0:t.t0,host:t.host,slot:t.slot},this.offset=this.rtt?this.offset:t.now-Date.now(),this.retry=0,this.want=null,na.set({code:t.code,token:t.token,at:Date.now()}),this.on.joined(t,e)}case"error":return(t.req==="join"||t.req==="create")&&(this.want=null,this.room=null,na.set(null)),this.on.error(t);case"replaced":return this.closed=!0,this.room=null,this.on.error({code:"REPLACED",message:"\u0418\u0433\u0440\u0430 \u043E\u0442\u043A\u0440\u044B\u0442\u0430 \u0432 \u0434\u0440\u0443\u0433\u043E\u0439 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \u2014 \u044D\u0442\u0430 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u0430."});case"left":return;case"vroster":case"vjoined":case"vsignal":case"vleft":return this.on.voice(t);default:this.on[t.t]&&this.on[t.t](t)}}create(){this.want={t:"create"},this.retry=0,this.open?this.send({t:"create",card:this.getCard()}):this.connect()}join(t,e){this.want={t:"join",code:t,token:e},this.retry=0,this.open?this.send({t:"join",code:t,token:e,card:this.getCard()}):this.connect()}leave(){this.send({t:"leave"}),this.room=null,this.want=null,this.closed=!0,na.set(null),this.ws&&this.ws.close()}};var Jb=[{urls:["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302"]}],Lu=.035,jb=.012,um=16e3,Qb=1e4,Du=()=>{try{return localStorage.getItem("rybak.voiceRelay")==="always"}catch{return!1}},tM=`
class RyCap extends AudioWorkletProcessor {
  constructor() { super(); this.size = Math.round(sampleRate * 0.04); this.buf = new Float32Array(this.size); this.n = 0; }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) for (let i = 0; i < ch.length; i++) { this.buf[this.n++] = ch[i]; if (this.n === this.size) { this.port.postMessage(this.buf.slice(0)); this.n = 0; } }
    return true;
  }
}
registerProcessor('ry-cap', RyCap);
class RyPlay extends AudioWorkletProcessor {
  constructor() {
    super(); this.q = new Float32Array(32000); this.r = 0; this.w = 0; this.len = 0; this.pos = 0; this.on = false; this.step = ${um} / sampleRate;
    this.port.onmessage = e => {
      const d = e.data, Q = this.q.length;
      for (let i = 0; i < d.length; i++) { this.q[this.w] = d[i]; this.w = (this.w + 1) % Q; if (this.len < Q) this.len++; else this.r = (this.r + 1) % Q; }
      if (this.len > 12000) { const drop = this.len - 4000; this.r = (this.r + drop) % Q; this.len -= drop; }
    };
  }
  process(_, outputs) {
    const out = outputs[0][0], Q = this.q.length;
    if (!this.on && this.len >= 2400) this.on = true;
    for (let i = 0; i < out.length; i++) {
      if (!this.on || this.len < 2) { out[i] = 0; this.on = false; continue; }
      const a = this.q[this.r], b = this.q[(this.r + 1) % Q];
      out[i] = a + (b - a) * this.pos;
      this.pos += this.step;
      while (this.pos >= 1) { this.pos -= 1; this.r = (this.r + 1) % Q; this.len--; }
    }
    for (let c = 1; c < outputs[0].length; c++) outputs[0][c].set(out);
    return true;
  }
}
registerProcessor('ry-play', RyPlay);`;function eM(n){let t=Math.max(-1,Math.min(1,n))*32767,e=t<0?128:0;e&&(t=-t),t=Math.min(32635,t+132);let i=7;for(let s=16384;(t&s)===0&&i>0;s>>=1)i--;return~(e|i<<4|t>>i+3&15)&255}var fm=new Float32Array(256);for(let n=0;n<256;n++){let t=~n&255,e=((t&15)<<3)+132<<((t&112)>>4);fm[n]=(t&128?132-e:e-132)/32768}function iM(n,t){let e=t/um,i=Math.floor(n.length/e),s=new Uint8Array(i);for(let r=0;r<i;r++){let a=Math.floor(r*e),o=Math.max(a+1,Math.min(n.length,Math.floor((r+1)*e))),l=0;for(let c=a;c<o;c++)l+=n[c];s[r]=eM(l/(o-a))}return s}function pm({send:n,sendBinary:t,onChange:e=()=>{},onError:i=()=>{},getVolume:s=()=>1,audioCtx:r}){let a={joined:!1,joining:!1,me:null,muted:!1,stream:null,peers:new Map,speaking:new Set,selfSpeaking:!1,roster:[]},o=null,l=null,c=null,u=Jb,h=null,d=new Set,f=null,p=null,x=0,m=()=>o||(o=r&&r()||new(window.AudioContext||window.webkitAudioContext)),g=(Y,H)=>n({t:"vsignal",to:Y,data:H});function _(Y){try{let H=m().createAnalyser();return H.fftSize=512,m().createMediaStreamSource(Y).connect(H),H}catch{return null}}let b=null,v=Y=>{if(!Y)return 0;let H=b&&b.length===Y.fftSize?b:b=new Float32Array(Y.fftSize);Y.getFloatTimeDomainData(H);let Z=0;for(let At of H)Z+=At*At;return Math.sqrt(Z/H.length)};function E(){let Y=!1,H=a.selfSpeaking;a.selfSpeaking=!a.muted&&v(l)>Lu,H!==a.selfSpeaking&&(Y=!0);let Z=performance.now();for(let[At,Pt]of a.peers){let $t=Pt.relay?Z-(Pt.heardAt||0)<300:v(Pt.analyser)>Lu;$t!==a.speaking.has(At)&&($t?a.speaking.add(At):a.speaking.delete(At),Y=!0),M(At)}Y&&e("speaking")}function T(Y){let H=a.peers.get(Y);if(H)return H;let Z=new RTCPeerConnection({iceServers:u});return H={pc:Z,audio:null,analyser:null,pending:[],relay:!1,state:"new"},a.peers.set(Y,H),H.waitTimer=setTimeout(()=>{(Du()||Z.connectionState!=="connected")&&P(Y)},Du()?300:Qb),a.stream&&a.stream.getTracks().forEach(At=>Z.addTrack(At,a.stream)),Z.onicecandidate=At=>{At.candidate&&g(Y,{candidate:At.candidate.toJSON()})},Z.ontrack=At=>{let Pt=At.streams[0]||new MediaStream([At.track]);H.audio||(H.audio=new Audio,H.audio.autoplay=!0,H.audio.setAttribute("playsinline",""),document.body.append(H.audio)),H.audio.srcObject=Pt,H.audio.muted=H.relay,M(Y),H.audio.play().catch(()=>{}),H.analyser=_(Pt)},Z.onconnectionstatechange=()=>{let At=Z.connectionState;H.relay||(H.state=At),At==="connected"&&!Du()&&clearTimeout(H.waitTimer),At==="failed"&&P(Y),At==="disconnected"&&(clearTimeout(H.waitTimer),H.waitTimer=setTimeout(()=>{Z.connectionState!=="connected"&&P(Y)},6e3)),e("state")},H}function y(Y){let H=a.peers.get(Y);if(H){clearTimeout(H.waitTimer);try{H.pc.close()}catch{}H.audio&&H.audio.remove();try{H.player&&H.player.disconnect(),H.gain&&H.gain.disconnect()}catch{}a.peers.delete(Y),a.speaking.delete(Y),d.delete(Y),d.size||N()}}function M(Y){let H=a.peers.get(Y);if(!H)return;let Z=Math.max(0,Math.min(1,s(Y)));H.audio&&Math.abs(H.audio.volume-Z)>.01&&(H.audio.volume=Z),H.gain&&(H.gain.gain.value=Z)}function U(){if(f)return f;let Y=m();if(!Y.audioWorklet)return f=Promise.resolve(!1);let H=URL.createObjectURL(new Blob([tM],{type:"application/javascript"}));return f=Y.audioWorklet.addModule(H).then(()=>!0,Z=>(console.warn("voice relay",Z),!1)),f}async function P(Y,H=!0){let Z=a.peers.get(Y);!Z||Z.relay||!a.joined||(Z.relay=!0,Z.state="relay",clearTimeout(Z.waitTimer),Z.audio&&(Z.audio.muted=!0),d.add(Y),H&&g(Y,{relay:!0}),await U()?C():(Z.state="failed",i("\u042D\u0442\u043E\u0442 \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u043D\u0435 \u0443\u043C\u0435\u0435\u0442 \u043F\u0435\u0440\u0435\u0434\u0430\u0432\u0430\u0442\u044C \u0433\u043E\u043B\u043E\u0441 \u0447\u0435\u0440\u0435\u0437 \u0441\u0435\u0440\u0432\u0435\u0440. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 Chrome, Edge, Firefox \u0438\u043B\u0438 Safari \u043F\u043E\u043D\u043E\u0432\u0435\u0435.")),e("state"))}function C(){if(!(p||!a.stream||!d.size))try{let Y=m(),H=Y.createMediaStreamSource(a.stream),Z=new AudioWorkletNode(Y,"ry-cap",{numberOfInputs:1,numberOfOutputs:1,channelCount:1,channelCountMode:"explicit"}),At=Y.createGain();At.gain.value=0,H.connect(Z),Z.connect(At),At.connect(Y.destination),Z.port.onmessage=Pt=>O(Pt.data,Y.sampleRate),p={src:H,node:Z,sink:At}}catch(Y){console.warn("voice relay capture",Y)}}function N(){if(p){try{p.src.disconnect(),p.node.disconnect(),p.sink.disconnect(),p.node.port.onmessage=null}catch{}p=null}}function O(Y,H){if(!d.size||!a.joined||a.muted)return;let Z=0;for(let ct=0;ct<Y.length;ct+=4)Z+=Y[ct]*Y[ct];let At=performance.now();if(Math.sqrt(Z/(Y.length/4))>jb&&(x=At),At-x>500)return;let Pt=iM(Y,H),$t=[...d],Jt=new Uint8Array(2+$t.length*2+Pt.length),et=new DataView(Jt.buffer);Jt[0]=1,Jt[1]=$t.length,$t.forEach((ct,ft)=>et.setUint16(2+ft*2,ct)),Jt.set(Pt,2+$t.length*2),t(Jt.buffer)}async function L(Y,H){let Z=a.peers.get(Y);if(!Z||!a.joined||(Z.relay||P(Y,!1),!await U()))return;let At=m();if(!Z.player)try{Z.player=new AudioWorkletNode(At,"ry-play",{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[1]}),Z.gain=At.createGain(),Z.player.connect(Z.gain),Z.gain.connect(At.destination),M(Y)}catch(et){console.warn("voice relay player",et);return}At.state!=="running"&&At.resume&&At.resume().catch(()=>{});let Pt=new Float32Array(H.length),$t=0;for(let et=0;et<H.length;et++){let ct=fm[H[et]];Pt[et]=ct,$t+=ct*ct}let Jt=Math.sqrt($t/Math.max(1,H.length));Z.rlvl=Jt,Z.rAt=performance.now(),Jt>Lu&&(Z.heardAt=Z.rAt),Z.player.port.postMessage(Pt,[Pt.buffer])}async function k(Y,H){if(!a.joined)return;let Z=T(Y);try{if(H.relay){P(Y,!1);return}if(H.sdp){await Z.pc.setRemoteDescription(H.sdp);for(let At of Z.pending.splice(0))await Z.pc.addIceCandidate(At).catch(()=>{});if(H.sdp.type==="offer"){let At=await Z.pc.createAnswer();await Z.pc.setLocalDescription(At),g(Y,{sdp:Z.pc.localDescription.toJSON()})}}else H.candidate&&(Z.pc.remoteDescription?await Z.pc.addIceCandidate(H.candidate).catch(()=>{}):Z.pending.push(H.candidate))}catch(At){console.warn("voice signal",At)}}function G(Y){switch(Y.t){case"vjoined":return h&&h.resolve(Y),!0;case"vsignal":return k(Y.from,Y.data||{}),!0;case"vleft":return y(Y.vid),e("peers"),!0;case"vroster":return wt(Y.list),!0;default:return!1}}function V(Y){h&&h.reject(new Error(Y))}function at(Y){let H=new Uint8Array(Y);H.length<4||H[0]!==1||L(H[1]<<8|H[2],H.subarray(3))}async function $(Y=null){if(a.joined||a.joining)return{ok:!0};a.joining=!0,e("state");try{if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error("\u0411\u0440\u0430\u0443\u0437\u0435\u0440 \u043D\u0435 \u0434\u0430\u0451\u0442 \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D\u0443. \u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0438\u0433\u0440\u0443 \u043F\u043E https \u0438 \u0432 \u043E\u0431\u044B\u0447\u043D\u043E\u043C \u043E\u043A\u043D\u0435 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430.");a.stream=Y||await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0}}),m().resume&&m().resume(),l=_(a.stream);let H=await new Promise((Z,At)=>{h={resolve:Z,reject:At},n({t:"vjoin",muted:a.muted}),setTimeout(()=>At(new Error("\u0421\u0435\u0440\u0432\u0435\u0440 \u043D\u0435 \u043E\u0442\u0432\u0435\u0442\u0438\u043B. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.")),8e3)}).finally(()=>h=null);Array.isArray(H.ice)&&H.ice.length&&(u=H.ice),a.joined=!0,a.me=H.me,U(),a.stream.getAudioTracks().forEach(Z=>Z.enabled=!a.muted);for(let Z of H.peers){let At=T(Z),Pt=await At.pc.createOffer();await At.pc.setLocalDescription(Pt),g(Z,{sdp:At.pc.localDescription.toJSON()})}return c||(c=setInterval(E,120)),{ok:!0}}catch(H){Y||nt();let Z=H&&H.name==="NotAllowedError"?"\u0411\u0435\u0437 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u044F \u043D\u0430 \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D \u0433\u043E\u043B\u043E\u0441\u043E\u0432\u043E\u0439 \u0447\u0430\u0442 \u043D\u0435 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0441\u044F. \u0420\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435 \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430 \u0434\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u0441\u0430\u0439\u0442\u0430.":H&&H.name==="NotFoundError"?"\u041C\u0438\u043A\u0440\u043E\u0444\u043E\u043D \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D. \u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0435\u0433\u043E \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430.":H&&H.message||"\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0433\u043E\u043B\u043E\u0441\u043E\u0432\u043E\u0439 \u0447\u0430\u0442";return i(Z),{ok:!1,error:Z}}finally{a.joining=!1,e("state")}}function nt(){N(),a.stream&&a.stream.getTracks().forEach(Y=>Y.stop()),a.stream=null,l=null}function rt(){for(let Y of[...a.peers.keys()])y(Y);d.clear(),N(),nt(),clearInterval(c),c=null,a.joined=!1,a.me=null,a.selfSpeaking=!1}function Dt(Y){a.joined&&(Y||n({t:"vleave"}),rt(),e("left"))}function Gt(Y){a.muted=!!Y,a.stream&&a.stream.getAudioTracks().forEach(H=>H.enabled=!a.muted),a.joined&&n({t:"vmute",muted:a.muted}),e("mute")}function j(){if(!a.joined)return;let Y=a.stream;for(let H of[...a.peers.keys()])y(H);d.clear(),N(),a.joined=!1,$(Y)}function wt(Y){if(a.roster=Y||[],a.joined){let H=new Set(a.roster.map(Z=>Z.vid));for(let Z of[...a.peers.keys()])H.has(Z)||y(Z)}e("roster")}function Nt(Y){let H=0;if(Y===a.me)H=a.muted?0:v(l);else{let Z=a.peers.get(Y);if(!Z)return 0;H=Z.relay?performance.now()-(Z.rAt||0)<220&&Z.rlvl||0:v(Z.analyser)}return Math.max(0,Math.min(1,(H-.012)/.14))}return{state:a,level:Nt,join:$,leave:Dt,setMuted:Gt,handle:G,handleBinary:at,reconnected:j,applyVolume:M,joinError:V,isSpeaking:Y=>Y===a.me?a.selfSpeaking:a.speaking.has(Y),viaRelay:Y=>!!(a.peers.get(Y)&&a.peers.get(Y).relay),vidOf:Y=>{let H=a.roster.find(Z=>Z.pid===Y);return H?H.vid:null},pidOf:Y=>{let H=a.roster.find(Z=>Z.vid===Y);return H?H.pid:null}}}var Sh=class{constructor(){this.ctx=null,this.night=0,this.tension=null}start(){if(this.ctx){this.ctx.state!=="running"&&this.ctx.resume().catch(()=>{});return}let t=window.AudioContext||window.webkitAudioContext;if(!t)return;let e=this.ctx=new t;this.master=e.createGain(),this.master.connect(e.destination),this.sfx=e.createGain(),this.sfx.connect(this.master),this.amb=e.createGain(),this.amb.connect(this.master);let i=e.sampleRate*2;this.noise=e.createBuffer(1,i,e.sampleRate);let s=this.noise.getChannelData(0);for(let r=0;r<i;r++)s[r]=Math.random()*2-1;this.applyVolume(),this.startAmbient()}applyVolume(){this.ctx&&(this.master.gain.value=Fe.master,this.sfx.gain.value=Fe.sfx,this.amb.gain.value=Fe.amb)}src(t=!1){let e=this.ctx.createBufferSource();return e.buffer=this.noise,e.loop=t,e}startAmbient(){let t=this.ctx,e=(s,r,a,o,l,c)=>{let u=this.src(!0),h=t.createBiquadFilter();h.type=s,h.frequency.value=r,h.Q.value=a;let d=t.createGain();d.gain.value=o;let f=t.createOscillator();f.frequency.value=l;let p=t.createGain();return p.gain.value=c,f.connect(p),p.connect(d.gain),u.connect(h),h.connect(d),d.connect(this.amb),u.start(),f.start(),d};e("lowpass",420,.5,.2,.09,.09),e("bandpass",1300,.7,.045,.23,.035),e("bandpass",260,.4,.05,.05,.03),this.cricketG=t.createGain(),this.cricketG.gain.value=0,this.cricketG.connect(this.amb);let i=()=>{if(!this.ctx)return;let s=t.currentTime;this.night<.5&&Math.random()<.5&&this.gull(s),this.night>.4&&this.cricket(s),setTimeout(i,this.night>.4?700+Math.random()*900:3500+Math.random()*7e3)};setTimeout(i,2500)}gull(t){let e=this.ctx,i=2+Math.floor(Math.random()*3),s=e.createStereoPanner?e.createStereoPanner():null;s&&(s.pan.value=Math.random()*1.6-.8,s.connect(this.amb));for(let r=0;r<i;r++){let a=e.createOscillator(),o=e.createGain(),l=t+r*.32;a.type="sawtooth",a.frequency.setValueAtTime(1500,l),a.frequency.exponentialRampToValueAtTime(2100,l+.07),a.frequency.exponentialRampToValueAtTime(1250,l+.26);let c=e.createBiquadFilter();c.type="bandpass",c.frequency.value=2e3,c.Q.value=3,o.gain.setValueAtTime(1e-4,l),o.gain.exponentialRampToValueAtTime(.03,l+.04),o.gain.exponentialRampToValueAtTime(1e-4,l+.27),a.connect(c),c.connect(o),o.connect(s||this.amb),a.start(l),a.stop(l+.3)}}cricket(t){let e=this.ctx;for(let i=0;i<4;i++){let s=e.createOscillator(),r=e.createGain(),a=t+i*.055;s.frequency.value=4300+Math.random()*300,r.gain.setValueAtTime(1e-4,a),r.gain.exponentialRampToValueAtTime(.012*this.night,a+.008),r.gain.exponentialRampToValueAtTime(1e-4,a+.04),s.connect(r),r.connect(this.amb),s.start(a),s.stop(a+.05)}}tone(t,e,i="sine",s=.2,r=null,a=0){if(!this.ctx)return;let o=this.ctx,l=o.currentTime+a,c=o.createOscillator(),u=o.createGain();c.type=i,c.frequency.setValueAtTime(t,l),r&&c.frequency.exponentialRampToValueAtTime(r,l+e),u.gain.setValueAtTime(1e-4,l),u.gain.exponentialRampToValueAtTime(s,l+.008),u.gain.exponentialRampToValueAtTime(1e-4,l+e),c.connect(u),u.connect(this.sfx),c.start(l),c.stop(l+e+.02)}burst(t,e,i,s,r=.3,a=1,o=0){if(!this.ctx)return;let l=this.ctx,c=l.currentTime+o,u=this.src(),h=l.createBiquadFilter();h.type=e,h.Q.value=a,h.frequency.setValueAtTime(i,c),h.frequency.exponentialRampToValueAtTime(s,c+t);let d=l.createGain();d.gain.setValueAtTime(1e-4,c),d.gain.exponentialRampToValueAtTime(r,c+.01),d.gain.exponentialRampToValueAtTime(1e-4,c+t),u.connect(h),h.connect(d),d.connect(this.sfx),u.start(c,Math.random()),u.stop(c+t+.02)}ui(){this.tone(720,.05,"triangle",.07)}cast(){this.burst(.3,"bandpass",500,2800,.22,1.2),this.reelTicks(6,.03)}reelTicks(t,e){for(let i=0;i<t;i++)this.burst(.012,"highpass",3200,3200,.1,1,i*e)}tick(){this.burst(.012,"highpass",3e3,3e3,.09)}splash(t=1,e=1){this.burst(.35+t*.25,"bandpass",2200,500,.28*t*e,.8),this.tone(150,.16,"sine",.2*t*e,60)}nibble(){this.tone(640,.05,"sine",.09,420)}bite(){this.tone(880,.28,"sine",.26),this.tone(1320,.35,"sine",.2,null,.08),this.splash(.5)}hook(){this.burst(.14,"bandpass",900,2600,.22,2),this.tone(330,.12,"triangle",.16,660)}warn(){this.tone(520,.09,"square",.07),this.tone(520,.09,"square",.07,null,.13)}snap(){this.tone(1100,.16,"sawtooth",.22,160),this.burst(.12,"highpass",2e3,800,.2),this.tone(180,.3,"sine",.2,70,.05)}fail(){this.tone(330,.18,"triangle",.16,220),this.tone(220,.3,"triangle",.14,150,.16)}catch(t=0){let e=[523,659,784,1047,1319,1568,2093],i=3+Math.min(4,t);for(let s=0;s<i;s++)this.tone(e[s],.22+(s===i-1?.3:0),"triangle",.16,null,s*.085);if(t>=3)for(let s=0;s<6;s++)this.tone(2e3+Math.random()*2e3,.12,"sine",.05,null,.5+s*.07)}coin(t=1){for(let e=0;e<Math.min(5,t);e++)this.tone(1319,.07,"square",.06,null,e*.07),this.tone(1760,.16,"square",.06,null,e*.07+.05)}buy(){this.tone(660,.08,"triangle",.14),this.tone(990,.2,"triangle",.14,null,.08),this.burst(.06,"highpass",4e3,4e3,.1,1,.02)}level(){[523,659,784,1047,784,1047,1319].forEach((t,e)=>this.tone(t,.2,"triangle",.15,null,e*.09))}error(){this.tone(170,.14,"sawtooth",.08)}step(t,e){this.ctx&&(t?(this.burst(.07,"lowpass",300,140,e?.5:.28,1.5),this.burst(.02,"bandpass",1500,900,.05,2)):this.burst(.09,"bandpass",900,500,e?.16:.09,.7))}strain(t){if(!this.ctx)return;let e=this.ctx;if(t<0){if(this.tension){this.tension.g.gain.setTargetAtTime(0,e.currentTime,.05);let s=this.tension.o;setTimeout(()=>s.stop(),300),this.tension=null}return}if(!this.tension){let s=e.createOscillator();s.type="sawtooth";let r=e.createBiquadFilter();r.type="bandpass",r.Q.value=6;let a=e.createGain();a.gain.value=0,s.connect(r),r.connect(a),a.connect(this.sfx),s.start(),this.tension={o:s,f:r,g:a}}let i=Math.max(0,(t-.55)/.45);this.tension.o.frequency.setTargetAtTime(70+t*150,e.currentTime,.05),this.tension.f.frequency.setTargetAtTime(500+t*1600,e.currentTime,.05),this.tension.g.gain.setTargetAtTime(i*i*.11,e.currentTime,.05)}};var Nu=256,Qn=null,ur=null,As=new Vn(-.6,.6,.6,-.6,.01,20),da=new ii(26,1,.02,20),mn=new Map,Uu=new oi,Ho=new D,Fu=new D;function Ou(){if(Qn)return;let n=document.createElement("canvas");n.width=n.height=Nu,Qn=new $r({canvas:n,alpha:!0,antialias:!0,preserveDrawingBuffer:!0}),Qn.setPixelRatio(1),Qn.setSize(Nu,Nu,!1),Qn.outputColorSpace=Oe,Qn.toneMapping=Ws,Qn.setClearColor(0,0),ur=new Fs,ur.add(new Bs("#ffffff","#8aa0c0",1.5));let t=new ps("#fff4e0",2.6);t.position.set(-1.2,2,2.4),ur.add(t);let e=new ps("#9fdcff",1.2);e.position.set(2,1,-2),ur.add(e)}function wh(n,t){return ur.add(n),Qn.render(ur,t),ur.remove(n),Qn.domElement.toDataURL("image/png")}function mm(n,t=1.12){Uu.setFromObject(n),Uu.getCenter(Ho),Uu.getSize(Fu);let e=Math.max(Fu.x,Fu.y)/2*t||.5;return As.left=-e,As.right=e,As.top=e,As.bottom=-e,As.position.set(Ho.x,Ho.y,Ho.z+6),As.lookAt(Ho),As.updateProjectionMatrix(),As}function Pn(n){let t="i:"+n;if(mn.has(t))return mn.get(t);Ou();let e=rh(n),i;return e.userData.rod?(e.children[0].rotation.y=1,e.rotation.set(-.62,0,-.95),e.position.set(-.2,-.16,0),da.position.set(0,0,.92),da.lookAt(0,0,0),i=wh(e,da)):i=wh(e,mm(e)),mn.set(t,i),i}function Go(n){let t="f:"+n;if(mn.has(t))return mn.get(t);Ou();let e=ra(n);e.rotation.set(.12,.42,0);let i=wh(e,mm(e,1.08));return mn.set(t,i),i}function gm(n){let t="p:"+JSON.stringify(n);if(mn.has(t))return mn.get(t);Ou();let e=new Yn(n);e.update(.016,{mode:"idle",snap:!0}),e.group.rotation.y=-.22;let i=(.84+.505+.18)*e.look.height;da.position.set(0,i+.04,1.42),da.lookAt(0,i+.035,0);let s=wh(e.group,da);return e.dispose(),mn.size>400&&mn.clear(),mn.set(t,s),s}var ku={pin:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2z"/></svg>',sun:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',moon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>',users:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="8" r="3.6"/><circle cx="16.8" cy="8.6" r="3"/><path d="M1.5 20c0-4 2.9-6.4 6.5-6.4s6.5 2.4 6.5 6.4zM15.6 20c0-2-.6-3.8-1.7-5.1a6 6 0 0 1 2.9-.7c3.1 0 5.7 2 5.7 5.8z"/></svg>',lock:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 9V7A5 5 0 0 0 7 7v2H5v12h14V9zm-8-2a3 3 0 0 1 6 0v2H9zm3 9.5a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2z"/></svg>',coin:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><circle cx="12" cy="12" r="7" fill="none" stroke="#0a1a33" stroke-opacity=".35" stroke-width="1.6"/><path d="M9 16l3-8 3 8M10 13.4h4" stroke="#0a1a33" stroke-opacity=".6" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',bag:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 12c4-6 11-7 16-3l3-2-1 5 1 5-3-2c-5 4-12 3-16-3zm5.5-1.4a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/></svg>',mic:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',micoff:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M3 3l18 18" stroke="#f04438" stroke-width="2.6" stroke-linecap="round"/></svg>',warn:'<svg viewBox="0 0 24 24"><path d="M12 2L1 21h22z" fill="currentColor"/><path d="M12 9v6M12 17.5v1" stroke="#0a1a33" stroke-width="2.4" stroke-linecap="round"/></svg>',check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 6.5"/></svg>',crown:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 8l5 4 5-7 5 7 5-4-2 11H4z"/></svg>',link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',rod:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 21L20 4M20 4v9"/><circle cx="8" cy="16" r="2.4" fill="currentColor"/></svg>'},Si=(n,t="")=>`<span class="ic ${t}">${ku[n]||""}</span>`,Rs=n=>`${Si("coin")}${En(n)}`,nM={dawn:"sun",day:"sun",dusk:"sun",night:"moon"},Eh=class{constructor(t){this.g=t,this.panel=null,this.screen=Mt("#screen"),this.hud=Mt("#hud");for(let e of ou("[data-ic]"))e.innerHTML=ku[e.dataset.ic]||"";this.cmp=Mt("#compass").getContext("2d"),this.map=Mt("#minimap").getContext("2d"),this.mapBase=null,this.tags=new Map,this.plates=new Map,this.hintKey="",this.lastClock="",this.screen.addEventListener("click",e=>this.onClick(e)),this.screen.addEventListener("input",e=>this.onInput(e)),Mt("#voiceChip").addEventListener("click",()=>t.toggleVoice()),Mt("#chat").addEventListener("submit",e=>{e.preventDefault();let i=Mt("#chatIn").value.trim();i&&t.sendChat(i),this.chat(!1)})}key(t){let e=this.g.input.device==="pad",i={primary:e?["RT",""]:["\u041B\u041A\u041C",""],back:e?["B","b"]:["\u041F\u041A\u041C","x"],use:e?["A",""]:["E",""],tackle:e?["X","x"]:["TAB","x"],release:e?["B","b"]:["R","b"],esc:e?["B","b"]:["ESC","b"],left:e?["LS","g"]:["A","g"],right:e?["LS","g"]:["D","g"]}[t]||[t,"g"];return`<kbd class="${i[1]}">${i[0]}</kbd>`}hudShow(t){this.hud.classList.toggle("hidden",!t),t||this.clearTags()}refreshHud(){let t=this.g.profile,e=cr(t),i=Jn(t.xp);Mt("#coins").textContent=En(t.coins),Mt("#lvl").textContent=i.lvl,Mt("#bagN").textContent=`${t.cooler.length} / ${e.bagCap}`,Mt("#bagN").classList.toggle("y",t.cooler.length<e.bagCap),Mt("#bagN").style.color=t.cooler.length>=e.bagCap?"#f04438":"";let s=Qt[t.equip.rod]||ar[0];Mt("#rodName").textContent=s.name,Mt("#rodIcon").src=Pn(s.id);let r=t.equip.tackle,a=jn(t,r);Mt("#hotbar").innerHTML=`<div class="slot sel" data-k="rod"><img src="${Pn(s.id)}" alt=""></div>
      <div class="slot" data-k="bait"><img src="${Pn(r)}" alt=""><b>${a===1/0?"\u221E":a}</b><kbd class="x">Q</kbd></div>
      <div class="slot" data-k="float"><img src="${Pn(Ss(r)?r:t.equip.float)}" alt=""></div>`}setCrew(t){let e=JSON.stringify(t.map(i=>[i.id,i.name,i.slot,i.look,i.voice,i.muted,i.mode]));e!==this.crewKey&&(this.crewKey=e,Mt("#crew").innerHTML=t.filter(i=>!i.me).map(i=>`<div class="crow" data-id="${i.id}"><div class="ava" style="border-color:${ca[i.slot%8].color}"><img src="${gm(i.look)}" alt=""></div><b>${se(i.name)}</b>${i.mode==="lobby"?'<span class="st">\u0432 \u043B\u043E\u0431\u0431\u0438</span>':""}${Si(i.voice&&!i.muted?"mic":"micoff",i.voice&&!i.muted?"mic":"off")}${vh(i.slot,20)}</div>`).join(""),Mt("#onlineN").textContent=this.g.solo?"\u041E\u0414\u0418\u041D\u041E\u0427\u041D\u0410\u042F \u0420\u042B\u0411\u0410\u041B\u041A\u0410":`${t.length} / ${Mu} \u0412 \u0421\u0415\u0422\u0418`);for(let i of t){let s=Mt(`.crow[data-id="${i.id}"]`);s&&s.classList.toggle("talk",!!i.talk)}}setHints(t){t!==this.hintKey&&(this.hintKey=t,Mt("#hints").innerHTML=Fe.hints?t:"")}toast(t,e="",i=2600){let s=Eo("div","toast "+e,t),r=Mt("#toasts");for(r.append(s);r.children.length>3;)r.firstChild.remove();setTimeout(()=>s.classList.add("out"),i),setTimeout(()=>s.remove(),i+450)}feed(t,e=""){let i=Eo("div",e,t),s=Mt("#feed");for(s.append(i);s.children.length>5;)s.firstChild.remove();setTimeout(()=>i.classList.add("out"),9e3),setTimeout(()=>i.remove(),9700)}banner(t,e="",i=0){let s=Mt("#banner");if(clearTimeout(this.bannerT),!t)return s.classList.add("hidden");s.className=e,s.textContent=t,i&&(this.bannerT=setTimeout(()=>s.classList.add("hidden"),i))}alert(t,e=""){let i=Mt("#alert");i.classList.toggle("hidden",!t),t&&(i.innerHTML=`${se(t)}${e?`<small>${e}</small>`:""}`)}prompt(t){let e=Mt("#prompt");t!==this.promptKey&&(this.promptKey=t,e.classList.toggle("hidden",!t),e.innerHTML=t?`<div class="chip">${t}</div>`:"")}chat(t){Mt("#chat").classList.toggle("hidden",!t),t?(Mt("#chatIn").value="",Mt("#chatIn").focus()):Mt("#chatIn").blur(),this.chatOpen=t}catchCard(t){let e=Mt("#catch");if(!t)return e.classList.add("hidden");let i=t.c,s=Ue[i.sp],r=Zn[i.sp],a=s?Sn[s.rar]:{name:"\u041D\u0430\u0445\u043E\u0434\u043A\u0430",color:"#cbd5e1"},o=Fo(i,this.g.market()),l=[],c=this.g.profile.journal[i.sp];s&&(!c||c.n===0)?l.push('<span class="bd cy">\u041D\u041E\u0412\u042B\u0419 \u0412\u0418\u0414!</span>'):s&&c&&i.w>c.best&&l.push('<span class="bd gr">\u041B\u0418\u0427\u041D\u042B\u0419 \u0420\u0415\u041A\u041E\u0420\u0414!</span>'),i.trophy&&l.push('<span class="bd">\u0422\u0420\u041E\u0424\u0415\u0419</span>'),s&&this.g.market().hot.includes(i.sp)&&l.push('<span class="bd">\u0412 \u0426\u0415\u041D\u0415 \xD71,6</span>'),e.style.setProperty("--rc",a.color),e.innerHTML=`<div class="rar">${a.name}</div><h2>${se((s||r).name)}</h2>
      <div class="w">${un(i.w)}${i.len?`<small>${i.len} \u0441\u043C</small>`:""}</div>
      <div class="badges">${l.join("")}</div>
      <p>${se((s||r).desc)}</p>
      <div class="val">${Rs(o)} <span style="font-size:.6em;opacity:.7;margin-left:.4em">\u041D\u0410 \u0420\u042B\u041D\u041A\u0415</span></div>
      <div class="acts">${t.full?`<span class="bd red" style="font-size:1em">\u0421\u0410\u0414\u041E\u041A \u041F\u041E\u041B\u041E\u041D</span><span>${this.key("primary")} \u041E\u0422\u041F\u0423\u0421\u0422\u0418\u0422\u042C</span>`:`<span>${this.key("primary")} \u0412 \u0421\u0410\u0414\u041E\u041A</span><span>${this.key("release")} \u041E\u0422\u041F\u0423\u0421\u0422\u0418\u0422\u042C</span>`}</div>`,e.classList.remove("hidden")}fight(t,e){if(Mt("#fight").classList.toggle("hidden",!t),!t)return;Mt("#tptr").style.left=ne(t.T,0,1)*100+"%",Mt("#pfill").style.width=t.p*100+"%",Mt("#ppct").textContent=Math.round(t.p*100)+"%";let s=Mt("#fstate"),r=t.phase==="run",a="\u0420\u041E\u0412\u041D\u041E",o="";t.T>Es?(a="\u041E\u041F\u0410\u0421\u041D\u041E!",o="bad"):t.T<ta?(a="\u0421\u041B\u0410\u0411\u0418\u041D\u0410!",o="warn"):r?(a="\u0420\u042B\u0412\u041E\u041A!",o="warn"):t.warned&&(a="\u0413\u041E\u0422\u041E\u0412\u0418\u0422\u0421\u042F\u2026",o="warn"),s.textContent!==a&&(s.textContent=a),s.className=o,Mt(".fpanel").classList.toggle("shake",t.T>Es);let l=r?-t.dir:0,c=Mt("#steer .l"),u=Mt("#steer .r");c.className="st l"+(l<0?e<0?" hit":" on":""),u.className="st r"+(l>0?e>0?" hit":" on":"")}power(t,e){Mt("#power").classList.toggle("hidden",t==null),t!=null&&(Mt("#pwfill").style.width=t*100+"%",Mt("#pwneed").style.left=ne(e,0,1)*100+"%")}castMark(t){let e=Mt("#castMark");if(e.classList.toggle("hidden",!t),!t)return;e.style.transform=`translate(${t.x}px,${t.y}px) translate(-50%,-2.6em)`,e.classList.toggle("bad",!t.ok),e.classList.toggle("hot",!!t.hot);let i=t.ok?t.hot?"\u041A\u041E\u0421\u042F\u041A \u0420\u042B\u0411\u042B!":t.clamped?"\u0414\u0410\u041B\u042C\u0428\u0415 \u041D\u0415 \u0414\u041E\u0411\u0420\u041E\u0421\u0418\u0422\u042C":"\u0417\u0410\u0411\u0420\u041E\u0421 \u0421\u042E\u0414\u0410":"\u0422\u0423\u0422 \u041D\u0415 \u0412\u041E\u0414\u0410",s=e.querySelector(".lbl");s.textContent!==i&&(s.textContent=i);let r=t.ok?`${t.zone} \xB7 ${t.dist.toFixed(0)} \u043C \u043E\u0442 \u0432\u0430\u0441 \xB7 \u0434\u043D\u043E ${t.depth.toFixed(1).replace(".",",")} \u043C${t.act?` \xB7 \u043A\u043B\u0451\u0432 ${"\u25CF".repeat(Math.max(1,Math.round(t.act*5)))}`:""}`:"",a=e.querySelector(".sub");a.textContent!==r&&(a.textContent=r)}clock(t){let e=R0(t);if(e===this.lastClock)return;this.lastClock=e,Mt("#clock").textContent=e;let i=Qr(t);i!==this.lastPart&&(this.lastPart=i,Mt("#clockIc").innerHTML=ku[nM[i]])}compass(t){let e=this.cmp,i=760,s=64,r=(-t*180/Math.PI%360+360)%360;if(Math.abs(r-(this.lastHead??-99))<.15)return;this.lastHead=r,e.clearRect(0,0,i,s);let a=150;e.textAlign="center",e.lineCap="round";for(let o=Math.floor((r-a/2)/15)*15;o<=r+a/2;o+=15){let l=i/2+(o-r)/a*i,c=(o%360+360)%360,u=ne(1.25-Math.abs(o-r)/(a/2),0,1);e.globalAlpha=u,e.strokeStyle="#fff",e.fillStyle="#fff";let h=c%45===0;e.lineWidth=h?4:3,e.beginPath(),e.moveTo(l,20),e.lineTo(l,h?32:29),e.stroke();let d={0:"\u0421",90:"\u0412",180:"\u042E",270:"\u0417"}[c];e.font=d?'italic 900 40px "Sofia X", sans-serif':'italic 800 21px "Sofia X", sans-serif',e.fillText(d||String(c),l,d?62:56)}e.globalAlpha=1,e.fillStyle="#22d3ee",e.beginPath(),e.moveTo(i/2-11,2),e.lineTo(i/2+11,2),e.lineTo(i/2,17),e.fill()}minimap(t,e,i){let s=this.map;if(!this.mapBase)return;s.drawImage(this.mapBase,0,0);let r=l=>(l-qn.x0)/(qn.x1-qn.x0)*256,a=l=>(l-qn.z0)/(qn.z1-qn.z0)*256;if(i){s.fillStyle="rgba(8,40,70,.75)";for(let l of i)l.on<.5||(s.beginPath(),s.ellipse(r(l.x),a(l.z),7,4,0,0,7),s.fill(),s.beginPath(),s.moveTo(r(l.x)+6,a(l.z)),s.lineTo(r(l.x)+12,a(l.z)-4),s.lineTo(r(l.x)+12,a(l.z)+4),s.fill())}s.fillStyle="#ffd60a",s.strokeStyle="#0a1a33",s.lineWidth=2,s.beginPath(),s.arc(r(Js.x-4),a(Js.z),5,0,7),s.fill(),s.stroke();let o=(l,c,u,h)=>{s.fillStyle=u.color,s.strokeStyle="#0a1a33",s.lineWidth=2.5,s.beginPath(),u.shape==="tri"?(s.moveTo(l,c-h),s.lineTo(l+h,c+h*.8),s.lineTo(l-h,c+h*.8)):u.shape==="diamond"?(s.moveTo(l,c-h),s.lineTo(l+h,c),s.lineTo(l,c+h),s.lineTo(l-h,c)):u.shape==="circle"?s.arc(l,c,h*.9,0,7):s.rect(l-h*.8,c-h*.8,h*1.6,h*1.6),s.closePath(),s.stroke(),s.fill()};for(let l of e)o(r(l.x),a(l.z),ca[l.slot%8],9);s.save(),s.translate(r(t.x),a(t.z)),s.rotate(-t.yaw),s.fillStyle="#fff",s.strokeStyle="#0a1a33",s.lineWidth=3,s.beginPath(),s.moveTo(0,-12),s.lineTo(9,10),s.lineTo(0,5),s.lineTo(-9,10),s.closePath(),s.stroke(),s.fill(),s.restore()}setTags(t){let e=Mt("#tags"),i=new Set;for(let s of t){i.add(s.id);let r=this.tags.get(s.id);r||(r=Eo("div","tag"),e.append(r),this.tags.set(s.id,r));let a=s.name+"|"+s.slot+"|"+(s.say||"");r.dataset.k!==a&&(r.dataset.k=a,r.innerHTML=`${s.say?`<div class="say">${s.say}</div>`:""}<div class="nm">${vh(s.slot,16)}${se(s.name)}</div>`),r.style.display=s.vis?"":"none",r.style.transform=`translate(${s.x.toFixed(1)}px,${s.y.toFixed(1)}px) translate(-50%,-100%) scale(${s.scale.toFixed(2)})`,r.classList.toggle("talk",!!s.talk)}for(let[s,r]of this.tags)i.has(s)||(r.remove(),this.tags.delete(s))}clearTags(){for(let t of this.tags.values())t.remove();this.tags.clear()}setPlates(t){let e=Mt("#plates"),i=new Set;for(let s of t){i.add(s.id);let r=this.plates.get(s.id);r||(r=Eo("div","plate"),e.append(r),this.plates.set(s.id,r));let a=[s.name,s.slot,s.host,s.me,s.mode].join("|");r.dataset.k!==a&&(r.dataset.k=a,r.style.borderLeftColor=ca[s.slot%8].color,r.innerHTML=`<div class="n">${s.me?Si("crown"):vh(s.slot,20)}${s.me?"\u0422\u042B":se(s.name)}${s.host?'<span class="host">\u0425\u041E\u0417\u042F\u0418\u041D</span>':""}</div><div class="s ${s.mode==="world"?"fish":""}">${s.mode==="world"?Si("bag")+"\u0420\u042B\u0411\u0410\u0427\u0418\u0422":Si("check")+"\u0413\u041E\u0422\u041E\u0412"}</div>`),r.style.transform=`translate(${s.x.toFixed(1)}px,${s.y.toFixed(1)}px) translate(-50%,0)`,r.classList.toggle("talk",!!s.talk)}for(let[s,r]of this.plates)i.has(s)||(r.remove(),this.plates.delete(s))}hideScreen(){this.screen.innerHTML="",this.panel=null,this.view=null}showTitle(t=""){this.view="title",this.panel=null;let e=this.g.profile,i=this.g.urlCode||"";this.screen.innerHTML=`<div class="title">
      <div class="logo">\u0420\u042B\u0411\u0410\u041A<small>\u0420\u042B\u0411\u0410\u041B\u041A\u0410 \u0421 \u0414\u0420\u0423\u0417\u042C\u042F\u041C\u0418</small></div>
      <div class="tcard">
        <label for="nm">\u041A\u0430\u043A \u0432\u0430\u0441 \u0437\u043E\u0432\u0443\u0442</label>
        <input class="in" id="nm" maxlength="16" placeholder="\u0418\u043C\u044F" value="${se(e.name||"")}" autocomplete="off">
        <div class="err" id="terr">${se(t)}</div>
        ${this.g.offline?`<button class="btn pri" data-a="solo"><span>\u041D\u0410\u0427\u0410\u0422\u042C \u0420\u042B\u0411\u0410\u041B\u041A\u0423</span></button>
        <div class="note">\u041F\u0440\u043E\u0431\u043D\u0430\u044F \u0432\u0435\u0440\u0441\u0438\u044F \u0434\u043B\u044F \u043E\u0434\u043D\u043E\u0433\u043E. \u041A\u043E\u043C\u043D\u0430\u0442\u044B \u0434\u043B\u044F \u0434\u0440\u0443\u0437\u0435\u0439 \u0438 \u0433\u043E\u043B\u043E\u0441\u043E\u0432\u043E\u0439 \u0447\u0430\u0442 \u0440\u0430\u0431\u043E\u0442\u0430\u044E\u0442 \u0432 \u043F\u043E\u043B\u043D\u043E\u0439 \u0438\u0433\u0440\u0435 \u043D\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0435.</div>`:`${i?`<button class="btn pri" data-a="join"><span>\u0412\u041E\u0419\u0422\u0418 \u0412 \u041A\u041E\u041C\u041D\u0410\u0422\u0423 ${se(i)}</span></button>`:'<button class="btn pri" data-a="create"><span>\u0421\u041E\u0417\u0414\u0410\u0422\u042C \u041A\u041E\u041C\u041D\u0410\u0422\u0423 \u0414\u041B\u042F \u0414\u0420\u0423\u0417\u0415\u0419</span></button>'}
        <div class="row"><input class="in code" id="code" maxlength="4" placeholder="\u041A\u041E\u0414" value="${se(i)}" autocomplete="off"><button class="btn cy" data-a="joincode"><span>\u0412\u041E\u0419\u0422\u0418 \u041F\u041E \u041A\u041E\u0414\u0423</span></button></div>
        <div class="or">\u0438\u043B\u0438</div>
        <button class="btn ghost" data-a="solo"><span>\u0420\u042B\u0411\u0410\u0427\u0418\u0422\u042C \u0412 \u041E\u0414\u0418\u041D\u041E\u0427\u041A\u0423</span></button>`}
      </div>
      <div class="tfoot">${this.g.offline?"\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0445\u0440\u0430\u043D\u0438\u0442\u0441\u044F \u0432 \u044D\u0442\u043E\u043C \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435":"\u0413\u043E\u043B\u043E\u0441\u043E\u0432\u043E\u0439 \u0447\u0430\u0442 \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442\u0441\u044F \u0432 \u043A\u043E\u043C\u043D\u0430\u0442\u0435 \xB7 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0445\u0440\u0430\u043D\u0438\u0442\u0441\u044F \u0432 \u044D\u0442\u043E\u043C \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435"}<br><a data-a="help">\u041A\u0430\u043A \u0438\u0433\u0440\u0430\u0442\u044C</a> \xB7 <a data-a="settings">\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438</a></div>
    </div>`,setTimeout(()=>{let s=Mt("#nm");s&&!s.value&&s.focus()},50)}showLobby(){this.view="lobby",this.panel=null;let t=this.g,e=t.roster().length,i=r=>r%10===1&&r%100!==11?"\u0420\u042B\u0411\u0410\u041A \u0413\u041E\u0422\u041E\u0412":r%10>=2&&r%10<=4&&(r%100<10||r%100>=20)?"\u0420\u042B\u0411\u0410\u041A\u0410 \u0413\u041E\u0422\u041E\u0412\u042B":"\u0420\u042B\u0411\u0410\u041A\u041E\u0412 \u0413\u041E\u0422\u041E\u0412\u042B",s=t.voiceState();this.screen.innerHTML=`
      <div class="lob-tl"><div class="chip">${Si("users")}<b>\u0422\u0412\u041E\u042F \u041A\u041E\u041C\u0410\u041D\u0414\u0410</b><i class="sep"></i><small>${t.solo?"\u041E\u0414\u0418\u041D\u041E\u0427\u041D\u0410\u042F \u0420\u042B\u0411\u0410\u041B\u041A\u0410":`${Si("lock")}\u041A\u041E\u0414 \xB7 <span class="y">${se(t.code)}</span> \xB7 ${e}/${Mu}`}</small></div>
        ${t.solo?"":`<button class="btn sm cy" data-a="copy"><span>${Si("link")} \u0421\u0421\u042B\u041B\u041A\u0410 \u0414\u041B\u042F \u0414\u0420\u0423\u0417\u0415\u0419</span></button>`}</div>
      <div class="nav"><button class="tab on" data-a="lobby">\u0418\u0413\u0420\u0410</button><button class="tab" data-a="open" data-p="tackle">\u0421\u041D\u0410\u0421\u0422\u0418</button><button class="tab" data-a="open" data-p="editor">\u041F\u0415\u0420\u0421\u041E\u041D\u0410\u0416</button><button class="tab" data-a="open" data-p="journal">\u0416\u0423\u0420\u041D\u0410\u041B</button></div>
      <div class="lcard">
        <h2>${Si("pin")}\u0421\u041E\u041B\u041D\u0415\u0427\u041D\u0410\u042F \u0411\u0423\u0425\u0422\u0410</h2>
        <div class="mode">\u0421\u0412\u041E\u0411\u041E\u0414\u041D\u0410\u042F \u0420\u042B\u0411\u0410\u041B\u041A\u0410</div>
        <img class="shot" src="${t.shot||""}" alt="">
        <div class="ready">${Si("users")}${e} ${i(e)}</div>
        <button class="btn pri big" data-a="start"><kbd class="g">\u21B5</kbd><span>\u041D\u0410\u0427\u0410\u0422\u042C \u0420\u042B\u0411\u0410\u041B\u041A\u0423</span></button>
        ${t.solo?"":`<div class="sub"><button class="btn ${s.on?s.muted?"ghost":"cy":"ghost"}" data-a="voice"><span>${Si(s.on&&!s.muted?"mic":"micoff")} ${s.joining?"\u041F\u041E\u0414\u041A\u041B\u042E\u0427\u0410\u042E\u2026":s.on?s.muted?"\u041C\u0418\u041A\u0420\u041E\u0424\u041E\u041D \u0412\u042B\u041A\u041B":"\u0413\u041E\u041B\u041E\u0421 \u0412\u041A\u041B\u042E\u0427\u0401\u041D":"\u0412\u041A\u041B\u042E\u0427\u0418\u0422\u042C \u0413\u041E\u041B\u041E\u0421"}</span></button></div>
        <div class="hint">${s.on?"\u0414\u0440\u0443\u0437\u044C\u044F \u0432\u0430\u0441 \u0441\u043B\u044B\u0448\u0430\u0442. \u041A\u043B\u0430\u0432\u0438\u0448\u0430 M \u2014 \u0432\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0438 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D.":"\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0433\u043E\u043B\u043E\u0441\xBB \u0438 \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435 \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D \u2014 \u0431\u0443\u0434\u0435\u0442\u0435 \u0441\u043B\u044B\u0448\u0430\u0442\u044C \u0434\u0440\u0443\u0433 \u0434\u0440\u0443\u0433\u0430 \u043F\u0440\u044F\u043C\u043E \u0432 \u0438\u0433\u0440\u0435."}</div>`}
      </div>
      <div class="lob-bl"><button class="btn sm ghost" data-a="leave"><kbd class="b">ESC</kbd><span>${t.solo?"\u0412 \u041C\u0415\u041D\u042E":"\u0412\u042B\u0419\u0422\u0418 \u0418\u0417 \u041A\u041E\u041C\u041D\u0410\u0422\u042B"}</span></button></div>`}openPanel(t,e={}){this.panel=t,this.popts=e,t==="tackle"||t==="shop"?(this.tk=this.tk||{cat:"rod",sel:null},this.tk.shop=t==="shop",this.renderTackle()):t==="sell"?this.renderSell():t==="journal"?this.renderJournal():t==="editor"?this.renderEditor(!0):t==="settings"?this.renderSettings():t==="pause"?this.renderPause():t==="help"&&this.renderHelp(),this.g.onPanel(t)}closePanel(){if(!this.panel)return;let t=this.panel;this.panel=null,this.g.onPanel(null,t)}footKeys(t){return`<span class="sp"></span><div class="keys">${t?`<span>${this.key("use")} ${t}</span>`:""}<span>${this.key("esc")} \u041D\u0410\u0417\u0410\u0414</span></div>`}renderTackle(){let t=this.g.profile,e=this.tk,i=Io.find(o=>o.key===e.cat)||Io[0];(!e.sel||!i.items.some(o=>o.id===e.sel))&&(e.sel=(i.items.find(o=>t.equip[i.slot]===o.id)||i.items[0]).id);let s=Qt[e.sel],r=i.items.map(o=>{let l=ko(t,o.id),c=o.cat!=="extra"&&t.equip[Qt[o.id].slot]===o.id,u=Qt[o.id].count?jn(t,o.id):0,h="";return c&&(h=`<span class="tg">${Si("check")}\u0412\u042B\u0411\u0420\u0410\u041D\u041E</span>`),Qt[o.id].count&&u>0?h+=`<span class="tg cnt">${u===1/0?"\u221E":"\xD7"+u}</span>`:l?(o.cat==="extra"||l&&!c&&!Qt[o.id].slot)&&(h+=`<span class="tg">${Si("check")}\u0415\u0421\u0422\u042C</span>`):h+=`<span class="tg price">${Rs(ea(o.id))}</span>`,`<div class="tile ${o.id===e.sel?"sel":""} ${l?"":"lock"}" data-a="pick" data-id="${o.id}">${h}<img src="${Pn(o.id)}" alt=""><div class="nm">${se(o.name)}</div></div>`}).join(""),a=cr(t);this.screen.innerHTML=`<div class="dim"></div><div class="panel">
      <div class="ptitle"><h1>${e.shop?"\u041C\u0410\u0413\u0410\u0417\u0418\u041D":"\u0421\u041D\u0410\u0421\u0422\u0418"}</h1>${e.shop?'<button class="btn sm cy" data-a="open" data-p="sell"><span>\u2190 \u041F\u0420\u041E\u0414\u0410\u0422\u042C \u0423\u041B\u041E\u0412</span></button>':""}<span class="sp"></span><div class="coinbox">${Rs(t.coins)}</div><button class="xbtn" data-a="close">\xD7</button></div>
      <div class="tabs2">${Io.map(o=>`<button class="tab ${o.key===i.key?"on":""}" data-a="cat" data-id="${o.key}">${o.name}</button>`).join("")}</div>
      <div class="grid">${r}</div>
      <div class="detail">${this.itemDetail(s)}</div>
      <div class="loadout"><span class="hd">\u0422\u0415\u041A\u0423\u0429\u0418\u0419 \u041D\u0410\u0411\u041E\u0420</span>
        <div class="it"><img src="${Pn(t.equip.rod)}" alt="">${se(Qt[t.equip.rod].name)}</div>
        <div class="it"><img src="${Pn(t.equip.tackle)}" alt="">${se(Qt[t.equip.tackle].name)} <span class="y">${jn(t,t.equip.tackle)===1/0?"\u221E":jn(t,t.equip.tackle)}</span></div>
        <div class="it">\u0417\u0410\u0411\u0420\u041E\u0421 <span class="y">${a.cast} \u041C</span></div><div class="it">\u041B\u0415\u0421\u041A\u0410 <span class="y">${a.lineKg.toFixed(1).replace(".",",")} \u041A\u0413</span></div><div class="it">\u0421\u0410\u0414\u041E\u041A <span class="y">${t.cooler.length}/${a.bagCap}</span></div>
        ${this.footKeys(this.actionOf(s).label)}</div></div>`}actionOf(t){let e=this.g.profile,i=ko(e,t.id),s=t.slot&&e.equip[t.slot]===t.id,r=ea(t.id);return t.count?this.tk.shop&&t.id!=="bread"?{a:"buy",label:`\u041A\u0423\u041F\u0418\u0422\u042C ${t.cat==="tackle"?"\xD7"+t.pack:""} \u0417\u0410 ${En(r)}`,dis:e.coins<r,also:i&&!s?"equip":null}:i&&!s?{a:"equip",label:"\u0412\u0417\u042F\u0422\u042C"}:{a:null,label:""}:i?s||!t.slot?{a:null,label:""}:{a:"equip",label:"\u0412\u0417\u042F\u0422\u042C"}:this.tk.shop?{a:"buy",label:`\u041A\u0423\u041F\u0418\u0422\u042C \u0417\u0410 ${En(r)}`,dis:e.coins<r}:{a:null,label:""}}itemDetail(t){let e=this.g.profile,i=ko(e,t.id),s=t.slot&&e.equip[t.slot]===t.id,r=this.actionOf(t),a="";if(t.cat==="rod"){let l=F0(t),c=(u,h,d)=>`<div class="stat"><span>${u}<em>${d}</em></span><div class="bar"><i style="width:${Math.round(ne(h,.04,1)*100)}%"></i></div></div>`;a=`<div class="stats">${c("\u0414\u0410\u041B\u042C\u041D\u041E\u0421\u0422\u042C \u0417\u0410\u0411\u0420\u041E\u0421\u0410",l.cast,t.cast+" \u043C")}${c("\u041F\u0420\u041E\u0427\u041D\u041E\u0421\u0422\u042C \u041B\u0415\u0421\u041A\u0418",l.line,String(t.line).replace(".",",")+" \u043A\u0433")}${c("\u0421\u041A\u041E\u0420\u041E\u0421\u0422\u042C \u041A\u0410\u0422\u0423\u0428\u041A\u0418",l.reel,"\xD7"+t.reel.toFixed(2).replace(".",","))}</div>`}else{let l=[];if(t.cat==="tackle"||t.cat==="lure"){let c=wn.filter(u=>t.cat==="lure"?u.lure>=1.2:(u.baits[t.id]||0)>=1.25).sort((u,h)=>h.rar-u.rar).slice(0,6).map(u=>u.name);c.length&&l.push("\u041B\u044E\u0431\u044F\u0442: "+c.join(", ").toLowerCase()),t.rare>1&&l.push(`\u0420\u0435\u0434\u043A\u0430\u044F \u0440\u044B\u0431\u0430 \u043A\u043B\u044E\u0451\u0442 \u043E\u0445\u043E\u0442\u043D\u0435\u0435: \xD7${String(t.rare).replace(".",",")}`),t.size>1&&l.push("\u0420\u044B\u0431\u0430 \u043F\u043E\u043F\u0430\u0434\u0430\u0435\u0442\u0441\u044F \u043A\u0440\u0443\u043F\u043D\u0435\u0435"),t.cat==="lure"?l.push("\u041D\u0435 \u0440\u0430\u0441\u0445\u043E\u0434\u0443\u0435\u0442\u0441\u044F, \u043D\u043E \u0442\u0435\u0440\u044F\u0435\u0442\u0441\u044F \u043F\u0440\u0438 \u043E\u0431\u0440\u044B\u0432\u0435 \u043B\u0435\u0441\u043A\u0438","\u041F\u043E\u0441\u043B\u0435 \u0437\u0430\u0431\u0440\u043E\u0441\u0430 \u0443\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0439\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0443 \u2014 \u043F\u0440\u0438\u043C\u0430\u043D\u043A\u0430 \u0434\u043E\u043B\u0436\u043D\u0430 \u0434\u0432\u0438\u0433\u0430\u0442\u044C\u0441\u044F"):t.id!=="bread"&&l.push("\u0420\u0430\u0441\u0445\u043E\u0434\u0443\u0435\u0442\u0441\u044F \u043F\u0440\u0438 \u043A\u0430\u0436\u0434\u043E\u0439 \u043F\u043E\u043A\u043B\u0451\u0432\u043A\u0435")}t.cat==="bag"&&l.push(`\u0412\u043C\u0435\u0441\u0442\u0438\u043C\u043E\u0441\u0442\u044C: ${t.cap} \u0440\u044B\u0431`),a=l.length?`<ul class="fx">${l.map(c=>`<li>${se(c)}</li>`).join("")}</ul>`:"<div></div>"}let o="";return r.a==="buy"?o=`<button class="btn pri" data-a="buy" data-id="${t.id}" ${r.dis?"disabled":""}><span>${r.label}</span></button>${r.also?`<button class="btn cy" data-a="equip" data-id="${t.id}"><span>\u0412\u0417\u042F\u0422\u042C</span></button>`:""}${r.dis?`<small>\u041D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 ${En(ea(t.id)-e.coins)} \u043C\u043E\u043D\u0435\u0442 \u2014 \u043F\u0440\u043E\u0434\u0430\u0439\u0442\u0435 \u0443\u043B\u043E\u0432</small>`:""}`:r.a==="equip"?o=`<button class="btn pri" data-a="equip" data-id="${t.id}"><span>\u0412\u0417\u042F\u0422\u042C</span></button>`:s?o=`${Si("check")}\u0412\u042B\u0411\u0420\u0410\u041D\u041E`:i?o=`${Si("check")}\u041A\u0423\u041F\u041B\u0415\u041D\u041E`:o=`<span class="y" style="display:inline-flex;gap:.3em;align-items:center">${Rs(ea(t.id))}</span><small>\u041F\u0440\u043E\u0434\u0430\u0451\u0442\u0441\u044F \u043D\u0430 \u0440\u044B\u043D\u043A\u0435 \u2014 \u043B\u0430\u0432\u043A\u0430 \u0441 \u043F\u043E\u043B\u043E\u0441\u0430\u0442\u044B\u043C \u043D\u0430\u0432\u0435\u0441\u043E\u043C \u0443 \u0431\u0435\u0440\u0435\u0433\u0430</small>`,`<img class="big" src="${Pn(t.id)}" alt=""><h2>${se(t.name)}</h2><p class="desc">${se(t.desc)}</p>${a}<div class="act">${o}</div>`}renderSell(){let t=this.g,e=t.profile,i=t.market(),s=cr(e),r=e.cooler.map((l,c)=>{let u=Ue[l.sp],h=Fo(l,i),d=u?i.mult[l.sp]:1;return`<div class="tile" data-a="sell1" data-id="${c}" title="\u041F\u0440\u043E\u0434\u0430\u0442\u044C"><span class="pr ${d>=1.15?"up":d<=.92?"dn":""}">${Rs(h)}</span>${l.trophy?'<span class="tg">\u0422\u0420\u041E\u0424\u0415\u0419</span>':""}<img src="${u?Go(l.sp):Pn(l.sp)}" alt=""><div class="nm" style="color:${u?Sn[u.rar].color:"#fff"}">${se((u||Zn[l.sp]).name)}</div><div class="wt">${un(l.w)}</div></div>`}).join(""),a=Z0(e,i),o=Math.max(1,Math.ceil(i.nextIn/60));this.screen.innerHTML=`<div class="dim"></div><div class="panel">
      <div class="ptitle"><h1>\u0420\u042B\u041D\u041E\u041A</h1><button class="btn sm cy" data-a="open" data-p="shop"><span>\u041C\u0410\u0413\u0410\u0417\u0418\u041D \u0421\u041D\u0410\u0421\u0422\u0415\u0419 \u2192</span></button><span class="sp"></span><div class="coinbox">${Rs(e.coins)}</div><button class="xbtn" data-a="close">\xD7</button></div>
      <div class="tabs2"><button class="tab on">\u0422\u0412\u041E\u0419 \u0423\u041B\u041E\u0412 \xB7 ${e.cooler.length}/${s.bagCap}</button></div>
      <div class="grid">${r||'<div class="empty">\u0421\u0430\u0434\u043E\u043A \u043F\u0443\u0441\u0442.<br>\u041F\u043E\u0439\u043C\u0430\u0439\u0442\u0435 \u0447\u0442\u043E-\u043D\u0438\u0431\u0443\u0434\u044C \u2014 \u0442\u043E\u0440\u0433\u043E\u0432\u0435\u0446 \u043A\u0443\u043F\u0438\u0442 \u0432\u0441\u0451, \u0434\u0430\u0436\u0435 \u0441\u0442\u0430\u0440\u044B\u0439 \u0431\u043E\u0442\u0438\u043D\u043E\u043A.</div>'}</div>
      <div class="sellside">
        <h2>\u0421\u0415\u0413\u041E\u0414\u041D\u042F \u0412 \u0426\u0415\u041D\u0415</h2>
        <div class="hotlist">${i.hot.map(l=>`<div><img src="${Go(l)}" alt="">${se(Ue[l].name)}<em>\xD71,6</em></div>`).join("")}</div>
        <p>\u0426\u0435\u043D\u044B \u043C\u0435\u043D\u044F\u044E\u0442\u0441\u044F \u043A\u0430\u0436\u0434\u044B\u0435 10 \u043C\u0438\u043D\u0443\u0442 \u2014 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F \u0441\u043C\u0435\u043D\u0430 \u0447\u0435\u0440\u0435\u0437 ${o} \u043C\u0438\u043D. \u0421\u0442\u0440\u0435\u043B\u043A\u0430 \u0443 \u0446\u0435\u043D\u044B \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442, \u0434\u043E\u0440\u043E\u0436\u0435 \u0440\u044B\u0431\u0430 \u043E\u0431\u044B\u0447\u043D\u043E\u0433\u043E \u0438\u043B\u0438 \u0434\u0435\u0448\u0435\u0432\u043B\u0435. \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u0440\u044B\u0431\u0443, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u043E\u0434\u0430\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u0435\u0451.</p>
        <div class="total"><span>\u0417\u0410 \u0412\u0415\u0421\u042C \u0423\u041B\u041E\u0412</span><b>${Rs(a)}</b></div>
        <button class="btn pri big" data-a="sellall" ${e.cooler.length?"":"disabled"}><span>\u041F\u0420\u041E\u0414\u0410\u0422\u042C \u0412\u0421\u0401</span></button>
      </div>
      <div class="loadout"><span class="hd">\u0422\u041E\u0420\u0413\u041E\u0412\u0415\u0426</span><div class="it" style="border:0;text-transform:none;font-family:var(--body);font-style:normal;font-weight:500">\xAB${se(t.vendorLine())}\xBB</div>${this.footKeys(e.cooler.length?"\u041F\u0420\u041E\u0414\u0410\u0422\u042C \u0412\u0421\u0401":"")}</div></div>`}renderJournal(){let t=this.g.profile;this.js=this.js||wn[0].id;let e=Ue[this.js],i=t.journal[e.id],s=Object.keys(t.journal).length,r=wn.map(h=>{let d=t.journal[h.id];return`<div class="tile ${h.id===this.js?"sel":""} ${d?"":"unk lock"}" data-a="jpick" data-id="${h.id}">${d?`<span class="tg cnt">\xD7${d.n}</span>`:""}<img src="${Go(h.id)}" alt=""><div class="nm" style="color:${d?Sn[h.rar].color:"#9fb4d3"}">${d?se(h.name):"???"}</div></div>`}).join(""),a=Object.entries(e.zones).sort((h,d)=>d[1]-h[1]).slice(0,3).map(([h])=>Kn[h].name.toLowerCase()).join(", "),o=[...Object.entries(e.baits).filter(([,h])=>h>=1).sort((h,d)=>d[1]-h[1]).slice(0,3).map(([h])=>Qt[h].name.toLowerCase()),...e.lure>=1?["\u0431\u043B\u0451\u0441\u043D\u044B \u0438 \u0432\u043E\u0431\u043B\u0435\u0440\u044B"]:[]].join(", "),l=Object.entries(e.time).filter(([,h])=>h>1.1).map(([h])=>T0[h].toLowerCase()).join(", ")||"\u0432 \u043B\u044E\u0431\u043E\u0435 \u0432\u0440\u0435\u043C\u044F",c=Jn(t.xp),u=t.stats;this.screen.innerHTML=`<div class="dim"></div><div class="panel">
      <div class="ptitle"><h1>\u0416\u0423\u0420\u041D\u0410\u041B</h1><span class="sp"></span><div class="coinbox">${Rs(t.coins)}</div><button class="xbtn" data-a="close">\xD7</button></div>
      <div class="jstats"><div><b>${c.lvl}</b>\u0443\u0440\u043E\u0432\u0435\u043D\u044C \xB7 ${se(c.title)}</div><div><b>${s}/${wn.length}</b>\u0432\u0438\u0434\u043E\u0432 \u043E\u0442\u043A\u0440\u044B\u0442\u043E</div><div><b>${u.caught}</b>\u043F\u043E\u0439\u043C\u0430\u043D\u043E</div><div><b>${En(u.earned)}</b>\u0437\u0430\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043E</div><div><b>${u.best?un(u.best.w):"\u2014"}</b>${u.best?se(Ue[u.best.sp].name)+" \u2014 \u0440\u0435\u043A\u043E\u0440\u0434":"\u0441\u0430\u043C\u044B\u0439 \u0442\u044F\u0436\u0451\u043B\u044B\u0439 \u0443\u043B\u043E\u0432"}</div><div><b>${u.snaps}</b>\u043E\u0431\u0440\u044B\u0432\u043E\u0432 \u043B\u0435\u0441\u043A\u0438</div></div>
      <div class="grid" style="grid-template-columns:repeat(5,1fr)">${r}</div>
      <div class="detail" style="grid-row:3/4">
        <img class="big ${i?"":"unk"}" src="${Go(e.id)}" alt="" style="${i?"":"filter:brightness(0) opacity(.5)"}">
        <div class="rarc" style="color:${Sn[e.rar].color}">${Sn[e.rar].name}</div>
        <h2 style="margin-top:-.1em">${i?se(e.name):"???"}</h2>
        <p class="desc">${i?se(e.desc):"\u042D\u0442\u0443 \u0440\u044B\u0431\u0443 \u0432\u044B \u0435\u0449\u0451 \u043D\u0435 \u043B\u043E\u0432\u0438\u043B\u0438. \u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0438 \u043D\u0438\u0436\u0435 \u043F\u043E\u043C\u043E\u0433\u0443\u0442 \u0435\u0451 \u043D\u0430\u0439\u0442\u0438."}</p>
        <div class="kv" style="grid-column:1/-1"><span>\u0413\u0434\u0435</span><span>${a}</span><span>\u041D\u0430 \u0447\u0442\u043E</span><span>${o||"\u2014"}</span><span>\u041A\u043E\u0433\u0434\u0430</span><span>${l}</span>
          <span>\u0412\u0435\u0441</span><span>${un(e.w[0])} \u2013 ${un(e.w[1])}</span>${i?`<span>\u041F\u043E\u0439\u043C\u0430\u043D\u043E</span><span>${i.n}</span><span>\u0420\u0435\u043A\u043E\u0440\u0434</span><span class="y">${un(i.best)}</span>`:""}</div>
      </div>
      <div class="loadout"><span class="hd">\u0414\u041E \u0423\u0420\u041E\u0412\u041D\u042F ${c.lvl+1}</span><div class="it" style="border:0;flex:1;max-width:30em"><div class="pbar" style="flex:1;height:1em"><i style="width:${Math.round(c.cur/c.need*100)}%;background:var(--ye)"></i></div>&nbsp;${c.cur} / ${c.need}</div>${this.footKeys("")}</div></div>`}renderEditor(t){let e=this.g;t&&(this.ed={look:{...e.profile.look},cat:"body"},e.editLook(this.ed.look));let i=this.ed,s=i.look,r=[["presets","\u041E\u0411\u0420\u0410\u0417\u042B"],["body","\u0422\u0415\u041B\u041E"],["face","\u041B\u0418\u0426\u041E"],["hair","\u0412\u041E\u041B\u041E\u0421\u042B"],["head","\u0413\u041E\u041B\u041E\u0412\u0410"],["top","\u0412\u0415\u0420\u0425"],["bottom","\u041D\u0418\u0417"],["shoes","\u041E\u0411\u0423\u0412\u042C"],["hands","\u0420\u0423\u041A\u0418"],["back","\u0421\u041F\u0418\u041D\u0410"]],a={body:[["\u0422\u0435\u043B\u043E\u0441\u043B\u043E\u0436\u0435\u043D\u0438\u0435","body"],["\u0420\u043E\u0441\u0442","height"],["\u041A\u043E\u0436\u0430","skin"]],face:[["\u0413\u043B\u0430\u0437\u0430","eyes"],["\u0426\u0432\u0435\u0442 \u0433\u043B\u0430\u0437","eyeC"],["\u0411\u0440\u043E\u0432\u0438","brows"],["\u0420\u043E\u0442","mouth"],["\u041D\u043E\u0441","nose"],["\u0429\u0451\u043A\u0438","cheeks"]],hair:[["\u041F\u0440\u0438\u0447\u0451\u0441\u043A\u0430","hair"],["\u0426\u0432\u0435\u0442 \u0432\u043E\u043B\u043E\u0441","hairC"],["\u0411\u043E\u0440\u043E\u0434\u0430 \u0438 \u0443\u0441\u044B","beard"]],head:[["\u0413\u043E\u043B\u043E\u0432\u043D\u043E\u0439 \u0443\u0431\u043E\u0440","hat"],["\u0426\u0432\u0435\u0442 \u0443\u0431\u043E\u0440\u0430","hatC"],["\u041E\u0447\u043A\u0438","glasses"]],top:[["\u041E\u0434\u0435\u0436\u0434\u0430","top"],["\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0446\u0432\u0435\u0442","topC"],["\u0412\u0442\u043E\u0440\u043E\u0439 \u0446\u0432\u0435\u0442","topC2"]],bottom:[["\u041E\u0434\u0435\u0436\u0434\u0430","bottom"],["\u0426\u0432\u0435\u0442","botC"]],shoes:[["\u041E\u0431\u0443\u0432\u044C","shoes"],["\u0426\u0432\u0435\u0442","shoeC"]],hands:[["\u041F\u0435\u0440\u0447\u0430\u0442\u043A\u0438","gloves"],["\u0426\u0432\u0435\u0442 \u043F\u0435\u0440\u0447\u0430\u0442\u043E\u043A","gloveC"]],back:[["\u0417\u0430 \u0441\u043F\u0438\u043D\u043E\u0439","pack"],["\u0426\u0432\u0435\u0442","packC"]]},o="";if(i.cat==="presets")o=`<h3>\u0413\u043E\u0442\u043E\u0432\u044B\u0435 \u043E\u0431\u0440\u0430\u0437\u044B</h3><div class="olist">${sr.map((l,c)=>`<button data-a="preset" data-id="${c}">${se(l.name)}</button>`).join("")}</div>
        <h3>\u0418\u043B\u0438 \u0434\u043E\u0432\u0435\u0440\u044C\u0442\u0435\u0441\u044C \u0441\u043B\u0443\u0447\u0430\u044E</h3><button class="btn cy sm" data-a="rnd" style="width:100%"><span>\u0421\u041B\u0423\u0427\u0410\u0419\u041D\u042B\u0419 \u0420\u042B\u0411\u0410\u041A</span></button>`;else for(let[l,c]of a[i.cat])o+=`<h3>${l}</h3>`,c==="height"?o+=`<input type="range" min="0.88" max="1.12" step="0.01" value="${s.height}" data-k="height">`:nr[c]?o+=`<div class="olist">${nr[c].map((u,h)=>`<button class="${s[c]===h?"on":""}" data-a="opt" data-k="${c}" data-id="${h}">${u}</button>`).join("")}</div>`:o+=`<div class="sw">${w0[c].map(u=>`<button class="${s[c].toLowerCase()===u?"on":""}" style="background:${u}" data-a="col" data-k="${c}" data-id="${u}"></button>`).join("")}<label title="\u0421\u0432\u043E\u0439 \u0446\u0432\u0435\u0442"><input type="color" value="${s[c]}" data-k="${c}"></label></div>`;this.screen.innerHTML=`<div class="editor">
      <div class="ptitle"><h1>\u041F\u0415\u0420\u0421\u041E\u041D\u0410\u0416</h1><span class="sp"></span><button class="btn sm cy" data-a="rnd"><span>\u0421\u041B\u0423\u0427\u0410\u0419\u041D\u041E</span></button></div>
      <div class="cats">${r.map(([l,c])=>`<button class="btn ${i.cat===l?"on":""}" data-a="ecat" data-id="${l}"><span>${c}</span></button>`).join("")}</div>
      <div class="edhint">${this.g.input.touch.on?"\u0412\u0435\u0434\u0438\u0442\u0435 \u043F\u0430\u043B\u044C\u0446\u0435\u043C \u2014 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u0436 \u043F\u043E\u0432\u0435\u0440\u043D\u0451\u0442\u0441\u044F":"\u0417\u0430\u0436\u043C\u0438\u0442\u0435 \u043C\u044B\u0448\u044C \u0438 \u0432\u0435\u0434\u0438\u0442\u0435 \u2014 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u0436 \u043F\u043E\u0432\u0435\u0440\u043D\u0451\u0442\u0441\u044F"}</div>
      <div class="opts">${o}</div>
      <div class="edfoot"><button class="btn ghost" data-a="edcancel"><kbd class="b">ESC</kbd><span>\u041E\u0422\u041C\u0415\u041D\u0410</span></button><span class="sp"></span><button class="btn pri big" data-a="edsave" style="height:2.2em"><span>\u0413\u041E\u0422\u041E\u0412\u041E</span></button></div></div>`}renderSettings(){let t=Fe,e=(s,r,a,o)=>`<input type="range" min="${r}" max="${a}" step="${o}" value="${t[s]}" data-set="${s}">`,i=s=>`<span class="tog ${t[s]?"on":""} click" data-a="tog" data-id="${s}"></span>`;this.screen.innerHTML=`<div class="dim"></div><div class="center">
      <h1>\u041D\u0410\u0421\u0422\u0420\u041E\u0419\u041A\u0418</h1>
      <div class="set">
        <span>\u0427\u0443\u0432\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043C\u044B\u0448\u0438</span>${e("sens",.3,3,.05)}
        <span>\u041F\u0435\u0440\u0435\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u043C\u044B\u0448\u044C \u043F\u043E \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u0438</span>${i("invertY")}
        <span>\u0423\u0433\u043E\u043B \u043E\u0431\u0437\u043E\u0440\u0430</span>${e("fov",50,90,1)}
        <span>\u0413\u0440\u0430\u0444\u0438\u043A\u0430</span><select data-set="quality">${[["auto","\u0410\u0432\u0442\u043E"],["high","\u0412\u044B\u0441\u043E\u043A\u0430\u044F"],["medium","\u0421\u0440\u0435\u0434\u043D\u044F\u044F"],["low","\u041D\u0438\u0437\u043A\u0430\u044F"]].map(([s,r])=>`<option value="${s}" ${t.quality===s?"selected":""}>${r}</option>`).join("")}</select>
        <span>\u041E\u0431\u0449\u0430\u044F \u0433\u0440\u043E\u043C\u043A\u043E\u0441\u0442\u044C</span>${e("master",0,1,.02)}
        <span>\u041C\u043E\u0440\u0435, \u0447\u0430\u0439\u043A\u0438, \u0432\u0435\u0442\u0435\u0440</span>${e("amb",0,1,.02)}
        <span>\u0417\u0432\u0443\u043A\u0438 \u0440\u044B\u0431\u0430\u043B\u043A\u0438</span>${e("sfx",0,1,.02)}
        <span>\u0413\u0440\u043E\u043C\u043A\u043E\u0441\u0442\u044C \u0433\u043E\u043B\u043E\u0441\u043E\u0432 \u0434\u0440\u0443\u0437\u0435\u0439</span>${e("voiceVol",0,1,.02)}
        <span>\u0413\u043E\u0432\u043E\u0440\u0438\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u0441 \u0437\u0430\u0436\u0430\u0442\u043E\u0439 V</span>${i("ptt")}
        <span>\u0413\u043E\u043B\u043E\u0441 \u0442\u0438\u0448\u0435 \u0441 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435\u043C</span>${i("near")}
        <span>\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0438 \u043A\u043B\u0430\u0432\u0438\u0448 \u0432\u043D\u0438\u0437\u0443</span>${i("hints")}
      </div>
      <button class="btn pri" data-a="close"><span>\u0413\u041E\u0422\u041E\u0412\u041E</span></button>
      <button class="btn ghost sm" data-a="reset"><span>\u041D\u0410\u0427\u0410\u0422\u042C \u0417\u0410\u041D\u041E\u0412\u041E \u2014 \u0421\u0422\u0415\u0420\u0415\u0422\u042C \u041F\u0420\u041E\u0413\u0420\u0415\u0421\u0421</span></button></div>`}renderPause(){let t=this.g;this.screen.innerHTML=`<div class="dim"></div><div class="center">
      <h1>\u041F\u0410\u0423\u0417\u0410</h1>
      <button class="btn pri" data-a="close"><span>\u0412\u0415\u0420\u041D\u0423\u0422\u042C\u0421\u042F \u041A \u0420\u042B\u0411\u0410\u041B\u041A\u0415</span></button>
      <button class="btn" data-a="open" data-p="tackle"><span>\u0421\u041D\u0410\u0421\u0422\u0418</span></button>
      <button class="btn" data-a="open" data-p="journal"><span>\u0416\u0423\u0420\u041D\u0410\u041B \u0420\u042B\u0411</span></button>
      <button class="btn" data-a="open" data-p="editor"><span>\u041F\u0415\u0420\u0421\u041E\u041D\u0410\u0416</span></button>
      <button class="btn" data-a="open" data-p="help"><span>\u041A\u0410\u041A \u0418\u0413\u0420\u0410\u0422\u042C</span></button>
      <button class="btn" data-a="open" data-p="settings"><span>\u041D\u0410\u0421\u0422\u0420\u041E\u0419\u041A\u0418</span></button>
      ${t.solo?"":`<button class="btn cy" data-a="copy"><span>${Si("link")} \u0421\u0421\u042B\u041B\u041A\u0410 \u0414\u041B\u042F \u0414\u0420\u0423\u0417\u0415\u0419 \xB7 ${se(t.code)}</span></button>`}
      <button class="btn ghost" data-a="tolobby"><span>${t.solo?"\u0412 \u041B\u041E\u0411\u0411\u0418":"\u0412 \u041B\u041E\u0411\u0411\u0418 \u041A \u041A\u041E\u041C\u0410\u041D\u0414\u0415"}</span></button></div>`}renderHelp(){let t=(e,i="")=>`<kbd class="${i}">${e}</kbd>`;if(this.g.input.touch.on){this.screen.innerHTML=`<div class="dim"></div><div class="center" style="width:min(44em,94vw)">
      <h1>\u041A\u0410\u041A \u0418\u0413\u0420\u0410\u0422\u042C</h1>
      <div class="help">
        <span>${t("\u0414\u0416\u041E\u0419\u0421\u0422\u0418\u041A","g")}</span><span>\u0421\u043B\u0435\u0432\u0430 \u2014 \u0445\u043E\u0434\u0438\u0442\u044C. \u041F\u0430\u043B\u0435\u0446 \u043F\u043E \u044D\u043A\u0440\u0430\u043D\u0443 \u2014 \u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043F\u043E \u0441\u0442\u043E\u0440\u043E\u043D\u0430\u043C.</span>
        <span>${t("\u0417\u0410\u0411\u0420\u041E\u0421")}</span><span>\u041D\u0430\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u0440\u0438\u0446\u0435\u043B \u043D\u0430 \u0432\u043E\u0434\u0443, \u0437\u0430\u0436\u043C\u0438\u0442\u0435 \u0436\u0451\u043B\u0442\u0443\u044E \u043A\u043D\u043E\u043F\u043A\u0443 \u2014 \u0448\u043A\u0430\u043B\u0430 \u0441\u0438\u043B\u044B \u0440\u0430\u0441\u0442\u0451\u0442 \u2014 \u0438 \u043E\u0442\u043F\u0443\u0441\u0442\u0438\u0442\u0435. \u0411\u0435\u043B\u0430\u044F \u0440\u0438\u0441\u043A\u0430 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442, \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0438\u043B\u044B \u043D\u0443\u0436\u043D\u043E \u0434\u043E \u043C\u0435\u0442\u043A\u0438.</span>
        <span>${t("\u041F\u041E\u0414\u0421\u0415\u041A\u0410\u0419")}</span><span>\u041F\u043E\u043F\u043B\u0430\u0432\u043E\u043A \u043D\u044B\u0440\u043D\u0443\u043B \u0438 \u043A\u043D\u043E\u043F\u043A\u0430 \u0437\u0430\u043C\u0438\u0433\u0430\u043B\u0430 \u2014 \u0436\u043C\u0438\u0442\u0435 \u0441\u0440\u0430\u0437\u0443.</span>
        <span>${t("\u041C\u041E\u0422\u0410\u0419")}</span><span><b>\u0412\u044B\u0432\u0430\u0436\u0438\u0432\u0430\u043D\u0438\u0435:</b> \u0434\u0435\u0440\u0436\u0438\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0443 \u2014 \u043C\u043E\u0442\u0430\u0435\u0442\u0435, \u043E\u0442\u043F\u0443\u0441\u043A\u0430\u0435\u0442\u0435 \u2014 \u043B\u0435\u0441\u043A\u0430 \u0441\u043B\u0430\u0431\u0435\u0435\u0442. \u0421\u0442\u0440\u0435\u043B\u043A\u0430 \u043D\u0430\u0442\u044F\u0436\u0435\u043D\u0438\u044F \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0432 \u0433\u043E\u043B\u0443\u0431\u043E\u0439 \u0437\u043E\u043D\u0435. \u0420\u044B\u0431\u0430 \u0440\u0432\u0430\u043D\u0443\u043B\u0430 \u0432\u0431\u043E\u043A \u2014 \u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u0436\u043E\u0439\u0441\u0442\u0438\u043A \u0432 \u0434\u0440\u0443\u0433\u0443\u044E \u0441\u0442\u043E\u0440\u043E\u043D\u0443.</span>
        <span>${t("\u0421\u041C\u041E\u0422\u0410\u0422\u042C","g")}</span><span>\u0412\u0435\u0440\u043D\u0443\u0442\u044C \u0441\u043D\u0430\u0441\u0442\u044C. \u041F\u043E\u0441\u043B\u0435 \u0443\u043B\u043E\u0432\u0430 \u0440\u044F\u0434\u043E\u043C \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \xAB\u041E\u0422\u041F\u0423\u0421\u0422\u0418\u0422\u042C\xBB \u2014 \u0437\u0430 \u044D\u0442\u043E \u0434\u0430\u044E\u0442 \u0431\u043E\u043B\u044C\u0448\u0435 \u043E\u043F\u044B\u0442\u0430.</span>
        <span>${t("\u0420\u042B\u041D\u041E\u041A")}</span><span>\u041A\u043D\u043E\u043F\u043A\u0430 \u043F\u043E\u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0443 \u043B\u0430\u0432\u043A\u0438 \u043D\u0430 \u0431\u0435\u0440\u0435\u0433\u0443: \u043F\u0440\u043E\u0434\u0430\u0442\u044C \u0443\u043B\u043E\u0432, \u043A\u0443\u043F\u0438\u0442\u044C \u0443\u0434\u043E\u0447\u043A\u0438, \u043B\u0435\u0441\u043A\u0443, \u043D\u0430\u0436\u0438\u0432\u043A\u0443.</span>
        <span>${t("\u0421\u041D\u0410\u0421\u0422\u0418","x")}</span><span>\u041F\u0430\u043D\u0435\u043B\u044C \u0432\u043D\u0438\u0437\u0443 \u044D\u043A\u0440\u0430\u043D\u0430: \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u043D\u0430\u0436\u0438\u0432\u043A\u0443 \u2014 \u0441\u043C\u0435\u043D\u0438\u0442\u044C \u0435\u0451, \u043D\u0430 \u0443\u0434\u043E\u0447\u043A\u0443 \u2014 \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u0432\u0441\u0435 \u0441\u043D\u0430\u0441\u0442\u0438.</span>
        <span>${t("\u2630","g")}</span><span>\u041C\u0435\u043D\u044E: \u0436\u0443\u0440\u043D\u0430\u043B \u0440\u044B\u0431, \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u0436, \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438. \u041F\u043B\u0430\u0448\u043A\u0430 \xAB\u0413\u041E\u041B\u041E\u0421\xBB \u0441\u043F\u0440\u0430\u0432\u0430 \u0441\u0432\u0435\u0440\u0445\u0443 \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0438 \u0432\u044B\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D.</span>
      </div>
      <p>\u0427\u0435\u043C \u043B\u0443\u0447\u0448\u0435 \u0443\u0434\u043E\u0447\u043A\u0430 \u2014 \u0442\u0435\u043C \u0434\u0430\u043B\u044C\u0448\u0435 \u0437\u0430\u0431\u0440\u043E\u0441: \u0434\u043E \u0440\u0438\u0444\u0430, \u0432\u043E\u0434\u043E\u043F\u0430\u0434\u0430 \u0438 \u0430\u0440\u043A\u0438 \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u043E\u0439 \u043D\u0435 \u0434\u043E\u0441\u0442\u0430\u0442\u044C. \u0422\u0451\u043C\u043D\u044B\u0435 \u0442\u0435\u043D\u0438 \u043F\u043E\u0434 \u0432\u043E\u0434\u043E\u0439 \u2014 \u043A\u043E\u0441\u044F\u043A\u0438, \u0442\u0430\u043C \u043A\u043B\u044E\u0451\u0442 \u0447\u0430\u0449\u0435 \u0438 \u043A\u0440\u0443\u043F\u043D\u0435\u0435.</p>
      <button class="btn pri" data-a="${this.popts&&this.popts.first?"close":"back"}"><span>\u041F\u041E\u041D\u042F\u0422\u041D\u041E</span></button></div>`;return}this.screen.innerHTML=`<div class="dim"></div><div class="center" style="width:min(44em,94vw)">
      <h1>\u041A\u0410\u041A \u0418\u0413\u0420\u0410\u0422\u042C</h1>
      <div class="help">
        <span>${t("W")}${t("A")}${t("S")}${t("D")}</span><span>\u0425\u043E\u0434\u0438\u0442\u044C. ${t("SHIFT","g")} \u2014 \u0431\u044B\u0441\u0442\u0440\u0435\u0435, ${t("\u041F\u0420\u041E\u0411\u0415\u041B","g")} \u2014 \u043F\u0440\u044B\u0436\u043E\u043A, ${t("X","g")} \u2014 \u0441\u0435\u0441\u0442\u044C (\u043D\u0430 \u043A\u0440\u0430\u044E \u043F\u0440\u0438\u0447\u0430\u043B\u0430 \u043D\u043E\u0433\u0438 \u0441\u0432\u0435\u0441\u044F\u0442\u0441\u044F).</span>
        <span>${t("\u041B\u041A\u041C")}</span><span><b>\u0417\u0430\u0431\u0440\u043E\u0441:</b> \u043D\u0430\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u0440\u0438\u0446\u0435\u043B \u043D\u0430 \u0432\u043E\u0434\u0443, \u0437\u0430\u0436\u043C\u0438\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0443 \u2014 \u0448\u043A\u0430\u043B\u0430 \u0441\u0438\u043B\u044B \u0440\u0430\u0441\u0442\u0451\u0442 \u2014 \u0438 \u043E\u0442\u043F\u0443\u0441\u0442\u0438\u0442\u0435. \u0411\u0435\u043B\u0430\u044F \u0440\u0438\u0441\u043A\u0430 \u043D\u0430 \u0448\u043A\u0430\u043B\u0435 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442, \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0438\u043B\u044B \u043D\u0443\u0436\u043D\u043E \u0434\u043E \u043C\u0435\u0442\u043A\u0438.</span>
        <span>${t("\u041B\u041A\u041C")}</span><span><b>\u041F\u043E\u0434\u0441\u0435\u0447\u043A\u0430:</b> \u043F\u043E\u043F\u043B\u0430\u0432\u043E\u043A \u043D\u044B\u0440\u043D\u0443\u043B \u0438 \u043F\u043E\u044F\u0432\u0438\u043B\u043E\u0441\u044C \xAB\u041A\u041B\u042E\u0401\u0422!\xBB \u2014 \u0436\u043C\u0438\u0442\u0435 \u0441\u0440\u0430\u0437\u0443.</span>
        <span>${t("\u041B\u041A\u041C")}${t("A","g")}${t("D","g")}</span><span><b>\u0412\u044B\u0432\u0430\u0436\u0438\u0432\u0430\u043D\u0438\u0435:</b> \u0434\u0435\u0440\u0436\u0438\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0443 \u2014 \u043C\u043E\u0442\u0430\u0435\u0442\u0435, \u043E\u0442\u043F\u0443\u0441\u043A\u0430\u0435\u0442\u0435 \u2014 \u043B\u0435\u0441\u043A\u0430 \u0441\u043B\u0430\u0431\u0435\u0435\u0442. \u0421\u0442\u0440\u0435\u043B\u043A\u0430 \u043D\u0430\u0442\u044F\u0436\u0435\u043D\u0438\u044F \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0432 \u0433\u043E\u043B\u0443\u0431\u043E\u0439 \u0437\u043E\u043D\u0435. \u0412 \u043A\u0440\u0430\u0441\u043D\u043E\u0439 \u043B\u0435\u0441\u043A\u0430 \u0440\u0432\u0451\u0442\u0441\u044F, \u0432 \u0436\u0451\u043B\u0442\u043E\u0439 \u0440\u044B\u0431\u0430 \u0441\u0445\u043E\u0434\u0438\u0442. \u0420\u0432\u0430\u043D\u0443\u043B\u0430 \u0432\u0431\u043E\u043A \u2014 \u0432\u0435\u0434\u0438\u0442\u0435 \u0443\u0434\u043E\u0447\u043A\u0443 \u0432 \u0434\u0440\u0443\u0433\u0443\u044E \u0441\u0442\u043E\u0440\u043E\u043D\u0443.</span>
        <span>${t("\u041F\u041A\u041C","x")} / ${t("R","b")}</span><span>\u0421\u043C\u043E\u0442\u0430\u0442\u044C \u043B\u0435\u0441\u043A\u0443. \u041F\u043E\u0441\u043B\u0435 \u0443\u043B\u043E\u0432\u0430 ${t("R","b")} \u2014 \u043E\u0442\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0440\u044B\u0431\u0443 (\u0437\u0430 \u044D\u0442\u043E \u0434\u0430\u044E\u0442 \u0431\u043E\u043B\u044C\u0448\u0435 \u043E\u043F\u044B\u0442\u0430).</span>
        <span>${t("E")}</span><span>\u0413\u043E\u0432\u043E\u0440\u0438\u0442\u044C \u0441 \u0442\u043E\u0440\u0433\u043E\u0432\u0446\u0435\u043C \u0443 \u043B\u0430\u0432\u043A\u0438 \xAB\u0420\u044B\u043D\u043E\u043A\xBB: \u043F\u0440\u043E\u0434\u0430\u0442\u044C \u0443\u043B\u043E\u0432, \u043A\u0443\u043F\u0438\u0442\u044C \u0443\u0434\u043E\u0447\u043A\u0438, \u043B\u0435\u0441\u043A\u0443, \u043D\u0430\u0436\u0438\u0432\u043A\u0443.</span>
        <span>${t("TAB","x")} ${t("Q","x")}</span><span>\u0421\u043D\u0430\u0441\u0442\u0438 \u0438 \u043D\u0430\u0431\u043E\u0440. ${t("Q","x")} \u2014 \u0431\u044B\u0441\u0442\u0440\u043E \u0441\u043C\u0435\u043D\u0438\u0442\u044C \u043D\u0430\u0436\u0438\u0432\u043A\u0443.</span>
        <span>${t("J","g")} ${t("C","g")}</span><span>\u0416\u0443\u0440\u043D\u0430\u043B \u0440\u044B\u0431 \u0438 \u0440\u0435\u0434\u0430\u043A\u0442\u043E\u0440 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u0436\u0430.</span>
        <span>${t("M","g")} ${t("V","g")} ${t("ENTER","g")}</span><span>\u041C\u0438\u043A\u0440\u043E\u0444\u043E\u043D \u0432\u043A\u043B/\u0432\u044B\u043A\u043B, \u0433\u043E\u0432\u043E\u0440\u0438\u0442\u044C \u043F\u043E \u043A\u043D\u043E\u043F\u043A\u0435, \u043D\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u0432 \u0447\u0430\u0442.</span>
        <span>${t("1","g")}${t("2","g")}${t("3","g")}${t("4","g")}</span><span>\u0416\u0435\u0441\u0442\u044B: \u043F\u0440\u0438\u0432\u0435\u0442, \u043A\u043B\u0430\u0441\u0441, \u0443\u0440\u0430, \u0442\u0430\u043D\u0435\u0446.</span>
      </div>
      <p>\u0427\u0435\u043C \u043B\u0443\u0447\u0448\u0435 \u0443\u0434\u043E\u0447\u043A\u0430 \u2014 \u0442\u0435\u043C \u0434\u0430\u043B\u044C\u0448\u0435 \u0437\u0430\u0431\u0440\u043E\u0441: \u0434\u043E \u0440\u0438\u0444\u0430, \u0432\u043E\u0434\u043E\u043F\u0430\u0434\u0430 \u0438 \u0430\u0440\u043A\u0438 \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u043E\u0439 \u043D\u0435 \u0434\u043E\u0441\u0442\u0430\u0442\u044C. \u0422\u0451\u043C\u043D\u044B\u0435 \u0442\u0435\u043D\u0438 \u043F\u043E\u0434 \u0432\u043E\u0434\u043E\u0439 \u2014 \u043A\u043E\u0441\u044F\u043A\u0438, \u0442\u0430\u043C \u043A\u043B\u044E\u0451\u0442 \u0447\u0430\u0449\u0435 \u0438 \u043A\u0440\u0443\u043F\u043D\u0435\u0435.</p>
      <button class="btn pri" data-a="${this.popts&&this.popts.first?"close":"back"}"><span>\u041F\u041E\u041D\u042F\u0422\u041D\u041E</span></button></div>`}onClick(t){let e=t.target.closest("[data-a]");if(!e)return;let i=e.dataset.a,s=e.dataset.id,r=this.g;switch(r.audio.ui(),i){case"create":case"join":case"joincode":case"solo":{let a=(Mt("#nm").value||"").trim(),o=((Mt("#code")||{}).value||"").trim().toUpperCase();if(!a){Mt("#terr").textContent="\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u044C\u0442\u0435\u0441\u044C \u2014 \u0434\u0440\u0443\u0437\u044C\u044F \u0443\u0432\u0438\u0434\u044F\u0442 \u044D\u0442\u043E \u0438\u043C\u044F",Mt("#nm").focus();return}if(i==="joincode"&&o.length!==4){Mt("#terr").textContent="\u0412 \u043A\u043E\u0434\u0435 \u043A\u043E\u043C\u043D\u0430\u0442\u044B \u0447\u0435\u0442\u044B\u0440\u0435 \u0441\u0438\u043C\u0432\u043E\u043B\u0430",Mt("#code").focus();return}r.setName(a),i==="solo"?r.startSolo():i==="create"?r.createRoom():r.joinRoom(i==="join"?r.urlCode:o);return}case"help":return this.openPanel("help");case"settings":return this.openPanel("settings");case"open":return this.openPanel(e.dataset.p);case"close":return this.closePanel();case"back":return r.inWorld?this.openPanel("pause"):this.closePanel();case"lobby":return;case"start":return r.enterWorld();case"leave":return r.leaveRoom();case"tolobby":return r.toLobby();case"voice":return r.toggleVoice();case"copy":return r.copyLink();case"cat":return this.tk.cat=s,this.tk.sel=null,this.renderTackle();case"pick":return this.tk.sel===s?this.doAction():(this.tk.sel=s,this.renderTackle());case"buy":return r.buy(s);case"equip":return r.equip(s);case"sell1":return r.sell(Number(s));case"sellall":return r.sell(null);case"jpick":return this.js=s,this.renderJournal();case"ecat":return this.ed.cat=s,this.renderEditor();case"opt":return this.ed.look[e.dataset.k]=Number(s),r.editLook(this.ed.look),this.renderEditor();case"col":return this.ed.look[e.dataset.k]=s,r.editLook(this.ed.look),this.renderEditor();case"preset":return this.ed.look={...sr[Number(s)].look},r.editLook(this.ed.look),this.renderEditor();case"rnd":return this.ed.look=E0(),r.editLook(this.ed.look),this.renderEditor();case"edsave":return r.saveLook(Ms(this.ed.look)),this.closePanel();case"edcancel":return this.closePanel();case"tog":return Fe[s]=!Fe[s],Tu(),r.applySettings(),this.renderSettings();case"reset":if(e.dataset.sure)return r.resetProgress();e.dataset.sure="1",e.classList.add("red"),e.innerHTML="<span>\u0422\u041E\u0427\u041D\u041E \u0421\u0422\u0415\u0420\u0415\u0422\u042C? \u041D\u0410\u0416\u041C\u0418\u0422\u0415 \u0415\u0429\u0401 \u0420\u0410\u0417</span>";return;default:}}onInput(t){let e=t.target;if(e.dataset.set)Fe[e.dataset.set]=e.type==="range"?Number(e.value):e.value,Tu(),this.g.applySettings();else if(e.dataset.k&&this.ed&&(this.ed.look[e.dataset.k]=e.type==="range"?Number(e.value):e.value,this.g.editLook(this.ed.look),e.type==="color"))for(let i of ou(".sw button.on",e.closest(".sw")))i.classList.remove("on")}doAction(){let t=this.g;if(this.panel==="tackle"||this.panel==="shop"){let e=Qt[this.tk.sel],i=this.actionOf(e);i.a==="buy"&&!i.dis?t.buy(e.id):(i.a==="equip"||i.also==="equip")&&t.equip(e.id)}else this.panel==="sell"?t.sell(null):this.panel==="editor"?(t.saveLook(Ms(this.ed.look)),this.closePanel()):(this.panel==="help"||this.panel==="settings")&&this.closePanel()}rerender(){this.panel==="tackle"||this.panel==="shop"?this.renderTackle():this.panel==="sell"?this.renderSell():this.panel==="journal"?this.renderJournal():this.view==="lobby"&&!this.panel&&this.showLobby()}};var xm=[[-2,9],[.6,9.4],[-4,8.2],[2.6,8.6],[-1,11],[1.6,11.4],[-3.6,11],[3.6,10.4]],ua=7,fa=n=>-5+n*1.32,ui=new D;function vm(n){try{history.replaceState(null,"",n)}catch{}}var ym=["\u0421\u0432\u0435\u0436\u0430\u044F \u0440\u044B\u0431\u0430 \u2014 \u0445\u043E\u0440\u043E\u0448\u0430\u044F \u0446\u0435\u043D\u0430. \u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0439 \u0443\u043B\u043E\u0432!","\u041A\u043B\u044E\u0451\u0442 \u0441\u0435\u0433\u043E\u0434\u043D\u044F? \u0423 \u043C\u0435\u043D\u044F \u0433\u043B\u0430\u0437 \u043D\u0430\u043C\u0451\u0442\u0430\u043D: \u0432\u0438\u0436\u0443 \u2014 \u043A\u043B\u044E\u0451\u0442.","\u0421\u0442\u0430\u0440\u0438\u043A\u0430 \u043F\u043E\u0434 \u0430\u0440\u043A\u043E\u0439 \u0432\u0438\u0434\u0435\u043B \u043A\u0442\u043E? \u0421\u043E\u0440\u043E\u043A \u043B\u0435\u0442 \u043B\u043E\u0432\u044F\u0442 \u2014 \u043D\u0435 \u043F\u043E\u0439\u043C\u0430\u043B\u0438.","\u0411\u0435\u0440\u0438 \u043F\u043B\u0435\u0442\u0451\u043D\u043A\u0443, \u043D\u0435 \u043F\u043E\u0436\u0430\u043B\u0435\u0435\u0448\u044C. \u041A\u0430\u0440\u043F \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u0443\u044E \u043B\u0435\u0441\u043A\u0443 \u0440\u0432\u0451\u0442 \u043A\u0430\u043A \u043D\u0438\u0442\u043A\u0443.","\u041D\u0430 \u0440\u0430\u0441\u0441\u0432\u0435\u0442\u0435 \u0432 \u0437\u0430\u0432\u043E\u0434\u0438, \u0433\u043E\u0432\u043E\u0440\u044F\u0442, \u0437\u043E\u043B\u043E\u0442\u043E\u0439 \u043A\u043E\u0438 \u0445\u043E\u0434\u0438\u0442.","\u041D\u043E\u0447\u044C\u044E \u0443\u0433\u043E\u0440\u044C \u043F\u043E\u0434 \u0441\u0432\u0430\u044F\u043C\u0438 \u0431\u0435\u0440\u0451\u0442 \u043D\u0430 \u0447\u0435\u0440\u0432\u044F. \u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043E."],zu=class{constructor(){let t=new URLSearchParams(location.search);this.params=t,this.urlCode=(t.get("room")||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,4),this.offline=!!window.RYBAK_OFFLINE,this.profile=tm(),this.canvas=Mt("#view");let e=i0();document.body.classList.toggle("touch",e),this.auto=Fe.quality==="auto",this.gfx=new Kc(this.canvas,t.get("q")||(this.auto?e?"medium":"high":Fe.quality)),this.world=new nh,this.scene=this.world.scene,this.camera=new ii(Fe.fov,1,.07,3400),this.camera.rotation.order="YXZ",this.scene.add(this.camera),this.input=new hh(this.canvas),this.input.touch.on=e,this.player=new dh(this.camera),this.vm=new oh(this.camera),this.vm.setLook(this.profile.look),this.vm.setVisible(!1),this.fx=new _h(this.scene),this.audio=new Sh,this.player.onStep=i=>{let s=this.player;s.wade>.05?(this.audio.splash(.3+s.wade*.5,i?.45:.2),this.fx.ripple(s.x,s.z,.6+s.wade,.9)):this.audio.step(s.onDeck,i)},this.state="title",this.solo=!1,this.code="",this.seed="title",this.t0=Date.now(),this.players=new Map,this.me={id:0,slot:0},this.hostId=0,this.sendT=0,this.emote=null,this.emoteT=0,this.editing=!1,this.frameMs=16,this.slowT=0,this.fixedHour=t.has("h")?Number(t.get("h")):null,this.timeScale=Number(t.get("ts"))||1,this.noRender=t.has("norender"),this.fishing=new yh({scene:this.scene,camera:this.camera,vm:this.vm,fx:this.fx,schools:this.world.scenery.schools,profile:this.profile,hour:()=>this.hours,emit:(i,s)=>this.onFish(i,s)}),this.fishing.makeJunk=i=>rh(i),this.ui=new Eh(this),this.ui.mapBase=_0(256),this.meChar=new Yn(this.profile.look),this.meChar.setRod(ws(this.profile.equip.rod,this.profile.equip.reel,this.profile.equip.line,1)),this.meChar.group.visible=!1,this.scene.add(this.meChar.group),this.vendor=new Yn(Ms({...sr[4].look,hat:5,top:4,topC:"#ef4444",topC2:"#f1efe6",beard:5,hairC:"#f4ead0",body:3})),this.vendor.group.position.set(-8.35,Ve,12.9),this.vendor.group.rotation.y=Math.PI/2,this.scene.add(this.vendor.group),this.net=new Mh(this.netHandlers()),this.net.getCard=()=>this.card(),this.voice=pm({send:i=>this.net.send(i),sendBinary:i=>this.net.sendBin(i),audioCtx:()=>(this.audio.start(),this.audio.ctx),onChange:i=>this.voiceChanged(i),onError:i=>this.ui.toast(i,"bad",5e3),getVolume:i=>this.voiceVolume(i)}),this.input.typing=()=>this.ui.chatOpen||document.activeElement&&/INPUT|SELECT/.test(document.activeElement.tagName),this.input.onFree=()=>this.ui.toast("\u041C\u044B\u0448\u044C \u0437\u0430\u0445\u0432\u0430\u0442\u0438\u0442\u044C \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u2014 \u0441\u043C\u043E\u0442\u0440\u0438\u0442\u0435 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435\u043C \u043C\u044B\u0448\u0438: \u0443 \u043A\u0440\u0430\u0451\u0432 \u044D\u043A\u0440\u0430\u043D\u0430 \u043A\u0430\u043C\u0435\u0440\u0430 \u0434\u043E\u0432\u043E\u0440\u0430\u0447\u0438\u0432\u0430\u0435\u0442\u0441\u044F","",6500),this.input.onLockChange=i=>{!i&&this.state==="world"&&!this.ui.panel&&!this.ui.chatOpen&&!this.input.touch.on&&performance.now()-this.input.lockedAt>700&&this.ui.openPanel("pause")},addEventListener("keydown",i=>this.onKey(i)),addEventListener("pointerdown",()=>this.audio.start(),{passive:!0}),addEventListener("beforeunload",()=>fn(this.profile)),this.bindEditorDrag(),e&&this.bindTouch(),this.applySettings(),this.ui.refreshHud(),this.ui.showTitle(),this.last=performance.now(),requestAnimationFrame(i=>this.frame(i)),setTimeout(()=>Mt("#loading").classList.add("out"),300),setTimeout(()=>Mt("#loading").remove(),1200)}nowSec(){return((this.solo||!this.net.room?Date.now():this.net.now())-this.t0)/1e3}market(){let t=Math.max(0,this.nowSec());return(!this._m||this._m.period!==Math.floor(t/600)||this._mseed!==this.seed)&&(this._m=B0(this.seed,t),this._mseed=this.seed,this.world.scenery.setBoard(this._m.hot.map(e=>Ue[e].name)),this._mAnnounced&&this.state==="world"&&this.ui.feed(`\u0420\u044B\u043D\u043E\u043A \u043E\u0431\u043D\u043E\u0432\u0438\u043B \u0446\u0435\u043D\u044B. \u0412 \u0446\u0435\u043D\u0435: <b>${this._m.hot.map(e=>Ue[e].name).join(", ")}</b>`),this._mAnnounced=!0),this._m.nextIn=600-t%600,this._m}vendorLine(){return ym[Math.floor(this.nowSec()/40)%ym.length]}card(){let t=this.profile;return{name:t.name||"\u0420\u044B\u0431\u0430\u043A",look:t.look,rod:t.equip.rod,line:t.equip.line,fl:Ss(t.equip.tackle)?t.equip.tackle:t.equip.float,lvl:Jn(t.xp).lvl}}sendCard(){this.solo||this.net.send({t:"card",card:this.card()}),this.meChar.setLook(this.profile.look),this.meChar.setRod(ws(this.profile.equip.rod,this.profile.equip.reel,this.profile.equip.line,1))}setName(t){this.profile.name=t.slice(0,16),fn(this.profile)}goFullscreen(){if(!(!this.input.touch.on||document.fullscreenElement||!/Android/i.test(navigator.userAgent)))try{let t=document.documentElement,e=t.requestFullscreen&&t.requestFullscreen({navigationUI:"hide"});e&&e.then&&e.then(()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock("landscape").catch(()=>{})).catch(()=>{})}catch{}}startSolo(){this.goFullscreen(),this.audio.start(),this.solo=!0,this.code="",this.seed="solo"+Math.floor(Math.random()*1e9),this.t0=Date.now(),this.me={id:1,slot:0},this.hostId=1,this.toLobbyState()}createRoom(){this.goFullscreen(),this.audio.start(),this.solo=!1,this.net.create(),this.ui.toast("\u0421\u043E\u0437\u0434\u0430\u044E \u043A\u043E\u043C\u043D\u0430\u0442\u0443\u2026")}joinRoom(t){this.goFullscreen(),this.audio.start(),this.solo=!1;let e=na.get();this.net.join(t,e&&e.code===t?e.token:void 0),this.ui.toast("\u0417\u0430\u0445\u043E\u0436\u0443 \u0432 \u043A\u043E\u043C\u043D\u0430\u0442\u0443\u2026")}netHandlers(){return{joined:(t,e)=>{this.code=t.code,this.seed=t.seed,this.t0=t.t0,this.me={id:t.id,slot:t.slot},this.hostId=t.host;for(let i of this.players.values())i.remote.dispose();this.players.clear();for(let i of t.players)this.addPlayer(i);vm("?room="+t.code),this.urlCode=t.code,e?(this.ui.toast("\u0421\u0432\u044F\u0437\u044C \u0432\u0435\u0440\u043D\u0443\u043B\u0430\u0441\u044C","good"),this.net.send({t:"mode",m:this.state==="world"?"world":"lobby"}),this.voice.reconnected()):this.toLobbyState(),this.rosterChanged()},in:t=>{let e=this.players.has(t.p.id);this.addPlayer(t.p),!t.back&&!e&&(this.ui.feed(`<b>${se(t.p.card.name)}</b> \u0437\u0430\u0445\u043E\u0434\u0438\u0442 \u0432 \u0431\u0443\u0445\u0442\u0443`),this.audio.tone(660,.12,"triangle",.1),this.audio.tone(880,.16,"triangle",.1,null,.1)),this.rosterChanged()},out:t=>{let e=this.players.get(t.id);e&&(this.ui.feed(`<b>${se(e.card.name)}</b> ${t.why==="lost"?"\u043F\u043E\u0442\u0435\u0440\u044F\u043B \u0441\u0432\u044F\u0437\u044C":"\u0443\u0445\u043E\u0434\u0438\u0442 \u0434\u043E\u043C\u043E\u0439"}`),e.remote.dispose(),this.players.delete(t.id),this.rosterChanged())},card:t=>{let e=this.players.get(t.id);e&&(e.card=t.card,e.remote.setCard(t.card),this.rosterChanged())},mode:t=>{let e=this.players.get(t.id);e&&(e.mode=t.m,t.m==="world"&&this.state==="world"&&this.ui.feed(`<b>${se(e.card.name)}</b> \u0431\u0435\u0440\u0451\u0442\u0441\u044F \u0437\u0430 \u0443\u0434\u043E\u0447\u043A\u0443`),this.rosterChanged())},host:t=>{this.hostId=t.id,this.rosterChanged()},sts:t=>{let e=performance.now()/1e3;for(let[i,s]of t.a){let r=this.players.get(i);r&&(r.st=s,r.remote.push(s,e))}},ev:t=>this.onRemoteEvent(t),chat:t=>{let e=t.id===this.me.id,i=this.players.get(t.id),s=e?this.profile.name:i?i.card.name:"?";this.ui.feed(`<b>${se(s)}:</b> ${se(t.text)}`,"chat"),i&&i.remote.bubble(se(t.text),6),e||this.audio.tone(900,.06,"sine",.08)},error:t=>{if(t.req==="vjoin")return this.voice.joinError(t.message);if(t.req==="join"||t.req==="create"||t.code==="REPLACED"||t.code==="NET"){let e=this.state!=="title";this.voice.leave(!0);for(let i of this.players.values())i.remote.dispose();this.players.clear(),this.backToTitle(e&&t.code==="NO_ROOM"?"\u041A\u043E\u043C\u043D\u0430\u0442\u0430 \u0437\u0430\u043A\u0440\u044B\u043B\u0430\u0441\u044C \u2014 \u0441\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u043D\u043E\u0432\u0443\u044E. \u0423\u043B\u043E\u0432 \u0438 \u0441\u043D\u0430\u0441\u0442\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u044B.":t.message)}else this.ui.toast(t.message,"bad",4e3)},down:()=>this.ui.toast("\u0421\u0432\u044F\u0437\u044C \u043F\u0440\u043E\u043F\u0430\u043B\u0430 \u2014 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u044E\u0441\u044C\u2026","bad",4e3),voice:t=>this.voice.handle(t),bin:t=>this.voice.handleBinary(t)}}addPlayer(t){let e=this.players.get(t.id);e&&e.remote.dispose(),this.players.set(t.id,{id:t.id,slot:t.slot,card:t.card,mode:t.mode,st:t.st,remote:new bh(this.scene,t)})}roster(){let t=this.voice.state,e=s=>t.roster.find(r=>r.pid===s),i=[{id:this.me.id,slot:this.me.slot,name:this.profile.name||"\u0420\u044B\u0431\u0430\u043A",look:this.profile.look,me:!0,mode:this.state==="world"?"world":"lobby",voice:t.joined,muted:t.muted,talk:t.selfSpeaking}];for(let s of this.players.values()){let r=e(s.id);i.push({id:s.id,slot:s.slot,name:s.card.name,look:s.card.look,mode:s.mode,voice:!!r,muted:r?r.muted:!0,talk:r?this.voice.isSpeaking(r.vid):!1})}return i.sort((s,r)=>s.slot-r.slot)}rosterChanged(){this.ui.setCrew(this.roster()),this.ui.view==="lobby"&&!this.ui.panel&&this.ui.showLobby()}voiceState(){let t=this.voice.state;return{on:t.joined,muted:t.muted,joining:t.joining}}voiceChanged(t){if(t==="speaking")return this.ui.setCrew(this.roster());let e=this.voice.state,i=Mt("#voiceChip");i.classList.toggle("hidden",this.solo),i.classList.toggle("off",!e.joined||e.muted);let s=this.input.touch.on?"":" \xB7 M";Mt("#voiceTxt").textContent=e.joining?"\u041F\u041E\u0414\u041A\u041B\u042E\u0427\u0410\u042E\u2026":e.joined?e.muted?`\u041C\u0418\u041A\u0420\u041E\u0424\u041E\u041D \u0412\u042B\u041A\u041B${s}`:`\u0413\u041E\u041B\u041E\u0421 \u0412\u041A\u041B\u042E\u0427\u0401\u041D${s}`:"\u0412\u041A\u041B\u042E\u0427\u0418\u0422\u042C \u0413\u041E\u041B\u041E\u0421",Mt("#voiceChip .ic").innerHTML=e.joined&&!e.muted?'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>':'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M3 3l18 18" stroke="#f04438" stroke-width="2.6" stroke-linecap="round"/></svg>',this.rosterChanged()}voiceVolume(t){let e=Fe.voiceVol;if(Fe.near&&this.state==="world"){let i=this.voice.pidOf(t),s=this.players.get(i);s&&s.mode==="world"&&s.st&&(e*=ne(1.25-Math.hypot(s.st[ke.X]-this.player.x,s.st[ke.Z]-this.player.z)/42,.1,1))}return e}async toggleVoice(){if(this.solo)return;this.audio.start();let t=this.voice.state;t.joining||(t.joined?(this.voice.setMuted(!t.muted),this.ui.toast(t.muted?"\u041C\u0438\u043A\u0440\u043E\u0444\u043E\u043D \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D":"\u041C\u0438\u043A\u0440\u043E\u0444\u043E\u043D \u0432\u043A\u043B\u044E\u0447\u0451\u043D",t.muted?"":"good",1400)):(await this.voice.join()).ok&&(this.ui.toast("\u0413\u043E\u043B\u043E\u0441 \u0432\u043A\u043B\u044E\u0447\u0451\u043D \u2014 \u0434\u0440\u0443\u0437\u044C\u044F \u0432\u0430\u0441 \u0441\u043B\u044B\u0448\u0430\u0442","good"),Fe.ptt&&this.voice.setMuted(!0)))}copyLink(){let t=`${location.origin}/?room=${this.code}`,e=()=>this.ui.toast(`\u0421\u0441\u044B\u043B\u043A\u0430 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0430: ${t}`,"good",3500);navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t).then(e,()=>this.ui.toast(t,"",8e3)):this.ui.toast(t,"",8e3)}sendChat(t){if(this.solo)return this.ui.feed(`<b>${se(this.profile.name)}:</b> ${se(t)}`,"chat");this.net.send({t:"chat",text:t})}toLobbyState(){this.state="lobby",this.inWorld=!1,this.fishing.reelIn(!0),this.vm.setVisible(!1),this.input.enabled=!1,this.input.unlock(),this.ui.hudShow(!1),this.ui.catchCard(null),this.ui.alert(null),this.ui.banner(null),this.ui.hideScreen(),this.ui.showLobby(),this.voiceChanged(),this.market(),this.solo||this.net.send({t:"mode",m:"lobby"})}toLobby(){if(this.fishing.state==="fight")return this.ui.toast("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0432\u044B\u0442\u0430\u0449\u0438\u0442\u0435 \u0440\u044B\u0431\u0443","bad");this.ui.panel=null,this.toLobbyState()}enterWorld(){this.audio.start(),this.state="world",this.inWorld=!0;let t=xm[this.me.slot%xm.length];this.player.place(t[0],t[1],0),this.player.eye=1.62*this.profile.look.height,this.ui.hideScreen(),this.ui.setPlates([]),this.ui.hudShow(!0),this.ui.refreshHud(),this.meChar.group.visible=!1,this.vm.setVisible(!0),this.fishing.refreshGear(),this.rosterChanged(),this.solo||this.net.send({t:"mode",m:"world"}),this.profile.seenIntro?(this.input.enabled=!0,this.input.lock()):(this.profile.seenIntro=!0,fn(this.profile),this.ui.openPanel("help",{first:!0}))}leaveRoom(){this.voice.leave(!0),this.solo||this.net.leave();for(let t of this.players.values())t.remote.dispose();this.players.clear(),this.solo=!1,vm(location.pathname),this.urlCode="",this.backToTitle("")}backToTitle(t){this.state="title",this.inWorld=!1,this.fishing.reelIn(!0),this.vm.setVisible(!1),this.meChar.group.visible=!1,this.input.enabled=!1,this.input.unlock(),this.ui.hudShow(!1),this.ui.setPlates([]),this.ui.panel=null,this.ui.showTitle(t)}onPanel(t,e){if(t){this.input.enabled=!1,this.input.unlock(),t==="editor"&&this.startEdit();return}e==="editor"&&this.endEdit(),this.state==="world"?(this.ui.hideScreen(),this.input.enabled=!0,this.input.lock()):this.state==="lobby"?this.ui.showLobby():this.ui.showTitle()}startEdit(){this.editing=!0,this.editYaw=.35,this.state==="world"&&(this.meChar.group.position.set(this.player.x,this.player.y,this.player.z),this.editBase=this.player.yaw),this.vm.setVisible(!1)}endEdit(){this.editing=!1,this.meChar.setLook(this.profile.look),this.state==="world"&&(this.meChar.group.visible=!1,this.vm.setVisible(!0))}editLook(t){this.meChar.setLook(t)}saveLook(t){this.profile.look=t,fn(this.profile),this.vm.setLook(t),this.player.eye=1.62*t.height,this.sendCard(),this.rosterChanged(),this.ui.toast("\u041E\u0431\u0440\u0430\u0437 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D","good")}bindEditorDrag(){let t=null;this.canvas.addEventListener("pointerdown",e=>{this.editing&&(t=e.clientX)}),addEventListener("pointermove",e=>{t==null||!this.editing||(this.editYaw+=(e.clientX-t)*.012,t=e.clientX)}),addEventListener("pointerup",()=>t=null),addEventListener("pointercancel",()=>t=null)}buy(t){let e=X0(this.profile,t);if(!e.ok)return this.audio.error(),this.ui.toast(e.error,"bad");this.audio.buy(),this.ui.toast(`\u041A\u0443\u043F\u043B\u0435\u043D\u043E: ${Qt[t].name}`,"good"),!Qt[t].count&&!this.solo&&this.net.send({t:"ev",k:"buy",d:{id:t}}),this.afterGear()}equip(t){let e=q0(this.profile,t);if(!e.ok)return this.ui.toast(e.error,"bad");this.audio.tick(),this.afterGear()}afterGear(){fn(this.profile),this.fishing.state!=="fight"&&this.fishing.state!=="landed"?(this.fishing.reelIn(!0),this.fishing.refreshGear()):this.fishing.pendingGear=!0,this.sendCard(),this.ui.refreshHud(),this.ui.rerender()}sell(t){let e=this.market(),i=K0(this.profile,t,e);if(!i.ok)return this.ui.toast(i.error,"bad");this.audio.coin(t==null?4:1),this.ui.toast(`+${En(i.total)} \u043C\u043E\u043D\u0435\u0442`,"gold"),!this.solo&&i.total>=50&&this.net.send({t:"ev",k:"sold",d:{n:i.n,total:i.total}}),fn(this.profile),this.ui.refreshHud(),this.ui.rerender()}cycleTackle(){let t=this.profile,e=[...yu,..._u].map(r=>r.id).filter(r=>jn(t,r)>0),i=e.indexOf(t.equip.tackle),s=e[(i+1)%e.length];if(s===t.equip.tackle)return this.ui.toast("\u0414\u0440\u0443\u0433\u043E\u0439 \u043D\u0430\u0436\u0438\u0432\u043A\u0438 \u043D\u0435\u0442 \u2014 \u043A\u0443\u043F\u0438\u0442\u0435 \u043D\u0430 \u0440\u044B\u043D\u043A\u0435");this.equip(s),this.ui.toast(`\u041D\u0430 \u043A\u0440\u044E\u0447\u043A\u0435: ${Qt[s].name}`,"",1400)}resetProgress(){let t=this.profile.name,e=this.profile.look;Object.assign(this.profile,Oo(),{name:t,look:e,seenIntro:!0}),fn(this.profile),this.fishing.reelIn(!0),this.fishing.refreshGear(),this.sendCard(),this.ui.refreshHud(),this.ui.closePanel(),this.ui.toast("\u041D\u0430\u0447\u0438\u043D\u0430\u0435\u043C \u0441 \u0447\u0438\u0441\u0442\u043E\u0433\u043E \u043B\u0438\u0441\u0442\u0430","good")}applySettings(){this.camera.fov=Fe.fov,this.camera.updateProjectionMatrix(),this.audio.applyVolume(),this.auto=Fe.quality==="auto",!this.auto&&!this.params.get("q")&&this.gfx.setQuality(Fe.quality),this.ui.hintKey=""}ev(t,e){this.solo||this.net.send({t:"ev",k:t,d:e})}rumble(t,e){let i=navigator.getGamepads?[...navigator.getGamepads()].find(s=>s&&s.vibrationActuator):null;i?i.vibrationActuator.playEffect("dual-rumble",{duration:t,strongMagnitude:e,weakMagnitude:e*.6}).catch(()=>{}):navigator.vibrate&&this.input.touch.on&&navigator.vibrate(t)}onFish(t,e){let i=this.ui,s=this.audio,r=this.profile;switch(t){case"toast":return i.toast(e);case"cast":return s.cast(),this.ev("cast",{x:+e.x.toFixed(1),z:+e.z.toFixed(1)});case"land":return s.splash(.5),e.short?i.toast("\u041D\u0435\u0434\u043E\u043B\u0451\u0442: \u0434\u0435\u0440\u0436\u0438\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0443 \u0434\u043E\u043B\u044C\u0448\u0435 \u2014 \u0434\u043E \u0431\u0435\u043B\u043E\u0439 \u0440\u0438\u0441\u043A\u0438","",2200):e.hot&&i.toast("\u041F\u0440\u044F\u043C\u043E \u0432 \u043A\u043E\u0441\u044F\u043A!","good",1600),this.ev("land",{x:+e.x.toFixed(1),z:+e.z.toFixed(1)});case"nibble":return s.nibble();case"early":return i.toast("\u0420\u0430\u043D\u043E! \u0416\u0434\u0438\u0442\u0435, \u043F\u043E\u043A\u0430 \u043F\u043E\u043F\u043B\u0430\u0432\u043E\u043A \u043D\u044B\u0440\u043D\u0451\u0442","",1500);case"bite":return s.bite(),this.rumble(250,1),i.alert("\u041A\u041B\u042E\u0401\u0422!",`${i.key("primary")} \u041F\u041E\u0414\u0421\u0415\u041A\u0410\u0419`),this.ev("bite",{x:+this.fishing.bx.toFixed(1),z:+this.fishing.bz.toFixed(1)});case"missed":return i.alert(null),s.fail(),i.toast(e.switched?"\u0421\u043E\u0440\u0432\u0430\u043B\u0430\u0441\u044C. \u041D\u0430\u0436\u0438\u0432\u043A\u0430 \u043A\u043E\u043D\u0447\u0438\u043B\u0430\u0441\u044C \u2014 \u043D\u0430 \u043A\u0440\u044E\u0447\u043A\u0435 \u0445\u043B\u0435\u0431":"\u041D\u0435 \u0443\u0441\u043F\u0435\u043B\u0438 \u2014 \u0440\u044B\u0431\u0430 \u0443\u0448\u043B\u0430 \u0441 \u043D\u0430\u0436\u0438\u0432\u043A\u043E\u0439","bad",2e3),i.refreshHud(),fn(r);case"bait":i.refreshHud(),e.switched&&i.toast("\u042D\u0442\u043E \u0431\u044B\u043B\u0430 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u044F\u044F \u043D\u0430\u0436\u0438\u0432\u043A\u0430 \u2014 \u0434\u0430\u043B\u044C\u0448\u0435 \u043D\u0430 \u0445\u043B\u0435\u0431","",2600);return;case"hook":{i.alert(null),i.banner("\u041D\u0410 \u041A\u0420\u042E\u0427\u041A\u0415!"),s.hook(),this.rumble(120,.6);let a=this.fishing.catch;return this.ev("hook",{sp:a.sp,len:a.len})}case"warn":return s.warn();case"run":return s.splash(.6),this.rumble(180,.8);case"jump":return s.splash(1),this.ev("jump",{x:+e.x.toFixed(1),z:+e.z.toFixed(1)});case"lost":{i.banner(e.why==="snap"?"\u041E\u0411\u0420\u042B\u0412!":"\u0421\u041E\u0428\u041B\u0410!","red",1600),s.strain(-1),e.why==="snap"?s.snap():s.fail(),this.player.shake=1;let a=Ue[e.sp],o=a&&e.w>2?` \u041F\u043E\u0445\u043E\u0436\u0435, \u044D\u0442\u043E \u0431\u044B\u043B\u0430 ${a.rar>=3?"\u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0430\u044F \u0433\u0440\u043E\u043C\u0430\u0434\u0438\u043D\u0430":"\u043A\u0440\u0443\u043F\u043D\u0430\u044F \u0440\u044B\u0431\u0430"}.`:"";return i.toast(e.why==="snap"?`\u041B\u0435\u0441\u043A\u0430 \u043B\u043E\u043F\u043D\u0443\u043B\u0430: \u0434\u0435\u0440\u0436\u0430\u043B\u0438 \u0432 \u043A\u0440\u0430\u0441\u043D\u043E\u0439 \u0437\u043E\u043D\u0435.${e.lostLure?" \u041F\u0440\u0438\u043C\u0430\u043D\u043A\u0430 \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u0430.":""}${o}`:`\u0420\u044B\u0431\u0430 \u0441\u043E\u0448\u043B\u0430: \u043B\u0435\u0441\u043A\u0430 \u043F\u0440\u043E\u0432\u0438\u0441\u043B\u0430.${o}`,"bad",3600),i.refreshHud(),fn(r),this.ev("lost",{why:e.why})}case"caught":{let a=e.c,o=Ue[a.sp];return i.banner(null),s.strain(-1),s.catch(o?o.rar:0),i.catchCard(e),this.rumble(300,.5),this.ev("catch",{sp:a.sp,w:a.w,len:a.len,trophy:a.trophy})}case"kept":{i.catchCard(null);let a=e.c,o=Ue[a.sp];return e.forced?i.toast("\u0421\u0430\u0434\u043E\u043A \u043F\u043E\u043B\u043E\u043D \u2014 \u0440\u044B\u0431\u0443 \u043F\u0440\u0438\u0448\u043B\u043E\u0441\u044C \u043E\u0442\u043F\u0443\u0441\u0442\u0438\u0442\u044C. \u041F\u0440\u043E\u0434\u0430\u0439\u0442\u0435 \u0443\u043B\u043E\u0432 \u043D\u0430 \u0440\u044B\u043D\u043A\u0435","bad",3600):e.released?i.toast(`\u041E\u0442\u043F\u0443\u0449\u0435\u043D\u0430. \u041E\u043F\u044B\u0442 +${e.xp}`,"good",1800):i.toast(`\u0412 \u0441\u0430\u0434\u043E\u043A. \u041E\u043F\u044B\u0442 +${e.xp}`,"good",1600),e.isNew&&o&&i.toast(`\u041D\u043E\u0432\u044B\u0439 \u0432\u0438\u0434 \u0432 \u0436\u0443\u0440\u043D\u0430\u043B\u0435: ${o.name}`,"gold",3200),e.levelUp&&(s.level(),i.toast(`\u0423\u0440\u043E\u0432\u0435\u043D\u044C ${e.levelUp} \u2014 ${Jn(r.xp).title}!`,"gold",4e3),this.sendCard()),i.refreshHud(),fn(r)}case"reelin":return s.reelTicks(5,.035);default:}}onRemoteEvent(t){let e=this.players.get(t.id);if(!e)return;let i=t.d||{},s=`<b>${se(e.card.name)}</b>`;e.remote.event(t.k,i,this.state==="world"||this.state==="lobby"?this.fx:null);let r=e.st?Math.hypot(e.st[ke.X]-this.player.x,e.st[ke.Z]-this.player.z):99,a=ne(1.1-r/40,.1,1);if(t.k==="land"||t.k==="bite")this.audio.splash(.4,a);else if(t.k==="jump")this.audio.splash(.9,a);else if(t.k==="catch"){let o=Ue[i.sp],l=Zn[i.sp],c=o?o.name:l?l.name:"?",u=o?Sn[o.rar].color:"#cbd5e1";this.ui.feed(`${s} \u2014 <b style="color:${u}">${se(c)}</b>, ${un(Number(i.w)||0)}${i.trophy?" \xB7 \u0442\u0440\u043E\u0444\u0435\u0439!":""}`),e.remote.bubble(`${se(c)} \xB7 ${un(Number(i.w)||0)}`,6),o&&o.rar>=3&&(this.ui.toast(`${se(e.card.name)} \u0432\u044B\u0442\u0430\u0449\u0438\u043B: ${o.name}, ${un(i.w)}!`,"gold",5e3),this.audio.catch(o.rar))}else t.k==="lost"?e.remote.bubble(i.why==="snap"?"\u041E\u0431\u0440\u044B\u0432!":"\u0421\u043E\u0448\u043B\u0430\u2026",3):t.k==="sold"?this.ui.feed(`${s} \u043F\u0440\u043E\u0434\u0430\u043B \u0443\u043B\u043E\u0432 \u043D\u0430 <b class="y">${En(Number(i.total)||0)}</b> \u043C\u043E\u043D\u0435\u0442`):t.k==="buy"&&Qt[i.id]&&this.ui.feed(`${s} \u043A\u0443\u043F\u0438\u043B: <b>${se(Qt[i.id].name)}</b>`)}onKey(t){let e=this.ui;if(e.chatOpen){t.code==="Escape"&&(this.input.lockedAt=performance.now(),e.chat(!1));return}if(document.activeElement&&document.activeElement.tagName==="INPUT"&&document.activeElement.type!=="range"){if(t.code==="Enter"&&this.state==="title"){let i=Mt(".tcard .btn.pri");i&&i.click()}return}if(t.code==="KeyM")return this.toggleVoice();if(e.panel)return t.code==="Escape"||t.code==="Tab"&&(e.panel==="tackle"||e.panel==="shop")?(t.preventDefault(),e.panel!=="pause"&&this.state==="world"&&e.popts&&e.popts.fromPause?e.openPanel("pause"):e.closePanel()):t.code==="KeyE"||t.code==="Enter"?e.doAction():void 0;this.state==="lobby"&&(t.code==="Enter"||t.code==="Space"?this.enterWorld():t.code==="Escape"?this.leaveRoom():t.code==="Tab"?(t.preventDefault(),e.openPanel("tackle")):t.code==="KeyC"?e.openPanel("editor"):t.code==="KeyJ"&&e.openPanel("journal"))}worldKeys(){let t=this.input,e=this.ui,i=this.fishing;if(e.panel)return e.prompt("");if(t.hit("Enter")&&!this.solo)return e.chat(!0);if(t.hit("Escape"))return e.openPanel("pause");let s=i.state==="fight"||i.state==="landed";if(t.hit("Tab"))return s?e.toast("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0432\u044B\u0442\u0430\u0449\u0438\u0442\u0435 \u0440\u044B\u0431\u0443"):e.openPanel("tackle");if(t.hit("KeyJ")&&!s)return e.openPanel("journal");if(t.hit("KeyC")&&!s)return e.openPanel("editor");t.hit("KeyQ")&&!s&&this.cycleTackle(),t.hit("KeyX")&&!i.lineOut&&this.player.toggleSit();for(let[o,l]of[["Digit1","wave"],["Digit2","thumb"],["Digit3","cheer"],["Digit4","dance"]])t.hit(o)&&(this.emote=l,this.emoteT=2.6,this.ev("emote",{k:l}),e.toast({wave:"\u041F\u0440\u0438\u0432\u0435\u0442!",thumb:"\u041A\u043B\u0430\u0441\u0441!",cheer:"\u0423\u0440\u0430!",dance:"\u0422\u0430\u043D\u0446\u0443\u0435\u043C"}[l],"",900));if(Fe.ptt&&this.voice.state.joined){let o=t.keys.has("KeyV");o===this.voice.state.muted&&this.voice.setMuted(!o)}let r=Math.hypot(this.player.x-Js.x,this.player.z-Js.z)<Js.r&&!i.lineOut,a=!t.grab&&!t.touch.on&&t.device!=="pad";e.prompt(a?"\u041A\u041B\u0418\u041A\u041D\u0418\u0422\u0415 \u041F\u041E \u0418\u0413\u0420\u0415 \u2014 \u0412\u0417\u042F\u0422\u042C \u0423\u041F\u0420\u0410\u0412\u041B\u0415\u041D\u0418\u0415":r?t.touch.on?"\u0420\u042B\u041D\u041E\u041A \u2014 \u041F\u0420\u041E\u0414\u0410\u0422\u042C \u0423\u041B\u041E\u0412, \u041A\u0423\u041F\u0418\u0422\u042C \u0421\u041D\u0410\u0421\u0422\u0418":`${e.key("use")} \u0420\u042B\u041D\u041E\u041A \u2014 \u041F\u0420\u041E\u0414\u0410\u0422\u042C \u0423\u041B\u041E\u0412, \u041A\u0423\u041F\u0418\u0422\u042C \u0421\u041D\u0410\u0421\u0422\u0418`:""),this.nearMarket=r,r&&t.hit("KeyE")&&e.openPanel("sell")}hints(){let t=this.ui,e=this.fishing,i=r=>t.key(r),s='<i class="sep"></i>';switch(e.state){case"idle":return`<span>${i("primary")} \u0423\u0414\u0415\u0420\u0416\u0418\u0412\u0410\u0419 \u2014 \u0417\u0410\u0411\u0420\u041E\u0421</span>${s}<span>${i("tackle")} \u0421\u041D\u0410\u0421\u0422\u0418</span>`;case"charge":return`<span>\u041E\u0422\u041F\u0423\u0421\u0422\u0418 \u2014 \u0417\u0410\u0411\u0420\u041E\u0421</span>${s}<span>\u0414\u041E \u0411\u0415\u041B\u041E\u0419 \u0420\u0418\u0421\u041A\u0418 \u2014 \u0422\u041E\u0427\u041D\u041E \u0412 \u041C\u0415\u0422\u041A\u0423</span>`;case"cast":return"<span>\u041B\u0415\u0422\u0418\u0422\u2026</span>";case"wait":return e.lure?`<span>${i("primary")} \u0414\u0415\u0420\u0416\u0418 \u2014 \u0412\u0415\u0414\u0418 \u041F\u0420\u0418\u041C\u0410\u041D\u041A\u0423</span>${s}<span>${i("back")} \u0421\u041C\u041E\u0422\u0410\u0422\u042C</span>`:`<span>\u0416\u0414\u0401\u041C \u041F\u041E\u041A\u041B\u0401\u0412\u041A\u0423</span>${s}<span>${i("back")} \u0421\u041C\u041E\u0422\u0410\u0422\u042C</span>`;case"bite":return`<span>${i("primary")} \u041F\u041E\u0414\u0421\u0415\u041A\u0410\u0419!</span>`;case"fight":return`<span>${i("primary")} \u041C\u041E\u0422\u0410\u0422\u042C</span>${s}<span>\u041E\u0422\u041F\u0423\u0421\u0422\u0418 \u2014 \u041E\u0421\u041B\u0410\u0411\u0418\u0422\u042C</span>${s}<span>${i("left")}${i("right")} \u0412\u0415\u0421\u0422\u0418</span>`;case"landed":return`<span>${i("primary")} \u0412 \u0421\u0410\u0414\u041E\u041A</span>${s}<span>${i("release")} \u041E\u0422\u041F\u0423\u0421\u0422\u0418\u0422\u042C</span>`;default:return""}}bindTouch(){let t=this.input.touch,e=Mt("#stick"),i=e.firstElementChild;Mt(".hud-tl").insertBefore(Mt(".chip.bag"),Mt("#crew"));let s=null,r=null,a=0,o=0,l=h=>{for(let d of h.changedTouches)if(d.identifier===s){let f=e.getBoundingClientRect(),p=(d.clientX-f.left-f.width/2)/(f.width/2),x=(d.clientY-f.top-f.height/2)/(f.height/2),m=Math.hypot(p,x);m>1&&(p/=m,x/=m),t.mx=p,t.mz=-x,i.style.transform=`translate(${p*2.6}em,${x*2.6}em)`}else d.identifier===r&&(this.input.lookDX+=(d.clientX-a)*2.4,this.input.lookDY+=(d.clientY-o)*2.4,a=d.clientX,o=d.clientY)},c=h=>{for(let d of h.changedTouches)d.identifier===s?(s=null,t.mx=t.mz=0,i.style.transform=""):d.identifier===r&&(r=null)};this.touchReset=()=>{s=r=null,t.mx=t.mz=0,t.primary=!1,i.style.transform=""},e.addEventListener("touchstart",h=>{s=h.changedTouches[0].identifier,l(h),h.preventDefault()},{passive:!1}),this.canvas.addEventListener("touchstart",h=>{let d=h.changedTouches[0];r=d.identifier,a=d.clientX,o=d.clientY},{passive:!0}),addEventListener("touchmove",l,{passive:!0}),addEventListener("touchend",c),addEventListener("touchcancel",c);let u=(h,d,f)=>{let p=Mt(h);p.addEventListener("touchstart",m=>{m.preventDefault(),this.audio.start(),d()},{passive:!1});let x=m=>{m.preventDefault(),f&&f()};p.addEventListener("touchend",x,{passive:!1}),p.addEventListener("touchcancel",x,{passive:!1})};u("#tAct",()=>{t.primary=!0,this.input.pressed.add("Primary")},()=>t.primary=!1),u("#tE",()=>this.input.pressed.add("KeyE")),u("#tR",()=>this.input.pressed.add("KeyR")),u("#tMenu",()=>this.input.pressed.add("Escape")),u("#tSit",()=>this.input.pressed.add("KeyX")),u("#tChat",()=>this.input.pressed.add("Enter")),Mt("#hotbar").addEventListener("touchstart",h=>{h.preventDefault();let d=h.target.closest(".slot");this.input.pressed.add(d&&d.dataset.k==="bait"?"KeyQ":"Tab")},{passive:!1}),Mt("#rotate button").addEventListener("click",()=>document.body.classList.add("anyway"))}touchUi(){let t=this.fishing,e=this.ui,i=this.state==="world"&&!e.panel&&!e.chatOpen,s=i?t.state:"off",r=`${s}|${t.lure?1:0}|${this.nearMarket?1:0}|${this.solo?1:0}|${this.player.sit?1:0}`;if(r!==this.touchKey){if(this.touchKey=r,Mt("#touch").classList.toggle("hidden",!i),!i)return this.touchReset();Mt("#tAct").textContent={idle:"\u0417\u0410\u0411\u0420\u041E\u0421",charge:"\u041E\u0422\u041F\u0423\u0421\u0422\u0418",cast:"\u2026",wait:t.lure?"\u0412\u0415\u0414\u0418":"\u0416\u0414\u0401\u041C",bite:"\u041F\u041E\u0414\u0421\u0415\u041A\u0410\u0419",fight:"\u041C\u041E\u0422\u0410\u0419",landed:"\u0412 \u0421\u0410\u0414\u041E\u041A"}[s]||"\u0417\u0410\u0411\u0420\u041E\u0421",Mt("#tAct").classList.toggle("dim",s==="cast"||s==="wait"&&!t.lure),Mt("#tAct").classList.toggle("go",s==="bite"),Mt("#tR").textContent=s==="landed"?"\u041E\u0422\u041F\u0423\u0421\u0422\u0418\u0422\u042C":"\u0421\u041C\u041E\u0422\u0410\u0422\u042C",Mt("#tR").classList.toggle("hidden",s!=="landed"&&s!=="wait"),Mt("#tE").classList.toggle("hidden",!(this.nearMarket&&s==="idle")),Mt("#tSit").classList.toggle("hidden",s!=="idle"||this.nearMarket),Mt("#tSit").textContent=this.player.sit?"\u0412\u0421\u0422\u0410\u0422\u042C":"\u0421\u0415\u0421\u0422\u042C",Mt("#tChat").classList.toggle("hidden",this.solo||s==="fight"||s==="landed"),Mt("#hotbar").classList.toggle("hidden",s==="fight"||s==="charge"),Mt("#stick").classList.toggle("steer",s==="fight")}}frame(t){requestAnimationFrame(f=>this.frame(f));let e=Math.min(.1,(t-this.last)/1e3)*this.timeScale;if(this.last=t,this.gfx.resize()){this.camera.aspect=this.gfx.w/this.gfx.h,this.camera.updateProjectionMatrix(),this.fishing.line.resize(this.gfx.w,this.gfx.h);for(let f of this.players.values())f.remote.line.resize(this.gfx.w,this.gfx.h)}let i=this.input;i.poll();let s=this.nowSec();this.hours=this.fixedHour!=null?this.fixedHour:this.state==="title"?10.5+Math.sin(s*.01):A0(s,8),this.world.setClock(this.hours),this.audio.night=this.world.night;let r=this.state==="title"?t/1e3:s,a=this.camera,o=this.ui;if(this.state==="world"){this.worldKeys();let f=this.fishing,p=!f.lineOut&&!o.panel;if(!o.panel||!this.editing){o.panel&&(i.lookDX=i.lookDY=0),this.player.update(e,i,p),f.update(e,r,i,this.player);let _=f.view();_.speed=this.player.speed,_.steer=i.steer,_.lookDX=i.lookDX,_.lookDY=i.lookDY,this.vm.update(e,_)}o.setHints(this.hints()),o.clock(this.hours),o.compass(this.player.yaw);let x=f.kit;o.minimap(this.player,[...this.players.values()].filter(g=>g.mode==="world"&&g.st).map(g=>({x:g.st[ke.X],z:g.st[ke.Z],slot:g.slot})),x.sonar?this.world.scenery.schools.centers:null);let m=f.aim;if(!o.panel&&(f.state==="idle"&&i.enabled&&(i.grab||i.touch.on)||f.state==="charge")?(ui.set(m.x,.05,m.z).project(a),o.castMark({x:(ui.x*.5+.5)*this.gfx.w,y:(-ui.y*.5+.5)*this.gfx.h,ok:m.ok,hot:m.spot&&m.spot.hot,clamped:m.clamped,dist:m.dist,zone:m.spot?Kn[m.spot.zone].name:"",depth:m.spot?m.spot.depth:0,act:m.act})):o.castMark(null),o.power(f.state==="charge"?f.power:null,m.dist/x.cast),Mt("#cross").className=!i.grab&&!i.touch.on?"off":f.state==="idle"&&!m.ok?"bad":"",o.fight(f.state==="fight"?f.fight:null,i.steer),f.state==="fight"?(this.audio.strain(f.fight.T),f.fight.T>.78&&(this.player.shake=Math.max(this.player.shake,.5)),i.hold&&(this.tickT=(this.tickT||0)-e,this.tickT<=0&&(this.tickT=.07,this.audio.tick()))):f.state==="wait"&&f.reeling&&(this.tickT=(this.tickT||0)-e,this.tickT<=0&&(this.tickT=.11,this.audio.tick())),this.emoteT>0&&(this.emoteT-=e),this.sendT-=e,this.sendT<=0&&!this.solo&&this.net.open){this.sendT=1/12;let g=f.net(this.netOut||(this.netOut={})),_=this.player,b=g.flags|(_.sit?Cn.sit:0)|(_.dangle&&_.sit?Cn.dangle:0);this.net.send({t:"st",s:[_.x,_.y+_.jump,_.z,_.yaw,_.pitch,_.speed,g.fs,g.bx,g.by,g.bz,g.t,b,g.k,i.steer,0]})}}else(this.state==="lobby"||this.state==="title")&&(this.state==="title"||!this.editing)&&this.lobbyCamera(e,t/1e3);this.editing&&this.editCamera(e);let l=performance.now()/1e3,c=[],u=[],h=this.state==="lobby"&&!o.panel;for(let f of this.players.values()){let p=f.remote,x=this.voice.vidOf(f.id);if(p.talk=x!=null?this.voice.level(x):0,f.mode==="world"?p.update(e,l,r,this.fx,!!f.st):p.lobbyPose(e,fa(f.slot),Ve,ua,f.slot%3+1),this.state==="world"&&p.char.group.visible){p.head(ui);let m=ui.distanceTo(a.position);ui.project(a);let g=ui.z<1&&m<70&&Math.abs(ui.x)<1.1&&Math.abs(ui.y)<1.1;c.push({id:f.id,x:(ui.x*.5+.5)*this.gfx.w,y:(-ui.y*.5+.5)*this.gfx.h,name:f.card.name,slot:f.slot,talk:p.talk>.08,say:p.sayT>0?p.say:"",vis:g,scale:ne(1.25-m/40,.62,1.1)})}else h&&f.mode!=="world"&&(ui.set(fa(f.slot),Ve-.04,ua).project(a),u.push({id:f.id,x:(ui.x*.5+.5)*this.gfx.w,y:(-ui.y*.5+.5)*this.gfx.h,name:f.card.name,slot:f.slot,host:f.id===this.hostId,mode:f.mode,talk:p.talk>.08}))}this.state==="world"&&o.setTags(c),i.touch.on&&this.touchUi();let d=this.state==="lobby"||!!this.editing;if(this.meChar.group.visible=d,d&&(this.state==="lobby"&&this.meChar.group.position.set(fa(this.me.slot),Ve,ua),this.meChar.group.rotation.y=this.editing?this.editYaw+(this.state==="world"?this.editBase+Math.PI:0):0,this.meChar.rod&&(this.meChar.rod.group.visible=!this.editing),this.meChar.update(e,{mode:this.editing?"idle":"hold",variant:this.editing?0:1,talk:this.voice.state.selfSpeaking?.5:0}),h&&(ui.set(fa(this.me.slot),Ve-.04,ua).project(a),u.push({id:0,x:(ui.x*.5+.5)*this.gfx.w,y:(-ui.y*.5+.5)*this.gfx.h,name:this.profile.name,slot:this.me.slot,host:this.me.id===this.hostId&&!this.solo,me:!0,mode:"lobby",talk:this.voice.state.selfSpeaking}))),o.setPlates(h?u:[]),this.state==="world"&&(this.crewT=(this.crewT||0)-e)<=0&&(this.crewT=.25,o.setCrew(this.roster()),this.market()),this.vendor.update(e,{mode:"idle",variant:o.panel==="sell"||o.panel==="shop"?1:0,talk:o.panel==="sell"?.3:0}),this.world.scenery.schools.update(Eu(this.seed),Math.max(0,s)),this.world.update(e,r,a),this.fx.update(e,r),(!this.noRender||window.__render)&&(window.__render=!1,this.gfx.render(this.scene,a,this.world.exposure),window.__rendered=(window.__rendered||0)+1),!this.shot&&this.state==="title"&&!this.noRender&&this.takeShot(),i.endFrame(),window.__frames=(window.__frames||0)+1,this.frameMs=this.frameMs*.95+e*1e3*.05,this.auto&&this.state==="world"&&!this.params.get("q")&&(this.slowT=this.frameMs>30?this.slowT+e:Math.max(0,this.slowT-e),this.slowT>4)){this.slowT=0;let f=this.gfx.quality==="high"?"medium":this.gfx.quality==="medium"?"low":null;f&&this.gfx.setQuality(f)}}takeShot(){let t=document.createElement("canvas");t.width=560,t.height=350;let e=this.camera,i=[e.position.clone(),e.rotation.clone(),e.fov];e.position.set(-9,3.4,1.5),e.rotation.set(.02,-.36,0,"YXZ"),e.fov=50,e.aspect=1.6,e.updateProjectionMatrix(),this.world.update(0,performance.now()/1e3,e),this.gfx.renderer.render(this.scene,e);try{let s=this.gfx.renderer.domElement,r=Math.max(t.width/s.width,t.height/s.height);t.getContext("2d").drawImage(s,(t.width-s.width*r)/2,(t.height-s.height*r)/2,s.width*r,s.height*r),this.shot=t.toDataURL("image/jpeg",.86)}catch{this.shot="data:,"}e.position.copy(i[0]),e.rotation.copy(i[1]),e.fov=i[2],e.aspect=this.gfx.w/this.gfx.h,e.updateProjectionMatrix()}lobbyCamera(t,e){let i=this.camera;if(this.state==="title"){let s=e*.035;i.position.set(-10+Math.sin(s)*9,4.2+Math.sin(s*.7)*.8,3+Math.cos(s)*5),i.lookAt(14+Math.sin(s)*6,6,-70),i.fov=52}else{let s=[fa(this.me.slot),...[...this.players.values()].filter(c=>c.mode!=="world").map(c=>fa(c.slot))],r=(Math.min(...s)+Math.max(...s))/2,a=Math.max(...s)-Math.min(...s),o=this.gfx.w/this.gfx.h,l=ne(5.2+a*.62,5.2,11)*(o<1.3?1.5:1);this.lobX=_i(this.lobX??r,r,3,t),i.position.set(this.lobX+l*.2,Ve+1.32,ua+l),i.lookAt(this.lobX+l*.2,Ve+1,ua),i.fov=40}i.updateProjectionMatrix()}editCamera(){let t=this.camera,e=this.meChar.group.position,i=this.profile.look.height;if(this.state==="world"){let s=-Math.sin(this.editBase),r=-Math.cos(this.editBase);t.position.set(e.x+s*3.1,e.y+1.15*i,e.z+r*3.1),t.lookAt(e.x,e.y+.98*i,e.z)}else t.position.set(e.x,e.y+1.15*i,e.z+3.2),t.lookAt(e.x,e.y+.98*i,e.z);t.fov=38,t.updateProjectionMatrix()}};window.RYBAK=new zu;})();
