((a,b)=>{a[b]=a[b]||{}})(self,"$__dart_deferred_initializers__")
$__dart_deferred_initializers__.current=function(a,b,c,$){var B,C,A={bcZ:function bcZ(d,e,f,g){var _=this
_.a=d
_.b=e
_.c=f
_.d=g},bd_:function bd_(){},a_y:function a_y(d,e,f,g,h,i){var _=this
_.a=d
_.b=e
_.c=f
_.d=g
_.e=h
_.f=i},apT:function apT(){},Oe:function Oe(d,e,f){var _=this
_.b=_.w=null
_.c=!1
_.ln$=d
_.eP$=e
_.bv$=f
_.a=null},aox:function aox(d,e,f,g,h,i,j){var _=this
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
dFV(d,e,f,g,h,i,j,k){var x,w=null
if(j==null){x=d==null
x=x?C.kl:w}else x=j
return new A.Fs(f,new B.BS(g,h,!0,!0,!0,0,B.aKN(),w),i,C.J,!1,d,w,x,w,k,w,0,w,w,h,C.k7,e,w,w,C.y,C.a7,w)},
Fs:function Fs(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,a0){var _=this
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
apS:function apS(d,e,f){this.f=d
this.d=e
this.a=f}}
B=c[0]
C=c[2]
A=a.updateHolder(c[54],A)
A.bcZ.prototype={
aCR(d){var x=this.c
return d.Gy(this.d,x,x)},
p(d){var x=this
return"SliverGridGeometry("+C.p.aU(B.e(["scrollOffset: "+B.J(x.a),"crossAxisOffset: "+B.J(x.b),"mainAxisExtent: "+B.J(x.c),"crossAxisExtent: "+B.J(x.d)],y.x),", ")+")"}}
A.bd_.prototype={}
A.a_y.prototype={
aDa(d){var x=this.b
if(x>0)return Math.max(0,this.a*C.t.f0(d/x)-1)
return 0},
aUR(d){var x,w,v=this
if(v.f){x=v.c
w=v.e
return v.a*x-d-w-(x-w)}return d},
a_e(d){var x=this,w=x.a,v=C.r.ai(d,w)
return new A.bcZ(C.r.hw(d,w)*x.b,x.aUR(v*x.c),x.d,x.e)},
auK(d){var x
if(d===0)return 0
x=this.b
return x*(C.r.hw(d-1,this.a)+1)-(x-this.d)}}
A.apT.prototype={}
A.Oe.prototype={
p(d){return"crossAxisOffset="+B.J(this.w)+"; "+this.aIp(0)}}
A.aox.prototype={
jR(d){if(!(d.b instanceof A.Oe))d.b=new A.Oe(!1,null,null)},
saDB(d){var x=this
if(x.ae===d)return
if(B.ar(d)!==B.ar(x.ae)||d.pf(x.ae))x.aM()
x.ae=d},
GM(d){var x=d.b
x.toString
x=y.t.a(x).w
x.toString
return x},
dL(){var x,w,v,u,t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,a0,a1,a2,a3,a4,a5,a6=this,a7=null,a8=y.z.a(B.ao.prototype.gaG.call(a6)),a9=a6.y1
a9.R8=!1
x=a8.d
w=x+a8.z
v=w+a8.Q
u=a6.ae.QJ(a8)
t=u.b
s=t>1e-10?u.a*C.t.hw(w,t):0
r=isFinite(v)?u.aDa(v):a7
if(a6.b5$!=null){q=a6.aun(s)
a6.CX(q,r!=null?a6.auo(r):0)}else a6.CX(0,0)
p=u.a_e(s)
if(a6.b5$==null)if(!a6.a6H(s,p.a)){o=u.auK(a9.gGL())
a6.dy=B.oh(a7,!1,a7,a7,o,0,0,0,o,a7)
a9.D6()
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
for(;k>=s;--k){i=u.a_e(k)
h=i.c
g=a6.axI(a8.Gy(i.d,h,h))
f=g.b
f.toString
t.a(f)
e=i.a
f.a=e
f.w=i.b
if(j==null)j=g
m=Math.max(m,e+h)}if(j==null){h=a6.b5$
h.toString
h.kX(p.aCR(a8))
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
h=B.W(a6).l("bF.1")
f=r!=null
for(;;){if(!(!f||k<=r)){d=!1
break}i=u.a_e(k)
e=i.c
a0=a8.Gy(i.d,e,e)
a1=j.b
a1.toString
g=h.a(a1).bv$
if(g!=null){a1=g.b
a1.toString
a1=l.a(a1).b
a1.toString
a1=a1!==k}else a1=!0
if(a1){g=a6.axG(a0,j)
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
a3=d?m:a9.a8M(a8,s,t,n,m)
a4=a6.GH(a8,Math.min(x,n),m)
a5=a6.N4(a8,n,m)
a6.dy=B.oh(a5,a3>a4||x>0||a8.f!==0,a7,a7,a3,0,a4,0,a3,a7)
if(a3===m)a9.R8=!0
a9.D6()}}
A.Fs.prototype={
au8(d){return new A.apS(this.to,this.x1,null)}}
A.apS.prototype={
c2(d){var x=new A.aox(this.f,y.v.a(d),B.V(y.e,y.g),0,null,null,B.bp())
x.c0()
return x},
ca(d,e){e.saDB(this.f)},
a8L(d,e,f,g,h){var x
this.aIq(d,e,f,g,h)
x=this.f.QJ(d).auK(this.d.gHo())
return x}}
var z=a.updateTypes([]);(function inheritance(){var x=a.inheritMany,w=a.inherit
x(B.ak,[A.bcZ,A.bd_,A.apT])
w(A.a_y,A.bd_)
w(A.Oe,B.kd)
w(A.aox,B.vA)
w(A.Fs,B.Tq)
w(A.apS,B.th)})()
B.dx(b.typeUniverse,JSON.parse('{"Oe":{"kd":[],"yD":[],"iZ":["at"],"rO":[],"fY":[]},"aox":{"vA":[],"f1":[],"bF":["at","kd"],"ao":[],"bD":[],"bF.1":"kd","bF.0":"at"},"Fs":{"ay":[],"M":[]},"apS":{"th":[],"bz":[],"M":[]}}'))
var y={x:B.ai("Q<N>"),g:B.ai("at"),z:B.ai("qF"),t:B.ai("Oe"),v:B.ai("BT"),c:B.ai("kd"),e:B.ai("S")}};
(a=>{a["SR+3AgZqwMqhTzeucOTqvpMU6ZU="]=a.current})($__dart_deferred_initializers__);