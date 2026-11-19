((a,b)=>{a[b]=a[b]||{}})(self,"$__dart_deferred_initializers__")
$__dart_deferred_initializers__.current=function(a,b,c,$){var B,C,A={bem:function bem(d,e,f,g){var _=this
_.a=d
_.b=e
_.c=f
_.d=g},ben:function ben(){},a0c:function a0c(d,e,f,g,h,i){var _=this
_.a=d
_.b=e
_.c=f
_.d=g
_.e=h
_.f=i},aqH:function aqH(){},OM:function OM(d,e,f){var _=this
_.b=_.w=null
_.c=!1
_.ng$=d
_.eW$=e
_.bb$=f
_.a=null},apj:function apj(d,e,f,g,h,i,j){var _=this
_.ae=d
_.y1=e
_.y2=f
_.eD$=g
_.b_$=h
_.du$=i
_.b=_.dy=null
_.c=0
_.y=_.d=null
_.z=!0
_.Q=null
_.as=!1
_.at=null
_.ay=$
_.ch=j
_.CW=!1
_.cx=$
_.cy=!0
_.db=!1
_.dx=$},
dxO(d,e,f,g,h,i,j,k){var x,w=null
if(j==null){x=d==null
x=x?C.ko:w}else x=j
return new A.FZ(f,new B.w7(g,h,!0,!0,!0,0,B.SN(),w),i,C.J,!1,d,w,x,w,k,w,0,w,w,h,C.k9,e,w,w,C.C,C.a6,w)},
FZ:function FZ(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,a0){var _=this
_.to=d
_.x1=e
_.dx=f
_.c=g
_.d=h
_.e=i
_.f=j
_.r=k
_.w=l
_.x=m
_.y=n
_.z=o
_.Q=p
_.as=q
_.at=r
_.ax=s
_.ay=t
_.ch=u
_.CW=v
_.cx=w
_.cy=x
_.a=a0},
aqG:function aqG(d,e,f){this.f=d
this.d=e
this.a=f}}
B=c[0]
C=c[2]
A=a.updateHolder(c[54],A)
A.bem.prototype={
aDB(d){var x=this.c
return d.GJ(this.d,x,x)},
p(d){var x=this
return"SliverGridGeometry("+C.n.aR(B.e(["scrollOffset: "+B.G(x.a),"crossAxisOffset: "+B.G(x.b),"mainAxisExtent: "+B.G(x.c),"crossAxisExtent: "+B.G(x.d)],y.x),", ")+")"}}
A.ben.prototype={}
A.a0c.prototype={
aDV(d){var x=this.b
if(x>0)return Math.max(0,this.a*C.r.f2(d/x)-1)
return 0},
aVJ(d){var x,w,v=this
if(v.f){x=v.c
w=v.e
return v.a*x-d-w-(x-w)}return d},
a_G(d){var x=this,w=x.a,v=C.q.ah(d,w)
return new A.bem(C.q.hx(d,w)*x.b,x.aVJ(v*x.c),x.d,x.e)},
avy(d){var x
if(d===0)return 0
x=this.b
return x*(C.q.hx(d-1,this.a)+1)-(x-this.d)}}
A.aqH.prototype={}
A.OM.prototype={
p(d){return"crossAxisOffset="+B.G(this.w)+"; "+this.aJ8(0)}}
A.apj.prototype={
js(d){if(!(d.b instanceof A.OM))d.b=new A.OM(!1,null,null)},
saEl(d){var x=this
if(x.ae===d)return
if(B.as(d)!==B.as(x.ae)||d.pf(x.ae))x.aM()
x.ae=d},
GX(d){var x=d.b
x.toString
x=y.t.a(x).w
x.toString
return x},
dI(){var x,w,v,u,t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0,a1,a2,a3,a4,a5,a6=this,a7=null,a8=y.z.a(B.ao.prototype.gar.call(a6)),a9=a6.y1
a9.R8=!1
x=a8.d
w=x+a8.z
v=w+a8.Q
u=a6.ae.QW(a8)
t=u.b
s=t>1e-10?u.a*C.r.hx(w,t):0
r=isFinite(v)?u.aDV(v):a7
if(a6.b_$!=null){q=a6.ava(s)
a6.D0(q,r!=null?a6.avb(r):0)}else a6.D0(0,0)
p=u.a_G(s)
if(a6.b_$==null)if(!a6.a7c(s,p.a)){o=u.avy(a9.gGW())
a6.dy=B.mL(a7,!1,a7,a7,o,0,0,0,o,a7)
a9.Da()
return}n=p.a
m=n+p.c
t=a6.b_$
t.toString
t=t.b
t.toString
l=y.c
t=l.a(t).b
t.toString
k=t-1
t=y.t
j=a7
for(;k>=s;--k){i=u.a_G(k)
h=i.c
g=a6.ays(a8.GJ(i.d,h,h))
f=g.b
f.toString
t.a(f)
e=i.a
f.a=e
f.w=i.b
if(j==null)j=g
m=Math.max(m,e+h)}if(j==null){h=a6.b_$
h.toString
h.kV(p.aDB(a8))
j=a6.b_$
h=j.b
h.toString
t.a(h)
h.a=n
h.w=p.b}h=j.b
h.toString
h=l.a(h).b
h.toString
k=h+1
h=B.Z(a6).l("br.1")
f=r!=null
for(;;){if(!(!f||k<=r)){d=!1
break}i=u.a_G(k)
e=i.c
a0=a8.GJ(i.d,e,e)
a1=j.b
a1.toString
g=h.a(a1).bb$
if(g!=null){a1=g.b
a1.toString
a1=l.a(a1).b
a1.toString
a1=a1!==k}else a1=!0
if(a1){g=a6.ayq(a0,j)
if(g==null){d=!0
break}}else g.kV(a0)
a1=g.b
a1.toString
t.a(a1)
a2=i.a
a1.a=a2
a1.w=i.b
m=Math.max(m,a2+e);++k
j=g}t=a6.du$
t.toString
t=t.b
t.toString
t=l.a(t).b
t.toString
a3=d?m:a9.a9d(a8,s,t,n,m)
a4=a6.CY(a8,Math.min(x,n),m)
a5=a6.GT(a8,n,m)
a6.dy=B.mL(a5,a3>a4||x>0||a8.f!==0,a7,a7,a3,0,a4,0,a3,a7)
if(a3===m)a9.R8=!0
a9.Da()}}
A.FZ.prototype={
auW(d){return new A.aqG(this.to,this.x1,null)}}
A.aqG.prototype={
c_(d){var x=new A.apj(this.f,y.v.a(d),B.W(y.e,y.g),0,null,null,B.bq())
x.bZ()
return x},
c6(d,e){e.saEl(this.f)},
a9c(d,e,f,g,h){var x
this.aJ9(d,e,f,g,h)
x=this.f.QW(d).avy(this.d.gHA())
return x}}
var z=a.updateTypes([]);(function inheritance(){var x=a.inheritMany,w=a.inherit
x(B.ak,[A.bem,A.ben,A.aqH])
w(A.a0c,A.ben)
w(A.OM,B.kq)
w(A.apj,B.vZ)
w(A.FZ,B.U4)
w(A.aqG,B.tE)})()
B.ds(b.typeUniverse,JSON.parse('{"OM":{"kq":[],"yZ":[],"j7":["au"],"tb":[],"h4":[]},"apj":{"vZ":[],"ew":[],"br":["au","kq"],"ao":[],"bE":[],"br.1":"kq","br.0":"au"},"FZ":{"av":[],"K":[]},"aqG":{"tE":[],"bw":[],"K":[]}}'))
var y={x:B.ai("R<L>"),g:B.ai("au"),z:B.ai("pW"),t:B.ai("OM"),v:B.ai("Cq"),c:B.ai("kq"),e:B.ai("U")}};
(a=>{a["aK9l6YBVxhYsMie6pCIONW/TCXY="]=a.current})($__dart_deferred_initializers__);