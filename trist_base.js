// This program was compiled from OCaml by js_of_ocaml 1.0
function caml_raise_with_arg (tag, arg) { throw [0, tag, arg]; }
function caml_raise_with_string (tag, msg) {
  caml_raise_with_arg (tag, new MlWrappedString (msg));
}
function caml_invalid_argument (msg) {
  caml_raise_with_string(caml_global_data[3], msg);
}
function caml_array_bound_error () {
  caml_invalid_argument("index out of bounds");
}
function caml_str_repeat(n, s) {
  if (!n) { return ""; }
  if (n & 1) { return caml_str_repeat(n - 1, s) + s; }
  var r = caml_str_repeat(n >> 1, s);
  return r + r;
}
function MlString(param) {
  if (param != null) {
    this.bytes = this.fullBytes = param;
    this.last = this.len = param.length;
  }
}
MlString.prototype = {
  string:null,
  bytes:null,
  fullBytes:null,
  array:null,
  len:null,
  last:0,
  toJsString:function() {
    return this.string = decodeURIComponent (escape(this.getFullBytes()));
  },
  toBytes:function() {
    if (this.string != null)
      var b = unescape (encodeURIComponent (this.string));
    else {
      var b = "", a = this.array, l = a.length;
      for (var i = 0; i < l; i ++) b += String.fromCharCode (a[i]);
    }
    this.bytes = this.fullBytes = b;
    this.last = this.len = b.length;
    return b;
  },
  getBytes:function() {
    var b = this.bytes;
    if (b == null) b = this.toBytes();
    return b;
  },
  getFullBytes:function() {
    var b = this.fullBytes;
    if (b !== null) return b;
    b = this.bytes;
    if (b == null) b = this.toBytes ();
    if (this.last < this.len) {
      this.bytes = (b += caml_str_repeat(this.len - this.last, '\0'));
      this.last = this.len;
    }
    this.fullBytes = b;
    return b;
  },
  toArray:function() {
    var b = this.bytes;
    if (b == null) b = this.toBytes ();
    var a = [], l = this.last;
    for (var i = 0; i < l; i++) a[i] = b.charCodeAt(i);
    for (l = this.len; i < l; i++) a[i] = 0;
    this.string = this.bytes = this.fullBytes = null;
    this.last = this.len;
    this.array = a;
    return a;
  },
  getArray:function() {
    var a = this.array;
    if (!a) a = this.toArray();
    return a;
  },
  getLen:function() {
    var len = this.len;
    if (len !== null) return len;
    this.toBytes();
    return this.len;
  },
  toString:function() { var s = this.string; return s?s:this.toJsString(); },
  valueOf:function() { var s = this.string; return s?s:this.toJsString(); },
  blitToArray:function(i1, a2, i2, l) {
    var a1 = this.array;
    if (a1)
      for (var i = 0; i < l; i++) a2 [i2 + i] = a1 [i1 + i];
    else {
      var b = this.bytes;
      if (b == null) b = this.toBytes();
      var l1 = this.last - i1;
      if (l <= l1)
        for (var i = 0; i < l; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);
      else {
        for (var i = 0; i < l1; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);
        for (; i < l; i++) a2 [i2 + i] = 0;
      }
    }
  },
  get:function (i) {
    var a = this.array;
    if (a) return a[i];
    var b = this.bytes;
    if (b == null) b = this.toBytes();
    return (i<this.last)?b.charCodeAt(i):0;
  },
  safeGet:function (i) {
    if (!this.len) this.toBytes();
    if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
    return this.get(i);
  },
  set:function (i, c) {
    var a = this.array;
    if (!a) {
      if (this.last == i) {
        this.bytes += String.fromCharCode (c & 0xff);
        this.last ++;
        return 0;
      }
      a = this.toArray();
    } else if (this.bytes != null) {
      this.bytes = this.fullBytes = this.string = null;
    }
    a[i] = c & 0xff;
    return 0;
  },
  safeSet:function (i, c) {
    if (this.len == null) this.toBytes ();
    if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
    this.set(i, c);
  },
  fill:function (ofs, len, c) {
    if (ofs >= this.last && this.last && c == 0) return;
    var a = this.array;
    if (!a) a = this.toArray();
    else if (this.bytes != null) {
      this.bytes = this.fullBytes = this.string = null;
    }
    var l = ofs + len;
    for (i = ofs; i < l; i++) a[i] = c;
  },
  compare:function (s2) {
    if (this.string != null && s2.string != null) {
      if (this.string < s2.string) return -1;
      if (this.string > s2.string) return 1;
      return 0;
    }
    var b1 = this.getFullBytes ();
    var b2 = s2.getFullBytes ();
    if (b1 < b2) return -1;
    if (b1 > b2) return 1;
    return 0;
  },
  equal:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string == s2.string;
    return this.getFullBytes () == s2.getFullBytes ();
  },
  lessThan:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string < s2.string;
    return this.getFullBytes () < s2.getFullBytes ();
  },
  lessEqual:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string <= s2.string;
    return this.getFullBytes () <= s2.getFullBytes ();
  }
}
function MlWrappedString (s) { this.string = s; }
MlWrappedString.prototype = new MlString();
function MlMakeString (l) { this.bytes = ""; this.len = l; }
MlMakeString.prototype = new MlString ();
function caml_array_get (array, index) {
  if ((index < 0) || (index >= array.length)) caml_array_bound_error();
  return array[index+1];
}
function caml_array_set (array, index, newval) {
  if ((index < 0) || (index >= array.length)) caml_array_bound_error();
  array[index+1]=newval; return 0;
}
function caml_blit_string(s1, i1, s2, i2, len) {
  if (len === 0) return;
  if (i2 === s2.last && i1 === 0 && s1.last == len) {
    var s = s1.bytes;
    if (s !== null)
      s2.bytes += s1.bytes;
    else
      s2.bytes += s1.getBytes();
    s2.last += len;
    return;
  }
  var a = s2.array;
  if (!a) a = s2.toArray(); else { s2.bytes = s2.string = null; }
  s1.blitToArray (i1, a, i2, len);
}
function caml_call_gen(f, args) {
  if(f.fun)
    return caml_call_gen(f.fun, args);
  var n = f.length;
  var d = n - args.length;
  if (d == 0)
    return f.apply(null, args);
  else if (d < 0)
    return caml_call_gen(f.apply(null, args.slice(0,n)), args.slice(n));
  else
    return function (x){ return caml_call_gen(f, args.concat([x])); };
}
function caml_create_string(len) { return new MlMakeString(len); }
function caml_raise_constant (tag) { throw [0, tag]; }
var caml_global_data = [];
function caml_raise_zero_divide () {
  caml_raise_constant(caml_global_data[5]);
}
function caml_div(x,y) {
  if (y == 0) caml_raise_zero_divide ();
  return (x/y)|0;
}
function caml_parse_format (fmt) {
  fmt = fmt.toString ();
  var len = fmt.length;
  if (len > 31) caml_invalid_argument("format_int: format too long");
  var f =
    { justify:'+', signstyle:'-', filler:' ', alternate:false,
      base:0, signedconv:false, width:0, uppercase:false,
      sign:1, prec:6, conv:'f' };
  for (var i = 0; i < len; i++) {
    var c = fmt.charAt(i);
    switch (c) {
    case '-':
      f.justify = '-'; break;
    case '+': case ' ':
      f.signstyle = c; break;
    case '0':
      f.filler = '0'; break;
    case '#':
      f.alternate = true; break;
    case '1': case '2': case '3': case '4': case '5':
    case '6': case '7': case '8': case '9':
      f.width = 0;
      while (c=fmt.charCodeAt(i) - 48, c >= 0 && c <= 9) {
        f.width = f.width * 10 + c; i++
      }
      i--;
     break;
    case '.':
      f.prec = 0;
      i++;
      while (c=fmt.charCodeAt(i) - 48, c >= 0 && c <= 9) {
        f.prec = f.prec * 10 + c; i++
      }
      i--;
    case 'd': case 'i':
      f.signedconv = true; /* fallthrough */
    case 'u':
      f.base = 10; break;
    case 'x':
      f.base = 16; break;
    case 'X':
      f.base = 16; f.uppercase = true; break;
    case 'o':
      f.base = 8; break;
    case 'e': case 'f': case 'g':
      f.signedconv = true; f.conv = c; break;
    case 'E': case 'F': case 'G':
      f.signedconv = true; f.uppercase = true;
      f.conv = c.toLowerCase (); break;
    }
  }
  return f;
}
function caml_finish_formatting(f, rawbuffer) {
  if (f.uppercase) rawbuffer = rawbuffer.toUpperCase();
  var len = rawbuffer.length;
  if (f.signedconv && (f.sign < 0 || f.signstyle != '-')) len++;
  if (f.alternate) {
    if (f.base == 8) len += 1;
    if (f.base == 16) len += 2;
  }
  var buffer = "";
  if (f.justify == '+' && f.filler == ' ')
    for (i = len; i < f.width; i++) buffer += ' ';
  if (f.signedconv) {
    if (f.sign < 0) buffer += '-';
    else if (f.signstyle != '-') buffer += f.signstyle;
  }
  if (f.alternate && f.base == 8) buffer += '0';
  if (f.alternate && f.base == 16) buffer += "0x";
  if (f.justify == '+' && f.filler == '0')
    for (i = len; i < f.width; i++) buffer += '0';
  buffer += rawbuffer;
  if (f.justify == '-')
    for (i = len; i < f.width; i++) buffer += ' ';
  return new MlWrappedString (buffer);
}
function caml_format_int(fmt, i) {
  if (fmt.toString() == "%d") return new MlWrappedString(""+i);
  var f = caml_parse_format(fmt);
  if (i < 0) { if (f.signedconv) { f.sign = -1; i = -i; } else i >>>= 0; }
  var s = i.toString(f.base);
  return caml_finish_formatting(f, s);
}
function caml_js_pure_expr (f) { return f(); }
function caml_js_var(x) { return eval(x.toString()); }
function caml_js_wrap_callback(f) {
  var toArray = Array.prototype.slice;
  return function () {
    var args = (arguments.length > 0)?toArray.call (arguments):[0];
    return caml_call_gen(f, args);
  }
}
function caml_make_vect (len, init) {
  var b = [0]; for (var i = 1; i <= len; i++) b[i] = init; return b;
}
function caml_ml_out_channels_list () { return 0; }
function caml_mod(x,y) {
  if (y == 0) caml_raise_zero_divide ();
  return x%y;
}
function caml_int64_compare(x,y) {
  x3 = x[3] << 16;
  y3 = y[3] << 16;
  if (x3 > y3) return 1;
  if (x3 < y3) return -1;
  if (x[2] > y[2]) return 1;
  if (x[2] < y[2]) return -1;
  if (x[1] > y[1]) return 1;
  if (x[1] < y[1]) return -1;
  return 0;
}
function caml_int_compare (a, b) {
  if (a < b) return (-1); if (a == b) return 0; return 1;
}
function caml_compare_val (a, b, total) {
  if (a === b && total) return 0;
  if (a instanceof MlString) {
    if (b instanceof MlString)
      return (a == b)?0:a.compare(b)
    else
      return 1;
  } else if (a instanceof Array && a[0] == (a[0]|0)) {
    var ta = a[0];
    if (ta === 250) return caml_compare_val (a[1], b, total);
    if (b instanceof Array && b[0] == (b[0]|0)) {
      var tb = b[0];
      if (tb === 250) return caml_compare_val (a, b[1], total);
      if (ta != tb) return (ta < tb)?-1:1;
      switch (ta) {
      case 248:
        return caml_int_compare(a[2], b[2]);
      case 255:
        return caml_int64_compare(a, b);
      default:
        if (a.length != b.length) return (a.length < b.length)?-1:1;
        for (var i = 1; i < a.length; i++) {
          var t = caml_compare_val (a[i], b[i], total);
          if (t != 0) return t;
        }
        return 0;
      }
    } else
      return 1;
  } else if (b instanceof MlString || (b instanceof Array && b[0] == (b[0]|0)))
    return -1;
  else {
    if (a < b) return -1;
    if (a > b) return 1;
    if (a != b) {
      if (!total) return 0;
      if (a == a) return 1;
      if (b == b) return -1;
    }
    return 0;
  }
}
function caml_compare (a, b) { return caml_compare_val (a, b, true); }
function caml_notequal (x, y) { return +(caml_compare_val(x,y,false) != 0); }
function caml_register_global (n, v) { caml_global_data[n] = v; }
var caml_named_values = {};
function caml_register_named_value(nm,v) {
  caml_named_values[nm] = v; return 0;
}
function caml_sys_get_config (e) {
  return [0, new MlWrappedString("Unix"), 32];
}
(function(){function as(dJ,dK){return dJ.length==1?dJ(dK):caml_call_gen(dJ,[dK]);}var a=[0,new MlString("Failure")],b=[0,new MlString("Invalid_argument")],c=new MlString("\n  ....\n  ###.\n  ..#.\n  ....\n\n  .#..\n  .#..\n  ##..\n  ....\n\n  #...\n  ###.\n  ....\n  ....\n\n  .##.\n  .#..\n  .#..\n  ....\n\n\n  ....\n  .###\n  .#..\n  ....\n\n  .##.\n  ..#.\n  ..#.\n  ....\n\n  ...#\n  .###\n  ....\n  ....\n\n  ..#.\n  ..#.\n  ..##\n  ....\n\n\n  .#..\n  .#..\n  .#..\n  .#..\n\n  ....\n  ####\n  ....\n  ....\n\n  .#..\n  .#..\n  .#..\n  .#..\n\n  ....\n  ####\n  ....\n  ....\n\n\n  ....\n  .##.\n  .##.\n  ....\n\n  ....\n  .##.\n  .##.\n  ....\n\n  ....\n  .##.\n  .##.\n  ....\n\n  ....\n  .##.\n  .##.\n  ....\n\n\n  .#..\n  .##.\n  ..#.\n  ....\n\n  ..##\n  .##.\n  ....\n  ....\n\n  .#..\n  .##.\n  ..#.\n  ....\n\n  ..##\n  .##.\n  ....\n  ....\n\n\n  ..#.\n  .##.\n  .#..\n  ....\n\n  ##..\n  .##.\n  ....\n  ....\n\n  ..#.\n  .##.\n  .#..\n  ....\n\n  ##..\n  .##.\n  ....\n  ....\n\n\n  ....\n  .#..\n  ###.\n  ....\n\n  ....\n  .#..\n  .##.\n  .#..\n\n  ....\n  ....\n  ###.\n  .#..\n\n  ....\n  .#..\n  ##..\n  .#.. ");caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,b);caml_register_global(2,a);var F=[0,new MlString("Assert_failure")],E=new MlString("%d"),D=new MlString("Pervasives.do_at_exit"),C=new MlString("String.sub"),B=new MlString("Random.int"),A=[0,509760043,399328820,99941072,112282318,611886020,516451399,626288598,337482183,748548471,808894867,657927153,386437385,42355480,977713532,311548488,13857891,307938721,93724463,1041159001,444711218,1040610926,233671814,664494626,1071756703,188709089,420289414,969883075,513442196,275039308,918830973,598627151,134083417,823987070,619204222,81893604,871834315,398384680,475117924,520153386,324637501,38588599,435158812,168033706,585877294,328347186,293179100,671391820,846150845,283985689,502873302,718642511,938465128,962756406,107944131,192910970],z=new MlString("[oclosure]goog.events.KeyHandler[/oclosure]"),y=new MlString("[oclosure]goog.Timer[/oclosure]"),x=new MlString("canvas"),w=new MlString("2d"),v=new MlString("start"),u=new MlString("0"),t=new MlString("lines"),s=[0,0,0],r=new MlString("Board too small to play"),q=new MlString("lines"),p=[0,0,0],o=new MlString("key"),n=new MlString("textContent"),m=new MlString("Missing content"),l=new MlString("tick"),k=[0,new MlString("trist.ml"),202,15],j=new MlString("[oclosure]goog.events[/oclosure]"),i=new MlString("ground"),h=new MlString("preview"),g=[0,0,0],f=[0,0,0];function e(d){throw [0,a,d];}function H(G){throw [0,b,G];}function M(L){var I=caml_ml_out_channels_list(0);for(;;){if(I){var J=I[2];try {}catch(K){}var I=J;continue;}return 0;}}caml_register_named_value(D,M);function V(N,T,S){var O=caml_make_vect(N,[0]),P=0,Q=N-1|0;if(P<=Q){var R=P;for(;;){O[R+1]=caml_make_vect(T,S);var U=R+1|0;if(Q!==R){var R=U;continue;}break;}}return O;}var X=caml_sys_get_config(0)[2],W=[0,0];32===X;var Y=[0,A.slice(),0];function ae(Z){return caml_js_pure_expr(function(ad){var _=Z.getLen()-21|0,$=10;if(0<=$&&0<=_&&!((Z.getLen()-_|0)<$)){var ab=caml_create_string(_);caml_blit_string(Z,$,ab,0,_);var ac=ab,aa=1;}else var aa=0;if(!aa)var ac=H(C);return caml_js_var(ac);});}var af=ae(z),ah=ae(y),ag=null,ai=false,am=undefined,al=true,ak=Array;W[1]=[0,function(aj){return aj instanceof ak?0:[0,new MlWrappedString(aj.toString())];},W[1]];function ao(an){return an;}function aw(ar){return ao(caml_js_wrap_callback(function(ap){if(ap===am){var aq=event,at=as(ar,aq);aq.returnValue=at;var au=at;}else{var av=as(ar,ap);if(1-(av|0))ap.preventDefault();var au=av;}return au;}));}var ax=w.toString();function aB(ay){var az=x.toString(),aA=ay.tagName.toLowerCase()===az?ao(ay):ag;return aA;}var aC=window,aD=aC.document,aE=4,aF=4,aG=[0,0],aH=0,aI=c.getLen()-1|0;if(aH<=aI){var aJ=aH;for(;;){var aK=c.safeGet(aJ),aL=46===aK?0:35===aK?0:1;if(!aL)aG[1]+=1;var aM=aJ+1|0;if(aI!==aJ){var aJ=aM;continue;}break;}}var aN=caml_div(aG[1],(aE*aF|0)*4|0);function aP(aO){return V(aF,aE,0);}var aQ=V(aN,4,aP(0)),aR=[0,0],aS=0,aT=aN-1|0;if(aS<=aT){var aU=aS;for(;;){var aV=0,aW=3;if(aV<=aW){var aX=aV;for(;;){caml_array_set(caml_array_get(aQ,aU),aX,aP(0));var aY=0,aZ=aF-1|0;if(aY<=aZ){var a0=aY;for(;;){var a1=0,a2=aE-1|0;if(a1<=a2){var a3=a1;d:for(;;){for(;;){var a4=c.safeGet(aR[1]);if(35===a4){aR[1]+=1;var a5=1;}else{if(46!==a4){if(32!==a4&&10!==a4)throw [0,F,k];aR[1]+=1;continue;}aR[1]+=1;var a5=0;}caml_array_set(caml_array_get(caml_array_get(caml_array_get(aQ,aU),aX),a0),a3,a5);var a6=a3+1|0;if(a2!==a3){var a3=a6;continue d;}break;}break;}}var a7=a0+1|0;if(aZ!==a0){var a0=a7;continue;}break;}}var a8=aX+1|0;if(aW!==aX){var aX=a8;continue;}break;}}var a9=aU+1|0;if(aT!==aU){var aU=a9;continue;}break;}}function bm(bi,be,a_){var a$=a_[2],ba=a_[1],bb=[0,0],bc=[0,0],bd=[0,1];for(;;){if(bd[1]&&bc[1]<be.length-1){var bf=1-caml_array_get(caml_array_get(be,bc[1]),bb[1]);if(bf)var bg=bf;else{var bh=0<=(a$+bc[1]|0)?1:0;if(bh){var bj=(a$+bc[1]|0)<bi.length-1?1:0;if(bj){var bk=0<=(ba+bb[1]|0)?1:0;if(bk){var bl=(ba+bb[1]|0)<caml_array_get(bi,a$+bc[1]|0).length-1?1:0,bg=bl?1-caml_array_get(caml_array_get(bi,a$+bc[1]|0),ba+bb[1]|0):bl;}else var bg=bk;}else var bg=bj;}else var bg=bh;}bd[1]=bg;bb[1]+=1;if(caml_array_get(be,bc[1]).length-1<=bb[1]){bb[1]=0;bc[1]+=1;continue;}continue;}return bd[1];}}function bt(bs){var br=0;if(1073741823<aN||!(0<aN))var bn=0;else for(;;){Y[2]=(Y[2]+1|0)%55|0;var bo=(caml_array_get(Y[1],(Y[2]+24|0)%55|0)+caml_array_get(Y[1],Y[2])|0)&1073741823;caml_array_set(Y[1],Y[2],bo);var bp=caml_mod(bo,aN);if(((1073741823-aN|0)+1|0)<(bo-bp|0))continue;var bq=bp,bn=1;break;}if(!bn)var bq=H(B);return [0,bq,br];}var bx=ae(j);function bw(bu){var bv=bu==ag?e(m):bu;return bv;}function bz(by){return bw(aD.getElementById(by.toString()));}function bC(bA,bB){return bA[n.toString()]=bB;}var bD=bw(aB(bz(i))),bE=bD.getContext(ax),bF=bw(aB(bz(h))),bG=bF.getContext(ax),bH=bF.height/aF|0,bI=caml_div(bD.width,bH),bJ=caml_div(bD.height,bH);function bP(bN,bO,bK){var bL=bK[2],bM=bK[1];return bN?bO.fillRect(bM*bH,bL*bH,bH,bH):bO.clearRect(bM*bH,bL*bH,bH,bH);}function b4(b1,b0,bU,bQ){var bT=bQ[2],bS=bQ[1],bR=0,bV=bU.length-1-1|0;if(bR<=bV){var bW=bR;for(;;){var bX=0,bY=caml_array_get(bU,bW).length-1-1|0;if(bX<=bY){var bZ=bX;for(;;){if(caml_array_get(caml_array_get(bU,bW),bZ))bP(b1,b0,[0,bS+bZ|0,bT+bW|0]);var b2=bZ+1|0;if(bY!==bZ){var bZ=b2;continue;}break;}}var b3=bW+1|0;if(bV!==bW){var bW=b3;continue;}break;}}return 0;}function b7(b6){var b5=bD.height;return bE.clearRect(0,0,bD.width,b5);}function b_(b9){var b8=bF.height;return bG.clearRect(0,0,bF.width,b8);}function cb(ca,b$){return b4(ca,bE,caml_array_get(caml_array_get(aQ,b$[4][1]),b$[4][2]),[0,b$[5],b$[6]]);}var cc=[0,[0,0,[0],f,g,0,0,0]];function cg(cd,cf){var ce=cd?-1:1;return bm(cf[2],caml_array_get(caml_array_get(aQ,cf[4][1]),cf[4][2]),[0,cf[5]+ce|0,cf[6]])?(cb(0,cf),(cf[5]=cf[5]+ce|0,cb(1,cf))):0;}function cx(ch){b_(0);var ci=ch[2];b7(0);var cj=0,ck=ci.length-1-1|0;if(cj<=ck){var cl=cj;for(;;){var cm=0,cn=caml_array_get(ci,cl).length-1-1|0;if(cm<=cn){var co=cm;for(;;){if(caml_array_get(caml_array_get(ci,cl),co))bP(1,bE,[0,co,cl]);var cp=co+1|0;if(cn!==co){var co=cp;continue;}break;}}var cq=cl+1|0;if(ck!==cl){var cl=cq;continue;}break;}}ch[4]=ch[3];ch[3]=bt(0);b4(1,bG,caml_array_get(caml_array_get(aQ,ch[3][1]),0),p);ch[5]=(bI-aE|0)/2|0;ch[6]=bJ-1|0;var cr=ch[6],cs=ch[5],ct=caml_array_get(caml_array_get(aQ,ch[4][1]),0),cu=ch[2],cv=[0,cr];for(;;){if(!bm(cu,ct,[0,cs,cv[1]])&&(cr-aF|0)<cv[1]){cv[1]+=-1;continue;}var cw=bm(cu,ct,[0,cs,cv[1]])?[0,cv[1]]:0;return cw?(ch[6]=cw[1],(cb(1,ch),1)):0;}}function dj(cy,df){if(cy[1]){var cz=caml_array_get(caml_array_get(aQ,cy[4][1]),cy[4][2]);if(bm(cy[2],cz,[0,cy[5],cy[6]-1|0])){cb(0,cy);cy[6]=cy[6]-1|0;cb(1,cy);return 1;}var cD=cy[6],cC=cy[5],cB=cy[2],cA=0,cE=aF-1|0;if(cA<=cE){var cF=cA;for(;;){var cG=0,cH=aE-1|0;if(cG<=cH){var cI=cG;for(;;){if(caml_array_get(caml_array_get(cz,cF),cI))caml_array_set(caml_array_get(cB,cD+cF|0),cC+cI|0,1);var cJ=cI+1|0;if(cH!==cI){var cI=cJ;continue;}break;}}var cK=cF+1|0;if(cE!==cF){var cF=cK;continue;}break;}}var cL=cy[2],cM=[0,0],cN=0,cO=cL.length-1-1|0;if(cN<=cO){var cP=cN;for(;;){var cQ=cL[cP+1],cR=[0,1],cS=0,cT=cQ.length-1-1|0;if(cS<=cT){var cU=cS;for(;;){var cW=cQ[cU+1],cV=cR[1],cX=cV?cW:cV;cR[1]=cX;var cY=cU+1|0;if(cT!==cU){var cU=cY;continue;}break;}}if(cR[1])cM[1]=[0,cP,cM[1]];var cZ=cP+1|0;if(cO!==cP){var cP=cZ;continue;}break;}}var c0=cM[1],c1=0;for(;;){if(c0){var c2=c0[2],c3=[0,c0[1],c1],c0=c2,c1=c3;continue;}var c4=[0,c1],c6=c4[1],c5=0,c7=c6;for(;;){if(c7){var c9=c7[2],c8=c5+1|0,c5=c8,c7=c9;continue;}var c_=[0,0],c$=[0,0];for(;;){if(c_[1]<cL.length-1){if(c$[1]<cL.length-1){var da=c4[1];if(da){var db=da[2],dc=da[1]===c$[1]?(c4[1]=db,1):0;}else var dc=0;if(!dc){caml_array_set(cL,c_[1],caml_array_get(cL,c$[1]));c_[1]+=1;}}else{caml_array_set(cL,c_[1],caml_make_vect(caml_array_get(cL,c_[1]).length-1,0));c_[1]+=1;}c$[1]+=1;continue;}cy[7]=cy[7]+c5|0;var dd=caml_format_int(E,cy[7]).toString();bC(bz(q),dd);if(cx(cy))return 1;cy[1]=0;var de=bF.height;bG.fillRect(0,0,bF.width,de);return 0;}}}}return 0;}function dr(dq){cc[1][1]=0;b7(0);b_(0);var dg=u.toString();bC(bz(t),dg);var dh=bt(0),di=[0,1,V(bJ,bI,0),dh,s,(bI-aE|0)/2|0,bJ-1|0,0];if(cx(di)){cc[1]=di;var dk=as(dj,di),dl=new ah(ao(150)),dm=l.toString(),dn=function(dp){if(!as(dk,0))dl.removeEventListener(dm,caml_js_wrap_callback(dn),ag);return al;};dl.addEventListener(dm,caml_js_wrap_callback(dn),ag);dl.start();return ai;}return e(r);}aC.onload=aw(function(dI){var ds=bz(v);ds.onclick=aw(dr);function dH(du){var dt=cc[1],dz=caml_array_get(caml_array_get(aQ,dt[4][1]),dt[4][2]);if(dt[1]){var dv=du.keyCode-32|0;if(0<=dv&&dv<=7)switch(dv){case 0:cb(0,dt);var dy=dt[5],dx=dt[2],dw=[0,dt[6]-1|0];for(;;){if(bm(dx,dz,[0,dy,dw[1]])&&-3<=dw[1]){dw[1]+=-1;continue;}dt[6]=dw[1]+1|0;cb(1,dt);return du.stopPropagation();}case 5:cg(1,dt);return du.stopPropagation();case 6:var dB=[0,dt[5],dt[6]],dA=dt[4],dE=dt[2],dD=dA[2],dC=dA[1],dF=caml_mod(dD+1|0,caml_array_get(aQ,dC).length-1),dG=bm(dE,caml_array_get(caml_array_get(aQ,dC),dF),dB)?[0,dC,dF]:dA;if(caml_notequal(dG,dt[4])){cb(0,dt);dt[4]=dG;cb(1,dt);}return du.stopPropagation();case 7:cg(0,dt);return du.stopPropagation();default:}return 0;}return 0;}bx.listen(new af(ao(aD)),o.toString(),caml_js_wrap_callback(dH),ag);return ai;});M(0);return;}());
