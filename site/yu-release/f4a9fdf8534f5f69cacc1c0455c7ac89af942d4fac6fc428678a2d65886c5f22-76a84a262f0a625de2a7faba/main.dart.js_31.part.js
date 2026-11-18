((a,b)=>{a[b]=a[b]||{}})(self,"$__dart_deferred_initializers__")
$__dart_deferred_initializers__.current=function(a,b,c,$){var B,C,A={bcx:function bcx(d,e,f,g){var _=this
_.a=d
_.b=e
_.c=f
_.d=g},bcy:function bcy(){},a_p:function a_p(d,e,f,g,h,i){var _=this
_.a=d
_.b=e
_.c=f
_.d=g
_.e=h
_.f=i},apw:function apw(){},O7:function O7(d,e,f){var _=this
_.b=_.w=null
_.c=!1
_.iG$=d
_.eP$=e
_.bu$=f
_.a=null},aoa:function aoa(d,e,f,g,h,i,j){var _=this
_.ae=d
_.y1=e
_.y2=f
_.eJ$=g
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
dEo(d,e,f,g,h,i,j,k){var x,w=null
if(j==null){x=d==null
x=x?C.kf:w}else x=j
return new A.Fl(f,new B.BL(g,h,!0,!0,!0,0,B.aKm(),w),i,C.K,!1,d,w,x,w,k,w,0,w,w,h,C.k0,e,w,w,C.y,C.a9,w)},
Fl:function Fl(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,a0){var _=this
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
apv:function apv(d,e,f){this.f=d
this.d=e
this.a=f}}
B=c[0]
C=c[2]
A=a.updateHolder(c[54],A)
A.bcx.prototype={
aCy(d){var x=this.c
return d.Gs(this.d,x,x)},
p(d){var x=this
return"SliverGridGeometry("+C.p.aU(B.e(["scrollOffset: "+B.J(x.a),"crossAxisOffset: "+B.J(x.b),"mainAxisExtent: "+B.J(x.c),"crossAxisExtent: "+B.J(x.d)],y.x),", ")+")"}}
A.bcy.prototype={}
A.a_p.prototype={
aCS(d){var x=this.b
if(x>0)return Math.max(0,this.a*C.t.f7(d/x)-1)
return 0},
aUw(d){var x,w,v=this
if(v.f){x=v.c
w=v.e
return v.a*x-d-w-(x-w)}return d},
a_3(d){var x=this,w=x.a,v=C.r.ai(d,w)
return new A.bcx(C.r.hx(d,w)*x.b,x.aUw(v*x.c),x.d,x.e)},
auw(d){var x
if(d===0)return 0
x=this.b
return x*(C.r.hx(d-1,this.a)+1)-(x-this.d)}}
A.apw.prototype={}
A.O7.prototype={
p(d){return"crossAxisOffset="+B.J(this.w)+"; "+this.aI7(0)}}
A.aoa.prototype={
jN(d){if(!(d.b instanceof A.O7))d.b=new A.O7(!1,null,null)},
saDi(d){var x=this
if(x.ae===d)return
if(B.aq(d)!==B.aq(x.ae)||d.pc(x.ae))x.aM()
x.ae=d},
GG(d){var x=d.b
x.toString
x=y.t.a(x).w
x.toString
return x},
dK(){var x,w,v,u,t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0,a1,a2,a3,a4,a5,a6=this,a7=null,a8=y.z.a(B.ao.prototype.gaG.call(a6)),a9=a6.y1
a9.R8=!1
x=a8.d
w=x+a8.z
v=w+a8.Q
u=a6.ae.QA(a8)
t=u.b
s=t>1e-10?u.a*C.t.hx(w,t):0
r=isFinite(v)?u.aCS(v):a7
if(a6.b3$!=null){q=a6.au9(s)
a6.CR(q,r!=null?a6.aua(r):0)}else a6.CR(0,0)
p=u.a_3(s)
if(a6.b3$==null)if(!a6.a6s(s,p.a)){o=u.auw(a9.gGF())
a6.dy=B.oi(a7,!1,a7,a7,o,0,0,0,o,a7)
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
for(;k>=s;--k){i=u.a_3(k)
h=i.c
g=a6.axu(a8.Gs(i.d,h,h))
f=g.b
f.toString
t.a(f)
e=i.a
f.a=e
f.w=i.b
if(j==null)j=g
m=Math.max(m,e+h)}if(j==null){h=a6.b3$
h.toString
h.kV(p.aCy(a8))
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
break}i=u.a_3(k)
e=i.c
a0=a8.Gs(i.d,e,e)
a1=j.b
a1.toString
g=h.a(a1).bu$
if(g!=null){a1=g.b
a1.toString
a1=l.a(a1).b
a1.toString
a1=a1!==k}else a1=!0
if(a1){g=a6.axs(a0,j)
if(g==null){d=!0
break}}else g.kV(a0)
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
a3=d?m:a9.a8w(a8,s,t,n,m)
a4=a6.GB(a8,Math.min(x,n),m)
a5=a6.N_(a8,n,m)
a6.dy=B.oi(a5,a3>a4||x>0||a8.f!==0,a7,a7,a3,0,a4,0,a3,a7)
if(a3===m)a9.R8=!0
a9.D1()}}
A.Fl.prototype={
atV(d){return new A.apv(this.to,this.x1,null)}}
A.apv.prototype={
c0(d){var x=new A.aoa(this.f,y.v.a(d),B.U(y.e,y.g),0,null,null,B.bq())
x.bZ()
return x},
cb(d,e){e.saDi(this.f)},
a8v(d,e,f,g,h){var x
this.aI8(d,e,f,g,h)
x=this.f.QA(d).auw(this.d.gHj())
return x}}
var z=a.updateTypes([]);(function inheritance(){var x=a.inheritMany,w=a.inherit
x(B.aj,[A.bcx,A.bcy,A.apw])
w(A.a_p,A.bcy)
w(A.O7,B.k9)
w(A.aoa,B.vv)
w(A.Fl,B.Te)
w(A.apv,B.te)})()
B.dm(b.typeUniverse,JSON.parse('{"O7":{"k9":[],"yw":[],"iX":["at"],"rL":[],"fX":[]},"aoa":{"vv":[],"f1":[],"bF":["at","k9"],"ao":[],"bD":[],"bF.1":"k9","bF.0":"at"},"Fl":{"az":[],"N":[]},"apv":{"te":[],"by":[],"N":[]}}'))
var y={x:B.ai("Q<M>"),g:B.ai("at"),z:B.ai("qB"),t:B.ai("O7"),v:B.ai("BM"),c:B.ai("k9"),e:B.ai("T")}};
(a=>{a["/Kiw7+fhSlnaFe2ATU9CpaSYNhg="]=a.current})($__dart_deferred_initializers__);