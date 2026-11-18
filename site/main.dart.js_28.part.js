((a,b)=>{a[b]=a[b]||{}})(self,"$__dart_deferred_initializers__")
$__dart_deferred_initializers__.current=function(a,b,c,$){var B,C,A={bc4:function bc4(d,e,f,g){var _=this
_.a=d
_.b=e
_.c=f
_.d=g},bc5:function bc5(){},a_f:function a_f(d,e,f,g,h,i){var _=this
_.a=d
_.b=e
_.c=f
_.d=g
_.e=h
_.f=i},apf:function apf(){},O3:function O3(d,e,f){var _=this
_.b=_.w=null
_.c=!1
_.iF$=d
_.eN$=e
_.bu$=f
_.a=null},anU:function anU(d,e,f,g,h,i,j){var _=this
_.ae=d
_.y1=e
_.y2=f
_.eI$=g
_.b3$=h
_.eS$=i
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
dCY(d,e,f,g,h,i,j,k){var x,w=null
if(j==null){x=d==null
x=x?C.kc:w}else x=j
return new A.Fi(f,new B.BH(g,h,!0,!0,!0,0,B.aJW(),w),i,C.K,!1,d,w,x,w,k,w,0,w,w,h,C.jZ,e,w,w,C.y,C.a9,w)},
Fi:function Fi(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,a0){var _=this
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
ape:function ape(d,e,f){this.f=d
this.d=e
this.a=f}}
B=c[0]
C=c[2]
A=a.updateHolder(c[54],A)
A.bc4.prototype={
aCv(d){var x=this.c
return d.Gr(this.d,x,x)},
p(d){var x=this
return"SliverGridGeometry("+C.p.aU(B.e(["scrollOffset: "+B.K(x.a),"crossAxisOffset: "+B.K(x.b),"mainAxisExtent: "+B.K(x.c),"crossAxisExtent: "+B.K(x.d)],y.x),", ")+")"}}
A.bc5.prototype={}
A.a_f.prototype={
aCP(d){var x=this.b
if(x>0)return Math.max(0,this.a*C.u.f7(d/x)-1)
return 0},
aUr(d){var x,w,v=this
if(v.f){x=v.c
w=v.e
return v.a*x-d-w-(x-w)}return d},
a_1(d){var x=this,w=x.a,v=C.r.aj(d,w)
return new A.bc4(C.r.hx(d,w)*x.b,x.aUr(v*x.c),x.d,x.e)},
auu(d){var x
if(d===0)return 0
x=this.b
return x*(C.r.hx(d-1,this.a)+1)-(x-this.d)}}
A.apf.prototype={}
A.O3.prototype={
p(d){return"crossAxisOffset="+B.K(this.w)+"; "+this.aI4(0)}}
A.anU.prototype={
jN(d){if(!(d.b instanceof A.O3))d.b=new A.O3(!1,null,null)},
saDf(d){var x=this
if(x.ae===d)return
if(B.aq(d)!==B.aq(x.ae)||d.pc(x.ae))x.aM()
x.ae=d},
GF(d){var x=d.b
x.toString
x=y.t.a(x).w
x.toString
return x},
dK(){var x,w,v,u,t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0,a1,a2,a3,a4,a5,a6=this,a7=null,a8=y.z.a(B.ao.prototype.gaF.call(a6)),a9=a6.y1
a9.R8=!1
x=a8.d
w=x+a8.z
v=w+a8.Q
u=a6.ae.Qz(a8)
t=u.b
s=t>1e-10?u.a*C.u.hx(w,t):0
r=isFinite(v)?u.aCP(v):a7
if(a6.b3$!=null){q=a6.au7(s)
a6.CR(q,r!=null?a6.au8(r):0)}else a6.CR(0,0)
p=u.a_1(s)
if(a6.b3$==null)if(!a6.a6p(s,p.a)){o=u.auu(a9.gGE())
a6.dy=B.ob(a7,!1,a7,a7,o,0,0,0,o,a7)
a9.D1()
return}n=p.a
m=n+p.c
t=a6.b3$
t.toString
t=t.b
t.toString
l=y.c
t=l.a(t).b
t.toString
k=t-1
t=y.t
j=a7
for(;k>=s;--k){i=u.a_1(k)
h=i.c
g=a6.axs(a8.Gr(i.d,h,h))
f=g.b
f.toString
t.a(f)
e=i.a
f.a=e
f.w=i.b
if(j==null)j=g
m=Math.max(m,e+h)}if(j==null){h=a6.b3$
h.toString
h.kU(p.aCv(a8))
j=a6.b3$
h=j.b
h.toString
t.a(h)
h.a=n
h.w=p.b}h=j.b
h.toString
h=l.a(h).b
h.toString
k=h+1
h=B.W(a6).l("bF.1")
f=r!=null
for(;;){if(!(!f||k<=r)){d=!1
break}i=u.a_1(k)
e=i.c
a0=a8.Gr(i.d,e,e)
a1=j.b
a1.toString
g=h.a(a1).bu$
if(g!=null){a1=g.b
a1.toString
a1=l.a(a1).b
a1.toString
a1=a1!==k}else a1=!0
if(a1){g=a6.axq(a0,j)
if(g==null){d=!0
break}}else g.kU(a0)
a1=g.b
a1.toString
t.a(a1)
a2=i.a
a1.a=a2
a1.w=i.b
m=Math.max(m,a2+e);++k
j=g}t=a6.eS$
t.toString
t=t.b
t.toString
t=l.a(t).b
t.toString
a3=d?m:a9.a8t(a8,s,t,n,m)
a4=a6.GA(a8,Math.min(x,n),m)
a5=a6.MZ(a8,n,m)
a6.dy=B.ob(a5,a3>a4||x>0||a8.f!==0,a7,a7,a3,0,a4,0,a3,a7)
if(a3===m)a9.R8=!0
a9.D1()}}
A.Fi.prototype={
atT(d){return new A.ape(this.to,this.x1,null)}}
A.ape.prototype={
c0(d){var x=new A.anU(this.f,y.v.a(d),B.U(y.e,y.g),0,null,null,B.bp())
x.bZ()
return x},
cb(d,e){e.saDf(this.f)},
a8s(d,e,f,g,h){var x
this.aI5(d,e,f,g,h)
x=this.f.Qz(d).auu(this.d.gHi())
return x}}
var z=a.updateTypes([]);(function inheritance(){var x=a.inheritMany,w=a.inherit
x(B.aj,[A.bc4,A.bc5,A.apf])
w(A.a_f,A.bc5)
w(A.O3,B.k8)
w(A.anU,B.vs)
w(A.Fi,B.T6)
w(A.ape,B.ta)})()
B.dm(b.typeUniverse,JSON.parse('{"O3":{"k8":[],"yt":[],"iW":["as"],"rH":[],"fW":[]},"anU":{"vs":[],"f0":[],"bF":["as","k8"],"ao":[],"bD":[],"bF.1":"k8","bF.0":"as"},"Fi":{"aA":[],"N":[]},"ape":{"ta":[],"by":[],"N":[]}}'))
var y={x:B.ah("Q<M>"),g:B.ah("as"),z:B.ah("qw"),t:B.ah("O3"),v:B.ah("BI"),c:B.ah("k8"),e:B.ah("T")}};
(a=>{a["cjDfhWnPRVbUxiyA1ug8RJTy+2c="]=a.current})($__dart_deferred_initializers__);