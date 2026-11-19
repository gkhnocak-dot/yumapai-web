((a,b)=>{a[b]=a[b]||{}})(self,"$__dart_deferred_initializers__")
$__dart_deferred_initializers__.current=function(a,b,c,$){var B,C,A={bdE:function bdE(d,e,f,g){var _=this
_.a=d
_.b=e
_.c=f
_.d=g},bdF:function bdF(){},a_Y:function a_Y(d,e,f,g,h,i){var _=this
_.a=d
_.b=e
_.c=f
_.d=g
_.e=h
_.f=i},aqm:function aqm(){},Oz:function Oz(d,e,f){var _=this
_.b=_.w=null
_.c=!1
_.rh$=d
_.eO$=e
_.bw$=f
_.a=null},ap_:function ap_(d,e,f,g,h,i,j){var _=this
_.ad=d
_.y1=e
_.y2=f
_.eJ$=g
_.b5$=h
_.eR$=i
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
dGa(d,e,f,g,h,i,j,k){var x,w=null
if(j==null){x=d==null
x=x?C.km:w}else x=j
return new A.FP(f,new B.Cf(g,h,!0,!0,!0,0,B.aLm(),w),i,C.K,!1,d,w,x,w,k,w,0,w,w,h,C.k8,e,w,w,C.z,C.a8,w)},
FP:function FP(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,a0){var _=this
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
aql:function aql(d,e,f){this.f=d
this.d=e
this.a=f}}
B=c[0]
C=c[2]
A=a.updateHolder(c[54],A)
A.bdE.prototype={
aD1(d){var x=this.c
return d.GA(this.d,x,x)},
p(d){var x=this
return"SliverGridGeometry("+C.o.aS(B.e(["scrollOffset: "+B.K(x.a),"crossAxisOffset: "+B.K(x.b),"mainAxisExtent: "+B.K(x.c),"crossAxisExtent: "+B.K(x.d)],y.x),", ")+")"}}
A.bdF.prototype={}
A.a_Y.prototype={
aDl(d){var x=this.b
if(x>0)return Math.max(0,this.a*C.t.f_(d/x)-1)
return 0},
aV0(d){var x,w,v=this
if(v.f){x=v.c
w=v.e
return v.a*x-d-w-(x-w)}return d},
a_p(d){var x=this,w=x.a,v=C.r.ai(d,w)
return new A.bdE(C.r.hv(d,w)*x.b,x.aV0(v*x.c),x.d,x.e)},
auW(d){var x
if(d===0)return 0
x=this.b
return x*(C.r.hv(d-1,this.a)+1)-(x-this.d)}}
A.aqm.prototype={}
A.Oz.prototype={
p(d){return"crossAxisOffset="+B.K(this.w)+"; "+this.aIz(0)}}
A.ap_.prototype={
jT(d){if(!(d.b instanceof A.Oz))d.b=new A.Oz(!1,null,null)},
saDM(d){var x=this
if(x.ad===d)return
if(B.ar(d)!==B.ar(x.ad)||d.ph(x.ad))x.aM()
x.ad=d},
GO(d){var x=d.b
x.toString
x=y.t.a(x).w
x.toString
return x},
dK(){var x,w,v,u,t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0,a1,a2,a3,a4,a5,a6=this,a7=null,a8=y.z.a(B.aq.prototype.gaH.call(a6)),a9=a6.y1
a9.R8=!1
x=a8.d
w=x+a8.z
v=w+a8.Q
u=a6.ad.QM(a8)
t=u.b
s=t>1e-10?u.a*C.t.hv(w,t):0
r=isFinite(v)?u.aDl(v):a7
if(a6.b5$!=null){q=a6.auz(s)
a6.CV(q,r!=null?a6.auA(r):0)}else a6.CV(0,0)
p=u.a_p(s)
if(a6.b5$==null)if(!a6.a6Q(s,p.a)){o=u.auW(a9.gGN())
a6.dy=B.ow(a7,!1,a7,a7,o,0,0,0,o,a7)
a9.D5()
return}n=p.a
m=n+p.c
t=a6.b5$
t.toString
t=t.b
t.toString
l=y.c
t=l.a(t).b
t.toString
k=t-1
t=y.t
j=a7
for(;k>=s;--k){i=u.a_p(k)
h=i.c
g=a6.axT(a8.GA(i.d,h,h))
f=g.b
f.toString
t.a(f)
e=i.a
f.a=e
f.w=i.b
if(j==null)j=g
m=Math.max(m,e+h)}if(j==null){h=a6.b5$
h.toString
h.l_(p.aD1(a8))
j=a6.b5$
h=j.b
h.toString
t.a(h)
h.a=n
h.w=p.b}h=j.b
h.toString
h=l.a(h).b
h.toString
k=h+1
h=B.Y(a6).l("bG.1")
f=r!=null
for(;;){if(!(!f||k<=r)){d=!1
break}i=u.a_p(k)
e=i.c
a0=a8.GA(i.d,e,e)
a1=j.b
a1.toString
g=h.a(a1).bw$
if(g!=null){a1=g.b
a1.toString
a1=l.a(a1).b
a1.toString
a1=a1!==k}else a1=!0
if(a1){g=a6.axR(a0,j)
if(g==null){d=!0
break}}else g.l_(a0)
a1=g.b
a1.toString
t.a(a1)
a2=i.a
a1.a=a2
a1.w=i.b
m=Math.max(m,a2+e);++k
j=g}t=a6.eR$
t.toString
t=t.b
t.toString
t=l.a(t).b
t.toString
a3=d?m:a9.a8T(a8,s,t,n,m)
a4=a6.GJ(a8,Math.min(x,n),m)
a5=a6.N7(a8,n,m)
a6.dy=B.ow(a5,a3>a4||x>0||a8.f!==0,a7,a7,a3,0,a4,0,a3,a7)
if(a3===m)a9.R8=!0
a9.D5()}}
A.FP.prototype={
auk(d){return new A.aql(this.to,this.x1,null)}}
A.aql.prototype={
c0(d){var x=new A.ap_(this.f,y.v.a(d),B.W(y.e,y.g),0,null,null,B.bq())
x.c_()
return x},
c7(d,e){e.saDM(this.f)},
a8S(d,e,f,g,h){var x
this.aIA(d,e,f,g,h)
x=this.f.QM(d).auW(this.d.gHr())
return x}}
var z=a.updateTypes([]);(function inheritance(){var x=a.inheritMany,w=a.inherit
x(B.ak,[A.bdE,A.bdF,A.aqm])
w(A.a_Y,A.bdF)
w(A.Oz,B.kj)
w(A.ap_,B.vP)
w(A.FP,B.TR)
w(A.aql,B.tt)})()
B.dE(b.typeUniverse,JSON.parse('{"Oz":{"kj":[],"yQ":[],"j4":["au"],"t_":[],"h2":[]},"ap_":{"vP":[],"f8":[],"bG":["au","kj"],"aq":[],"bD":[],"bG.1":"kj","bG.0":"au"},"FP":{"az":[],"N":[]},"aql":{"tt":[],"bx":[],"N":[]}}'))
var y={x:B.am("R<O>"),g:B.am("au"),z:B.am("qS"),t:B.am("Oz"),v:B.am("Cg"),c:B.am("kj"),e:B.am("U")}};
(a=>{a["Q7g379h3P3izlFw0IXJUWHlCZgQ="]=a.current})($__dart_deferred_initializers__);