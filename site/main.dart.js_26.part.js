((a,b)=>{a[b]=a[b]||{}})(self,"$__dart_deferred_initializers__")
$__dart_deferred_initializers__.current=function(a,b,c,$){var B,C,A={bds:function bds(d,e,f,g){var _=this
_.a=d
_.b=e
_.c=f
_.d=g},bdt:function bdt(){},a_S:function a_S(d,e,f,g,h,i){var _=this
_.a=d
_.b=e
_.c=f
_.d=g
_.e=h
_.f=i},aqe:function aqe(){},Os:function Os(d,e,f){var _=this
_.b=_.w=null
_.c=!1
_.lp$=d
_.eP$=e
_.bw$=f
_.a=null},aoS:function aoS(d,e,f,g,h,i,j){var _=this
_.ae=d
_.y1=e
_.y2=f
_.eK$=g
_.b5$=h
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
dGJ(d,e,f,g,h,i,j,k){var x,w=null
if(j==null){x=d==null
x=x?C.km:w}else x=j
return new A.FL(f,new B.C9(g,h,!0,!0,!0,0,B.aLa(),w),i,C.K,!1,d,w,x,w,k,w,0,w,w,h,C.k8,e,w,w,C.y,C.a8,w)},
FL:function FL(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,a0){var _=this
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
aqd:function aqd(d,e,f){this.f=d
this.d=e
this.a=f}}
B=c[0]
C=c[2]
A=a.updateHolder(c[54],A)
A.bds.prototype={
aCZ(d){var x=this.c
return d.Gz(this.d,x,x)},
p(d){var x=this
return"SliverGridGeometry("+C.o.aS(B.e(["scrollOffset: "+B.J(x.a),"crossAxisOffset: "+B.J(x.b),"mainAxisExtent: "+B.J(x.c),"crossAxisExtent: "+B.J(x.d)],y.x),", ")+")"}}
A.bdt.prototype={}
A.a_S.prototype={
aDi(d){var x=this.b
if(x>0)return Math.max(0,this.a*C.t.f0(d/x)-1)
return 0},
aUY(d){var x,w,v=this
if(v.f){x=v.c
w=v.e
return v.a*x-d-w-(x-w)}return d},
a_l(d){var x=this,w=x.a,v=C.r.ai(d,w)
return new A.bds(C.r.hw(d,w)*x.b,x.aUY(v*x.c),x.d,x.e)},
auT(d){var x
if(d===0)return 0
x=this.b
return x*(C.r.hw(d-1,this.a)+1)-(x-this.d)}}
A.aqe.prototype={}
A.Os.prototype={
p(d){return"crossAxisOffset="+B.J(this.w)+"; "+this.aIw(0)}}
A.aoS.prototype={
jS(d){if(!(d.b instanceof A.Os))d.b=new A.Os(!1,null,null)},
saDJ(d){var x=this
if(x.ae===d)return
if(B.as(d)!==B.as(x.ae)||d.pg(x.ae))x.aM()
x.ae=d},
GN(d){var x=d.b
x.toString
x=y.t.a(x).w
x.toString
return x},
dL(){var x,w,v,u,t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0,a1,a2,a3,a4,a5,a6=this,a7=null,a8=y.z.a(B.ap.prototype.gaH.call(a6)),a9=a6.y1
a9.R8=!1
x=a8.d
w=x+a8.z
v=w+a8.Q
u=a6.ae.QK(a8)
t=u.b
s=t>1e-10?u.a*C.t.hw(w,t):0
r=isFinite(v)?u.aDi(v):a7
if(a6.b5$!=null){q=a6.auw(s)
a6.CU(q,r!=null?a6.aux(r):0)}else a6.CU(0,0)
p=u.a_l(s)
if(a6.b5$==null)if(!a6.a6M(s,p.a)){o=u.auT(a9.gGM())
a6.dy=B.ou(a7,!1,a7,a7,o,0,0,0,o,a7)
a9.D4()
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
for(;k>=s;--k){i=u.a_l(k)
h=i.c
g=a6.axQ(a8.Gz(i.d,h,h))
f=g.b
f.toString
t.a(f)
e=i.a
f.a=e
f.w=i.b
if(j==null)j=g
m=Math.max(m,e+h)}if(j==null){h=a6.b5$
h.toString
h.l_(p.aCZ(a8))
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
h=B.X(a6).l("bH.1")
f=r!=null
for(;;){if(!(!f||k<=r)){d=!1
break}i=u.a_l(k)
e=i.c
a0=a8.Gz(i.d,e,e)
a1=j.b
a1.toString
g=h.a(a1).bw$
if(g!=null){a1=g.b
a1.toString
a1=l.a(a1).b
a1.toString
a1=a1!==k}else a1=!0
if(a1){g=a6.axO(a0,j)
if(g==null){d=!0
break}}else g.l_(a0)
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
a3=d?m:a9.a8P(a8,s,t,n,m)
a4=a6.GI(a8,Math.min(x,n),m)
a5=a6.N5(a8,n,m)
a6.dy=B.ou(a5,a3>a4||x>0||a8.f!==0,a7,a7,a3,0,a4,0,a3,a7)
if(a3===m)a9.R8=!0
a9.D4()}}
A.FL.prototype={
auh(d){return new A.aqd(this.to,this.x1,null)}}
A.aqd.prototype={
c0(d){var x=new A.aoS(this.f,y.v.a(d),B.V(y.e,y.g),0,null,null,B.bq())
x.c_()
return x},
c7(d,e){e.saDJ(this.f)},
a8O(d,e,f,g,h){var x
this.aIx(d,e,f,g,h)
x=this.f.QK(d).auT(this.d.gHq())
return x}}
var z=a.updateTypes([]);(function inheritance(){var x=a.inheritMany,w=a.inherit
x(B.ak,[A.bds,A.bdt,A.aqe])
w(A.a_S,A.bdt)
w(A.Os,B.ki)
w(A.aoS,B.vN)
w(A.FL,B.TK)
w(A.aqd,B.tr)})()
B.dF(b.typeUniverse,JSON.parse('{"Os":{"ki":[],"yN":[],"j5":["av"],"rY":[],"h2":[]},"aoS":{"vN":[],"f7":[],"bH":["av","ki"],"ap":[],"bE":[],"bH.1":"ki","bH.0":"av"},"FL":{"aA":[],"M":[]},"aqd":{"tr":[],"bx":[],"M":[]}}'))
var y={x:B.am("Q<N>"),g:B.am("av"),z:B.am("qQ"),t:B.am("Os"),v:B.am("Ca"),c:B.am("ki"),e:B.am("T")}};
(a=>{a["JBQ1vBP2r1XCvtCn1RsV5qsVjGM="]=a.current})($__dart_deferred_initializers__);