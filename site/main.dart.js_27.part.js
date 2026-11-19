((a,b)=>{a[b]=a[b]||{}})(self,"$__dart_deferred_initializers__")
$__dart_deferred_initializers__.current=function(a,b,c,$){var B,C,A={bcO:function bcO(d,e,f,g){var _=this
_.a=d
_.b=e
_.c=f
_.d=g},bcP:function bcP(){},a_r:function a_r(d,e,f,g,h,i){var _=this
_.a=d
_.b=e
_.c=f
_.d=g
_.e=h
_.f=i},apI:function apI(){},Ob:function Ob(d,e,f){var _=this
_.b=_.w=null
_.c=!1
_.ln$=d
_.eP$=e
_.bv$=f
_.a=null},aom:function aom(d,e,f,g,h,i,j){var _=this
_.ae=d
_.y1=e
_.y2=f
_.eK$=g
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
dFi(d,e,f,g,h,i,j,k){var x,w=null
if(j==null){x=d==null
x=x?C.kj:w}else x=j
return new A.Fo(f,new B.BQ(g,h,!0,!0,!0,0,B.aKD(),w),i,C.K,!1,d,w,x,w,k,w,0,w,w,h,C.k5,e,w,w,C.y,C.a7,w)},
Fo:function Fo(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,a0){var _=this
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
apH:function apH(d,e,f){this.f=d
this.d=e
this.a=f}}
B=c[0]
C=c[2]
A=a.updateHolder(c[54],A)
A.bcO.prototype={
aCJ(d){var x=this.c
return d.Gv(this.d,x,x)},
p(d){var x=this
return"SliverGridGeometry("+C.p.aT(B.e(["scrollOffset: "+B.J(x.a),"crossAxisOffset: "+B.J(x.b),"mainAxisExtent: "+B.J(x.c),"crossAxisExtent: "+B.J(x.d)],y.x),", ")+")"}}
A.bcP.prototype={}
A.a_r.prototype={
aD2(d){var x=this.b
if(x>0)return Math.max(0,this.a*C.t.f0(d/x)-1)
return 0},
aUG(d){var x,w,v=this
if(v.f){x=v.c
w=v.e
return v.a*x-d-w-(x-w)}return d},
a_7(d){var x=this,w=x.a,v=C.r.aj(d,w)
return new A.bcO(C.r.hw(d,w)*x.b,x.aUG(v*x.c),x.d,x.e)},
auC(d){var x
if(d===0)return 0
x=this.b
return x*(C.r.hw(d-1,this.a)+1)-(x-this.d)}}
A.apI.prototype={}
A.Ob.prototype={
p(d){return"crossAxisOffset="+B.J(this.w)+"; "+this.aIg(0)}}
A.aom.prototype={
jP(d){if(!(d.b instanceof A.Ob))d.b=new A.Ob(!1,null,null)},
saDt(d){var x=this
if(x.ae===d)return
if(B.ar(d)!==B.ar(x.ae)||d.pd(x.ae))x.aM()
x.ae=d},
GJ(d){var x=d.b
x.toString
x=y.t.a(x).w
x.toString
return x},
dK(){var x,w,v,u,t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0,a1,a2,a3,a4,a5,a6=this,a7=null,a8=y.z.a(B.ao.prototype.gaF.call(a6)),a9=a6.y1
a9.R8=!1
x=a8.d
w=x+a8.z
v=w+a8.Q
u=a6.ae.QF(a8)
t=u.b
s=t>1e-10?u.a*C.t.hw(w,t):0
r=isFinite(v)?u.aD2(v):a7
if(a6.b3$!=null){q=a6.auf(s)
a6.CV(q,r!=null?a6.aug(r):0)}else a6.CV(0,0)
p=u.a_7(s)
if(a6.b3$==null)if(!a6.a6y(s,p.a)){o=u.auC(a9.gGI())
a6.dy=B.oh(a7,!1,a7,a7,o,0,0,0,o,a7)
a9.D4()
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
for(;k>=s;--k){i=u.a_7(k)
h=i.c
g=a6.axA(a8.Gv(i.d,h,h))
f=g.b
f.toString
t.a(f)
e=i.a
f.a=e
f.w=i.b
if(j==null)j=g
m=Math.max(m,e+h)}if(j==null){h=a6.b3$
h.toString
h.kX(p.aCJ(a8))
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
break}i=u.a_7(k)
e=i.c
a0=a8.Gv(i.d,e,e)
a1=j.b
a1.toString
g=h.a(a1).bv$
if(g!=null){a1=g.b
a1.toString
a1=l.a(a1).b
a1.toString
a1=a1!==k}else a1=!0
if(a1){g=a6.axy(a0,j)
if(g==null){d=!0
break}}else g.kX(a0)
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
a3=d?m:a9.a8C(a8,s,t,n,m)
a4=a6.GE(a8,Math.min(x,n),m)
a5=a6.N2(a8,n,m)
a6.dy=B.oh(a5,a3>a4||x>0||a8.f!==0,a7,a7,a3,0,a4,0,a3,a7)
if(a3===m)a9.R8=!0
a9.D4()}}
A.Fo.prototype={
au0(d){return new A.apH(this.to,this.x1,null)}}
A.apH.prototype={
c2(d){var x=new A.aom(this.f,y.v.a(d),B.U(y.e,y.g),0,null,null,B.bp())
x.c0()
return x},
ca(d,e){e.saDt(this.f)},
a8B(d,e,f,g,h){var x
this.aIh(d,e,f,g,h)
x=this.f.QF(d).auC(this.d.gHm())
return x}}
var z=a.updateTypes([]);(function inheritance(){var x=a.inheritMany,w=a.inherit
x(B.aj,[A.bcO,A.bcP,A.apI])
w(A.a_r,A.bcP)
w(A.Ob,B.kc)
w(A.aom,B.vx)
w(A.Fo,B.Ti)
w(A.apH,B.tf)})()
B.dx(b.typeUniverse,JSON.parse('{"Ob":{"kc":[],"yC":[],"iY":["at"],"rL":[],"fW":[]},"aom":{"vx":[],"f1":[],"bF":["at","kc"],"ao":[],"bD":[],"bF.1":"kc","bF.0":"at"},"Fo":{"ay":[],"M":[]},"apH":{"tf":[],"by":[],"M":[]}}'))
var y={x:B.ai("Q<N>"),g:B.ai("at"),z:B.ai("qD"),t:B.ai("Ob"),v:B.ai("BR"),c:B.ai("kc"),e:B.ai("S")}};
(a=>{a["a/BaCkhenBI/a+q6Igaxp07wDCE="]=a.current})($__dart_deferred_initializers__);