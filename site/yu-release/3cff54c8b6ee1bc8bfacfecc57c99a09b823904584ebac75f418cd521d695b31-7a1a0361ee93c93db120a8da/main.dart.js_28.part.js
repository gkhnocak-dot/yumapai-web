((a,b)=>{a[b]=a[b]||{}})(self,"$__dart_deferred_initializers__")
$__dart_deferred_initializers__.current=function(a,b,c,$){var B,C,A={bfI:function bfI(d,e,f,g){var _=this
_.a=d
_.b=e
_.c=f
_.d=g},bfJ:function bfJ(){},a0R:function a0R(d,e,f,g,h,i){var _=this
_.a=d
_.b=e
_.c=f
_.d=g
_.e=h
_.f=i},arz:function arz(){},P9:function P9(d,e,f){var _=this
_.b=_.w=null
_.c=!1
_.iX$=d
_.ey$=e
_.bl$=f
_.a=null},aqc:function aqc(d,e,f,g,h,i,j){var _=this
_.ae=d
_.y1=e
_.y2=f
_.eI$=g
_.b_$=h
_.eE$=i
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
dB6(d,e,f,g,h,i,j,k){var x,w=null
if(j==null){x=d==null
x=x?C.kA:w}else x=j
return new A.Ge(f,new B.wl(g,h,!0,!0,!0,0,B.Th(),w),i,C.L,!1,d,w,x,w,k,w,0,w,w,h,C.km,e,w,w,C.C,C.a6,w)},
Ge:function Ge(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,a0){var _=this
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
ary:function ary(d,e,f){this.f=d
this.d=e
this.a=f}}
B=c[0]
C=c[2]
A=a.updateHolder(c[55],A)
A.bfI.prototype={
aEt(d){var x=this.c
return d.GV(this.d,x,x)},
p(d){var x=this
return"SliverGridGeometry("+C.m.aP(B.e(["scrollOffset: "+B.G(x.a),"crossAxisOffset: "+B.G(x.b),"mainAxisExtent: "+B.G(x.c),"crossAxisExtent: "+B.G(x.d)],y.x),", ")+")"}}
A.bfJ.prototype={}
A.a0R.prototype={
aEN(d){var x=this.b
if(x>0)return Math.max(0,this.a*C.t.eR(d/x)-1)
return 0},
aWS(d){var x,w,v=this
if(v.f){x=v.c
w=v.e
return v.a*x-d-w-(x-w)}return d},
a07(d){var x=this,w=x.a,v=C.q.aj(d,w)
return new A.bfI(C.q.hz(d,w)*x.b,x.aWS(v*x.c),x.d,x.e)},
awm(d){var x
if(d===0)return 0
x=this.b
return x*(C.q.hz(d-1,this.a)+1)-(x-this.d)}}
A.arz.prototype={}
A.P9.prototype={
p(d){return"crossAxisOffset="+B.G(this.w)+"; "+this.aK2(0)}}
A.aqc.prototype={
ju(d){if(!(d.b instanceof A.P9))d.b=new A.P9(!1,null,null)},
saFd(d){var x=this
if(x.ae===d)return
if(B.au(d)!==B.au(x.ae)||d.ph(x.ae))x.aL()
x.ae=d},
H6(d){var x=d.b
x.toString
x=y.t.a(x).w
x.toString
return x},
dJ(){var x,w,v,u,t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0,a1,a2,a3,a4,a5,a6=this,a7=null,a8=y.z.a(B.ao.prototype.gau.call(a6)),a9=a6.y1
a9.R8=!1
x=a8.d
w=x+a8.z
v=w+a8.Q
u=a6.ae.Ri(a8)
t=u.b
s=t>1e-10?u.a*C.t.hz(w,t):0
r=isFinite(v)?u.aEN(v):a7
if(a6.b_$!=null){q=a6.aw_(s)
a6.D7(q,r!=null?a6.aw0(r):0)}else a6.D7(0,0)
p=u.a07(s)
if(a6.b_$==null)if(!a6.a7I(s,p.a)){o=u.awm(a9.gH5())
a6.dy=B.mS(a7,!1,a7,a7,o,0,0,0,o,a7)
a9.Di()
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
for(;k>=s;--k){i=u.a07(k)
h=i.c
g=a6.azk(a8.GV(i.d,h,h))
f=g.b
f.toString
t.a(f)
e=i.a
f.a=e
f.w=i.b
if(j==null)j=g
m=Math.max(m,e+h)}if(j==null){h=a6.b_$
h.toString
h.kZ(p.aEt(a8))
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
h=B.Z(a6).l("bw.1")
f=r!=null
for(;;){if(!(!f||k<=r)){d=!1
break}i=u.a07(k)
e=i.c
a0=a8.GV(i.d,e,e)
a1=j.b
a1.toString
g=h.a(a1).bl$
if(g!=null){a1=g.b
a1.toString
a1=l.a(a1).b
a1.toString
a1=a1!==k}else a1=!0
if(a1){g=a6.azi(a0,j)
if(g==null){d=!0
break}}else g.kZ(a0)
a1=g.b
a1.toString
t.a(a1)
a2=i.a
a1.a=a2
a1.w=i.b
m=Math.max(m,a2+e);++k
j=g}t=a6.eE$
t.toString
t=t.b
t.toString
t=l.a(t).b
t.toString
a3=d?m:a9.a9L(a8,s,t,n,m)
a4=a6.D3(a8,Math.min(x,n),m)
a5=a6.H3(a8,n,m)
a6.dy=B.mS(a5,a3>a4||x>0||a8.f!==0,a7,a7,a3,0,a4,0,a3,a7)
if(a3===m)a9.R8=!0
a9.Di()}}
A.Ge.prototype={
avL(d){return new A.ary(this.to,this.x1,null)}}
A.ary.prototype={
c_(d){var x=new A.aqc(this.f,y.v.a(d),B.X(y.e,y.g),0,null,null,B.br())
x.bZ()
return x},
c4(d,e){e.saFd(this.f)},
a9K(d,e,f,g,h){var x
this.aK3(d,e,f,g,h)
x=this.f.Ri(d).awm(this.d.gHN())
return x}}
var z=a.updateTypes([]);(function inheritance(){var x=a.inheritMany,w=a.inherit
x(B.ak,[A.bfI,A.bfJ,A.arz])
w(A.a0R,A.bfJ)
w(A.P9,B.kx)
w(A.aqc,B.wc)
w(A.Ge,B.UG)
w(A.ary,B.tS)})()
B.dv(b.typeUniverse,JSON.parse('{"P9":{"kx":[],"zg":[],"jd":["av"],"tq":[],"h6":[]},"aqc":{"wc":[],"ey":[],"bw":["av","kx"],"ao":[],"bF":[],"bw.1":"kx","bw.0":"av"},"Ge":{"as":[],"K":[]},"ary":{"tS":[],"bu":[],"K":[]}}'))
var y={x:B.ai("S<L>"),g:B.ai("av"),z:B.ai("q6"),t:B.ai("P9"),v:B.ai("CG"),c:B.ai("kx"),e:B.ai("V")}};
(a=>{a["fx5H2jnOY9GsbfXEyEXb69HIoJA="]=a.current})($__dart_deferred_initializers__);