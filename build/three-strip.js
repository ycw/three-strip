class t extends Error{constructor(){super("Buffer geometry has been disposed internally")}}class s extends Error{constructor(){super("Missing threejs lib; please assign it to `Strip.THREE`")}}function e(t,s,e,i,r){for(let o=0,h=-1;o<s-t;++o)h=6*(t+o),i.set([e[h],e[h+1],e[h+2],e[h+3],e[h+4],e[h+5],e[h+6],e[h+7],e[h+8],e[h+6],e[h+7],e[h+8],e[h+3],e[h+4],e[h+5],e[h+9],e[h+10],e[h+11]],18*(o+r))}class i{static#THREE=null;static#StripHelper;static#CurveHelper;static#Anim;static get THREE(){return i.#THREE}static set THREE(s){var r;i.#THREE=s,s?(i.#StripHelper=(r=s,class extends r.LineSegments{#strip;#len;#c0;#c1;#c2;#disposed;constructor(s,e=1,i="#ff0000",o="#00ff00",h="#0000ff"){if(s.isDisposed)throw new t;super(new r.BufferGeometry,new r.LineBasicMaterial({vertexColors:!0})),this.type="StripHelper",this.#strip=s,this.#len=e,this.#c0=new r.Color(i),this.#c1=new r.Color(o),this.#c2=new r.Color(h),this.#disposed=!1,this.update()}getColors(){return!this.#disposed&&this.#c0&&this.#c1&&this.#c2?[this.#c0.clone(),this.#c1.clone(),this.#c2.clone()]:[null,null,null]}setColors(t,s,e){!this.#disposed&&this.#c0&&this.#c1&&this.#c2&&(t=new r.Color(t??this.#c0),s=new r.Color(s??this.#c1),e=new r.Color(e??this.#c2),this.#c0.equals(t)&&this.#c1.equals(s)&&this.#c2.equals(e)||(this.#c0=t,this.#c1=s,this.#c2=e,this.update()))}getLength(){return this.#len}setLength(t){this.#disposed||(this.#len=t,this.update())}update(){if(this.geometry.dispose(),this.#disposed||!this.#strip||!this.#c0||!this.#c1||!this.#c2)return;if(this.#strip.isDisposed||!this.#strip.geometry||!this.#strip.frames)return;const t=this.#strip.frames,s=t.length,e=new r.Float32BufferAttribute(18*s,3);this.geometry.setAttribute("color",e);const i=new r.Float32BufferAttribute(18*s,3);this.geometry.setAttribute("position",i);const o=new r.Vector3,h=new r.Vector3,n=new r.Vector3,l=new r.Vector3,c=this.#strip.getPoints();for(let r=0;r<s;++r)l.copy(c[r]),o.copy(t[r][1]).multiplyScalar(this.#len).add(l),h.copy(t[r][2]).multiplyScalar(this.#len).add(l),n.copy(t[r][0]).multiplyScalar(this.#len).add(l),i.array.set([l.x,l.y,l.z,o.x,o.y,o.z,l.x,l.y,l.z,h.x,h.y,h.z,l.x,l.y,l.z,n.x,n.y,n.z],18*r),e.array.set([this.#c0.r,this.#c0.g,this.#c0.b,this.#c0.r,this.#c0.g,this.#c0.b,this.#c1.r,this.#c1.g,this.#c1.b,this.#c1.r,this.#c1.g,this.#c1.b,this.#c2.r,this.#c2.g,this.#c2.b,this.#c2.r,this.#c2.g,this.#c2.b],18*r)}dispose(){this.#disposed||(this.#strip=null,this.#len=NaN,this.#c0=null,this.#c1=null,this.#c2=null,this.geometry.dispose(),Array.isArray(this.material)?this.material.forEach((t=>t.dispose())):this.material.dispose(),this.#disposed=!0)}get isDisposed(){return this.#disposed}}),i.#CurveHelper=function(t){return class{static forEachTBN(s,e,i,r){const o=new t.Vector3,h=new t.Vector3,n=new t.Vector3,l=new t.Vector3,c=new t.Vector3,u=new t.Vector3,p=new t.Vector3,a=new t.Vector3;let d=i(0,e);s.getTangentAt(d,o),a.set(Math.abs(o.x),Math.abs(o.x),Math.abs(o.z)),p.set(1,0,0),a.y<=a.x?a.z<=a.y?p.set(0,0,1):p.set(0,1,0):a.z<=a.x&&p.set(0,0,1),a.crossVectors(o,p).normalize(),n.crossVectors(o,a),h.crossVectors(o,n),r(0,e,[o.clone(),h.clone(),n.clone()],s.getPointAt(d));for(let t=1;t<=e;t++)d=i(t,e),s.getTangentAt(d,l),u.copy(n),c.copy(h),a.crossVectors(o,l),a.length()>Number.EPSILON&&(a.normalize(),u.applyAxisAngle(a,Math.acos((g=o.dot(l))<-1?-1:g>1?1:g))),c.crossVectors(l,u),r(t,e,[l.clone(),c.clone(),u.clone()],s.getPointAt(d)),o.copy(l),n.copy(u),h.copy(c);var g}}}(s),i.#Anim=function(s){return class{#strip;#seg;#dur;#geom;#clip;#disposed;constructor(s,e,i){if(s.isDisposed)throw new t;this.#strip=s,this.#seg=0|Math.max(1,Math.min(s.segment,e)),this.#dur=i,this.#geom=null,this.#clip=null,this.#disposed=!1,this.#compute()}#compute(){if(!this.#strip)return;const t=this.#seg,i=this.#strip,r=new s.BufferGeometry,o=i.geometry.getAttribute("position").array,h=i.geometry.getAttribute("normal").array,n=18*t,l=[],c=[],u=[];for(let r=0,p=i.segment;r<=p;++r){const a=r,d=r+t,g=d<=p?[[a,d,0]]:[[a,a+p-r,0],[0,d-p,p-r]],m=new s.Float32BufferAttribute(n,3),f=new s.Float32BufferAttribute(n,3);for(const[t,s,i]of g)e(t,s,o,m.array,i),e(t,s,h,f.array,i);l.push(m),c.push(f);const y=i.segment,A=new Float32Array(y+1),w=new Float32Array(y+1);for(let t=0;t<=y;++t)A[t]=t/y*this.#dur,w[t]=+(r===t);u.push(new s.KeyframeTrack(`.morphTargetInfluences[${r}]`,A,w,s.InterpolateDiscrete))}if(r.morphAttributes.position=l,r.morphAttributes.normal=c,r.setAttribute("position",l[0].clone()),r.setAttribute("normal",c[0].clone()),i.uv){const e=new s.Float32BufferAttribute(12*t,2),o=t;for(let t,s=0,r=i.uv(0,o);s<o;++s)t=i.uv(s+1,o),e.set([r[0],r[1],r[2],r[3],t[0],t[1],t[0],t[1],r[2],r[3],t[2],t[3]],12*s),r=t;r.setAttribute("uv",e)}this.#geom=r,this.#clip=new s.AnimationClip(void 0,this.#dur,u)}get strip(){return this.#strip}get geometry(){return this.#geom}get clip(){return this.#clip}get segment(){return this.#seg}get duration(){return this.#dur}dispose(){this.#disposed||(this.#strip=null,this.#geom?.dispose(),this.#geom=null,this.#clip=null,this.#seg=NaN,this.#dur=NaN,this.#disposed=!0)}get isDispose(){return this.#disposed}}}(s)):(i.#StripHelper=null,i.#CurveHelper=null,i.#Anim=null)}static get Helper(){if(!this.#StripHelper)throw new s;return this.#StripHelper}static get Anim(){if(!this.#Anim)throw new s;return this.#Anim}static UvFns=[(t,s)=>[0,t/s,1,t/s],(t,s)=>[t/s,1,t/s,0],(t,s)=>[1,1-t/s,0,1-t/s],(t,s)=>[1-t/s,0,1-t/s,1]];#crv;#seg;#r=.5;#tilt=0;#uv;#mrps;#disposed;#geom;#frms;#pts;#rFn=()=>.5;#tiltFn=()=>0;constructor(t,e,r=.5,o=0,h=null){if(!i.#THREE)throw new s;this.#crv=t,this.#seg=e,this.#setR(r),this.#setTilt(o),this.#uv=h,this.#mrps=null,this.#geom=new i.#THREE.BufferGeometry,this.#frms=null,this.#pts=null,this.#disposed=!1,this.#update()}#setR(t){this.#r=t,this.#rFn="function"==typeof t?t:()=>t}#setTilt(t){this.#tilt=t,this.#tiltFn="function"==typeof t?t:()=>t}get curve(){return this.#crv}set curve(t){this.#crv=t,this.#update()}get segment(){return this.#seg}set segment(t){(t=Math.max(1,0|t))!==this.#seg&&(this.#seg=t,this.#update())}get radius(){return this.#r}set radius(t){t!==this.#r&&(this.#setR(t),this.#update())}get tilt(){return this.#tilt}set tilt(t){t!==this.#tilt&&(this.#setTilt(t),this.#update())}get uv(){return this.#uv}set uv(t){t!==this.#uv&&(this.#uv=t,this.#update())}get geometry(){return this.#geom}get frames(){return this.#frms}getPoints(){return this.#pts&&this.#pts.map((t=>t.clone()))}setMorphs(t){this.#disposed||(this.#mrps=t,this.#update())}setProps(t=this.#crv,s=this.#seg,e=this.#r,i=this.#tilt,r=this.#uv){if(this.#disposed)return;const o=this.#crv!==t||this.#seg!==s||this.#r!==e||this.#tilt!==i||this.uv!==r;this.#crv=t,this.#seg=s,this.#setR(e),this.#setTilt(i),this.#uv=r,o&&this.#update()}dispose(){this.#disposed||(this.#crv=null,this.#seg=NaN,this.#r=NaN,this.#rFn=null,this.#tilt=NaN,this.#tiltFn=null,this.#uv=null,this.#mrps=null,this.#geom?.dispose(),this.#geom=null,this.#frms=null,this.#pts=null,this.#disposed=!0)}get isDisposed(){return this.#disposed}#update(){if(!i.THREE)return;if(this.#disposed||!this.#geom)return;this.#geom.dispose();const t=i.THREE,s=this.#geom,e=new t.Float32BufferAttribute(6*(this.#seg+1),3);s.setAttribute("position",e);const r=new t.Float32BufferAttribute(6*(this.#seg+1),3);s.setAttribute("normal",r);const o=[];this.#uv&&s.setAttribute("uv",new t.Float32BufferAttribute(4*(this.#seg+1),2));const h=s.getAttribute("uv");if(s.morphAttributes.position=[],s.morphAttributes.normal=[],!this.#crv)return this.#geom=null,void(this.#frms=null);this.#frms??=[],this.#frms.length=this.#seg;const n=this.#frms;this.#pts??=[],this.#pts.length=this.#seg;const l=this.#pts,c=new t.Vector3,u=new t.Vector3;let p=-1,a=NaN,d=NaN;if(i.#CurveHelper.forEachTBN(this.#crv,this.#seg,((t,s)=>t/s),((t,s,[i,r,g],m)=>{a=this.#rFn(t,s),d=this.#tiltFn(t,s),n[t]??=[c,c,c],n[t][0]=i,n[t][1]=d?g.applyAxisAngle(i,d):g,n[t][2]=d?r.applyAxisAngle(i,d):r,c.copy(n[t][1]).multiplyScalar(a).add(m),u.copy(n[t][1]).multiplyScalar(-a).add(m),e.array.set([c.x,c.y,c.z,u.x,u.y,u.z],6*t),l[t]=m,t<s&&o.push(p=2*t,p+1,p+2,p+2,p+1,p+3),this.#uv&&h.array.set(this.#uv(t,s),4*t)})),s.setIndex(o),1===this.#seg)c.addVectors(n[0][2],n[1][2]).divideScalar(2),r.array.set([c.x,c.y,c.z,c.x,c.y,c.z,c.x,c.y,c.z,c.x,c.y,c.z]);else for(const[t,s]of n.entries())0===t||t===n.length-1?r.array.set([s[2].x,s[2].y,s[2].z,s[2].x,s[2].y,s[2].z],6*t):(c.addVectors(n[t-1][2],s[2]).add(n[t+1][2]).divideScalar(3),r.array.set([c.x,c.y,c.z,c.x,c.y,c.z],6*t));if(this.#mrps)for(const{curve:t,radius:e,tilt:r}of this.#mrps){const{geometry:o}=new i(t,this.#seg,e,r);s.morphAttributes.position.push(o.getAttribute("position")),s.morphAttributes.normal.push(o.getAttribute("normal"))}}}export{i as Strip};
