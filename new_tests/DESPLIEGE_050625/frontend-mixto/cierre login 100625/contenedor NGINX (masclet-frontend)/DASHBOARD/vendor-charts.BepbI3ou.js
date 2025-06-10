import {C as th, i as Ye, a as vg, b as Gn, g as Bt, c as Un, d as K, e as X, f as U, S as bg, u as Ta, s as xg, h as Og, k as wg, l as _g, m as Pg, n as Ag, o as eh, p as wl, q as Fs, t as nh, D as et, r as qe, v as Sg, w as kg, x as Eg, y as Mg, z as Tg, A as jg, B as Cg, E as ja, F as me, G as we, H as _l, I as Pl, J as $i, K as Al, L as Dg, M as gi, N as Ig, O as $g, P as Lg, Q as Rg, R as Bg, T as Ng, U as zg, V as rh, W as Fg, X as Wg, Y as Vg, Z as Hg, _ as Kg, $ as Xg, a0 as Gg, a1 as Ug, a2 as Yg, a3 as qg, a4 as Ni, a5 as ih, a6 as Zg, a7 as Jg, a8 as Qg, a9 as tm, aa as em} from "./vendor.CwhrWGr6.js";
import {r as N, a as nm, s as A, A as fe} from "./vendor-react.BjakChMs.js";
/*!
 * Chart.js v4.4.7
 * https://www.chartjs.org
 * (c) 2024 Chart.js Contributors
 * Released under the MIT License
 */
function ee() {}
const rm = ( () => {
    let e = 0;
    return () => e++
}
)();
function J(e) {
    return e == null
}
function ut(e) {
    if (Array.isArray && Array.isArray(e))
        return !0;
    const t = Object.prototype.toString.call(e);
    return t.slice(0, 7) === "[object" && t.slice(-6) === "Array]"
}
function Z(e) {
    return e !== null && Object.prototype.toString.call(e) === "[object Object]"
}
function dt(e) {
    return (typeof e == "number" || e instanceof Number) && isFinite(+e)
}
function It(e, t) {
    return dt(e) ? e : t
}
function Y(e, t) {
    return typeof e > "u" ? t : e
}
const im = (e, t) => typeof e == "string" && e.endsWith("%") ? parseFloat(e) / 100 : +e / t
  , ah = (e, t) => typeof e == "string" && e.endsWith("%") ? parseFloat(e) / 100 * t : +e;
function rt(e, t, n) {
    if (e && typeof e.call == "function")
        return e.apply(n, t)
}
function tt(e, t, n, r) {
    let i, a, o;
    if (ut(e))
        for (a = e.length,
        i = 0; i < a; i++)
            t.call(n, e[i], i);
    else if (Z(e))
        for (o = Object.keys(e),
        a = o.length,
        i = 0; i < a; i++)
            t.call(n, e[o[i]], o[i])
}
function zi(e, t) {
    let n, r, i, a;
    if (!e || !t || e.length !== t.length)
        return !1;
    for (n = 0,
    r = e.length; n < r; ++n)
        if (i = e[n],
        a = t[n],
        i.datasetIndex !== a.datasetIndex || i.index !== a.index)
            return !1;
    return !0
}
function Fi(e) {
    if (ut(e))
        return e.map(Fi);
    if (Z(e)) {
        const t = Object.create(null)
          , n = Object.keys(e)
          , r = n.length;
        let i = 0;
        for (; i < r; ++i)
            t[n[i]] = Fi(e[n[i]]);
        return t
    }
    return e
}
function oh(e) {
    return ["__proto__", "prototype", "constructor"].indexOf(e) === -1
}
function am(e, t, n, r) {
    if (!oh(e))
        return;
    const i = t[e]
      , a = n[e];
    Z(i) && Z(a) ? Er(i, a, r) : t[e] = Fi(a)
}
function Er(e, t, n) {
    const r = ut(t) ? t : [t]
      , i = r.length;
    if (!Z(e))
        return e;
    n = n || {};
    const a = n.merger || am;
    let o;
    for (let s = 0; s < i; ++s) {
        if (o = r[s],
        !Z(o))
            continue;
        const l = Object.keys(o);
        for (let c = 0, u = l.length; c < u; ++c)
            a(l[c], e, o, n)
    }
    return e
}
function yr(e, t) {
    return Er(e, t, {
        merger: om
    })
}
function om(e, t, n) {
    if (!oh(e))
        return;
    const r = t[e]
      , i = n[e];
    Z(r) && Z(i) ? yr(r, i) : Object.prototype.hasOwnProperty.call(t, e) || (t[e] = Fi(i))
}
const Sl = {
    "": e => e,
    x: e => e.x,
    y: e => e.y
};
function sm(e) {
    const t = e.split(".")
      , n = [];
    let r = "";
    for (const i of t)
        r += i,
        r.endsWith("\\") ? r = r.slice(0, -1) + "." : (n.push(r),
        r = "");
    return n
}
function lm(e) {
    const t = sm(e);
    return n => {
        for (const r of t) {
            if (r === "")
                break;
            n = n && n[r]
        }
        return n
    }
}
function _e(e, t) {
    return (Sl[t] || (Sl[t] = lm(t)))(e)
}
function Ws(e) {
    return e.charAt(0).toUpperCase() + e.slice(1)
}
const Mr = e => typeof e < "u"
  , Pe = e => typeof e == "function"
  , kl = (e, t) => {
    if (e.size !== t.size)
        return !1;
    for (const n of e)
        if (!t.has(n))
            return !1;
    return !0
}
;
function cm(e) {
    return e.type === "mouseup" || e.type === "click" || e.type === "contextmenu"
}
const lt = Math.PI
  , ot = 2 * lt
  , um = ot + lt
  , Wi = Number.POSITIVE_INFINITY
  , fm = lt / 180
  , pt = lt / 2
  , Ie = lt / 4
  , El = lt * 2 / 3
  , ye = Math.log10
  , Jt = Math.sign;
function vr(e, t, n) {
    return Math.abs(e - t) < n
}
function Ml(e) {
    const t = Math.round(e);
    e = vr(e, t, e / 1e3) ? t : e;
    const n = Math.pow(10, Math.floor(ye(e)))
      , r = e / n;
    return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 5 ? 5 : 10) * n
}
function hm(e) {
    const t = []
      , n = Math.sqrt(e);
    let r;
    for (r = 1; r < n; r++)
        e % r === 0 && (t.push(r),
        t.push(e / r));
    return n === (n | 0) && t.push(n),
    t.sort( (i, a) => i - a).pop(),
    t
}
function xn(e) {
    return !isNaN(parseFloat(e)) && isFinite(e)
}
function dm(e, t) {
    const n = Math.round(e);
    return n - t <= e && n + t >= e
}
function sh(e, t, n) {
    let r, i, a;
    for (r = 0,
    i = e.length; r < i; r++)
        a = e[r][n],
        isNaN(a) || (t.min = Math.min(t.min, a),
        t.max = Math.max(t.max, a))
}
function Xt(e) {
    return e * (lt / 180)
}
function Vs(e) {
    return e * (180 / lt)
}
function Tl(e) {
    if (!dt(e))
        return;
    let t = 1
      , n = 0;
    for (; Math.round(e * t) / t !== e; )
        t *= 10,
        n++;
    return n
}
function lh(e, t) {
    const n = t.x - e.x
      , r = t.y - e.y
      , i = Math.sqrt(n * n + r * r);
    let a = Math.atan2(r, n);
    return a < -.5 * lt && (a += ot),
    {
        angle: a,
        distance: i
    }
}
function Eo(e, t) {
    return Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2))
}
function pm(e, t) {
    return (e - t + um) % ot - lt
}
function Rt(e) {
    return (e % ot + ot) % ot
}
function Tr(e, t, n, r) {
    const i = Rt(e)
      , a = Rt(t)
      , o = Rt(n)
      , s = Rt(a - i)
      , l = Rt(o - i)
      , c = Rt(i - a)
      , u = Rt(i - o);
    return i === a || i === o || r && a === o || s > l && c < u
}
function Ot(e, t, n) {
    return Math.max(t, Math.min(n, e))
}
function gm(e) {
    return Ot(e, -32768, 32767)
}
function oe(e, t, n, r=1e-6) {
    return e >= Math.min(t, n) - r && e <= Math.max(t, n) + r
}
function Hs(e, t, n) {
    n = n || (o => e[o] < t);
    let r = e.length - 1, i = 0, a;
    for (; r - i > 1; )
        a = i + r >> 1,
        n(a) ? i = a : r = a;
    return {
        lo: i,
        hi: r
    }
}
const se = (e, t, n, r) => Hs(e, n, r ? i => {
    const a = e[i][t];
    return a < n || a === n && e[i + 1][t] === n
}
: i => e[i][t] < n)
  , mm = (e, t, n) => Hs(e, n, r => e[r][t] >= n);
function ym(e, t, n) {
    let r = 0
      , i = e.length;
    for (; r < i && e[r] < t; )
        r++;
    for (; i > r && e[i - 1] > n; )
        i--;
    return r > 0 || i < e.length ? e.slice(r, i) : e
}
const ch = ["push", "pop", "shift", "splice", "unshift"];
function vm(e, t) {
    if (e._chartjs) {
        e._chartjs.listeners.push(t);
        return
    }
    Object.defineProperty(e, "_chartjs", {
        configurable: !0,
        enumerable: !1,
        value: {
            listeners: [t]
        }
    }),
    ch.forEach(n => {
        const r = "_onData" + Ws(n)
          , i = e[n];
        Object.defineProperty(e, n, {
            configurable: !0,
            enumerable: !1,
            value(...a) {
                const o = i.apply(this, a);
                return e._chartjs.listeners.forEach(s => {
                    typeof s[r] == "function" && s[r](...a)
                }
                ),
                o
            }
        })
    }
    )
}
function jl(e, t) {
    const n = e._chartjs;
    if (!n)
        return;
    const r = n.listeners
      , i = r.indexOf(t);
    i !== -1 && r.splice(i, 1),
    !(r.length > 0) && (ch.forEach(a => {
        delete e[a]
    }
    ),
    delete e._chartjs)
}
function uh(e) {
    const t = new Set(e);
    return t.size === e.length ? e : Array.from(t)
}
const fh = function() {
    return typeof window > "u" ? function(e) {
        return e()
    }
    : window.requestAnimationFrame
}();
function hh(e, t) {
    let n = []
      , r = !1;
    return function(...i) {
        n = i,
        r || (r = !0,
        fh.call(window, () => {
            r = !1,
            e.apply(t, n)
        }
        ))
    }
}
function bm(e, t) {
    let n;
    return function(...r) {
        return t ? (clearTimeout(n),
        n = setTimeout(e, t, r)) : e.apply(this, r),
        t
    }
}
const Ks = e => e === "start" ? "left" : e === "end" ? "right" : "center"
  , _t = (e, t, n) => e === "start" ? t : e === "end" ? n : (t + n) / 2
  , xm = (e, t, n, r) => e === (r ? "left" : "right") ? n : e === "center" ? (t + n) / 2 : t;
function dh(e, t, n) {
    const r = t.length;
    let i = 0
      , a = r;
    if (e._sorted) {
        const {iScale: o, _parsed: s} = e
          , l = o.axis
          , {min: c, max: u, minDefined: f, maxDefined: h} = o.getUserBounds();
        f && (i = Ot(Math.min(se(s, l, c).lo, n ? r : se(t, l, o.getPixelForValue(c)).lo), 0, r - 1)),
        h ? a = Ot(Math.max(se(s, o.axis, u, !0).hi + 1, n ? 0 : se(t, l, o.getPixelForValue(u), !0).hi + 1), i, r) - i : a = r - i
    }
    return {
        start: i,
        count: a
    }
}
function ph(e) {
    const {xScale: t, yScale: n, _scaleRanges: r} = e
      , i = {
        xmin: t.min,
        xmax: t.max,
        ymin: n.min,
        ymax: n.max
    };
    if (!r)
        return e._scaleRanges = i,
        !0;
    const a = r.xmin !== t.min || r.xmax !== t.max || r.ymin !== n.min || r.ymax !== n.max;
    return Object.assign(r, i),
    a
}
const mi = e => e === 0 || e === 1
  , Cl = (e, t, n) => -(Math.pow(2, 10 * (e -= 1)) * Math.sin((e - t) * ot / n))
  , Dl = (e, t, n) => Math.pow(2, -10 * e) * Math.sin((e - t) * ot / n) + 1
  , br = {
    linear: e => e,
    easeInQuad: e => e * e,
    easeOutQuad: e => -e * (e - 2),
    easeInOutQuad: e => (e /= .5) < 1 ? .5 * e * e : -.5 * (--e * (e - 2) - 1),
    easeInCubic: e => e * e * e,
    easeOutCubic: e => (e -= 1) * e * e + 1,
    easeInOutCubic: e => (e /= .5) < 1 ? .5 * e * e * e : .5 * ((e -= 2) * e * e + 2),
    easeInQuart: e => e * e * e * e,
    easeOutQuart: e => -((e -= 1) * e * e * e - 1),
    easeInOutQuart: e => (e /= .5) < 1 ? .5 * e * e * e * e : -.5 * ((e -= 2) * e * e * e - 2),
    easeInQuint: e => e * e * e * e * e,
    easeOutQuint: e => (e -= 1) * e * e * e * e + 1,
    easeInOutQuint: e => (e /= .5) < 1 ? .5 * e * e * e * e * e : .5 * ((e -= 2) * e * e * e * e + 2),
    easeInSine: e => -Math.cos(e * pt) + 1,
    easeOutSine: e => Math.sin(e * pt),
    easeInOutSine: e => -.5 * (Math.cos(lt * e) - 1),
    easeInExpo: e => e === 0 ? 0 : Math.pow(2, 10 * (e - 1)),
    easeOutExpo: e => e === 1 ? 1 : -Math.pow(2, -10 * e) + 1,
    easeInOutExpo: e => mi(e) ? e : e < .5 ? .5 * Math.pow(2, 10 * (e * 2 - 1)) : .5 * (-Math.pow(2, -10 * (e * 2 - 1)) + 2),
    easeInCirc: e => e >= 1 ? e : -(Math.sqrt(1 - e * e) - 1),
    easeOutCirc: e => Math.sqrt(1 - (e -= 1) * e),
    easeInOutCirc: e => (e /= .5) < 1 ? -.5 * (Math.sqrt(1 - e * e) - 1) : .5 * (Math.sqrt(1 - (e -= 2) * e) + 1),
    easeInElastic: e => mi(e) ? e : Cl(e, .075, .3),
    easeOutElastic: e => mi(e) ? e : Dl(e, .075, .3),
    easeInOutElastic(e) {
        return mi(e) ? e : e < .5 ? .5 * Cl(e * 2, .1125, .45) : .5 + .5 * Dl(e * 2 - 1, .1125, .45)
    },
    easeInBack(e) {
        return e * e * ((1.70158 + 1) * e - 1.70158)
    },
    easeOutBack(e) {
        return (e -= 1) * e * ((1.70158 + 1) * e + 1.70158) + 1
    },
    easeInOutBack(e) {
        let t = 1.70158;
        return (e /= .5) < 1 ? .5 * (e * e * (((t *= 1.525) + 1) * e - t)) : .5 * ((e -= 2) * e * (((t *= 1.525) + 1) * e + t) + 2)
    },
    easeInBounce: e => 1 - br.easeOutBounce(1 - e),
    easeOutBounce(e) {
        return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + .75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + .9375 : 7.5625 * (e -= 2.625 / 2.75) * e + .984375
    },
    easeInOutBounce: e => e < .5 ? br.easeInBounce(e * 2) * .5 : br.easeOutBounce(e * 2 - 1) * .5 + .5
};
function Xs(e) {
    if (e && typeof e == "object") {
        const t = e.toString();
        return t === "[object CanvasPattern]" || t === "[object CanvasGradient]"
    }
    return !1
}
function Il(e) {
    return Xs(e) ? e : new th(e)
}
function ao(e) {
    return Xs(e) ? e : new th(e).saturate(.5).darken(.1).hexString()
}
const Om = ["x", "y", "borderWidth", "radius", "tension"]
  , wm = ["color", "borderColor", "backgroundColor"];
function _m(e) {
    e.set("animation", {
        delay: void 0,
        duration: 1e3,
        easing: "easeOutQuart",
        fn: void 0,
        from: void 0,
        loop: void 0,
        to: void 0,
        type: void 0
    }),
    e.describe("animation", {
        _fallback: !1,
        _indexable: !1,
        _scriptable: t => t !== "onProgress" && t !== "onComplete" && t !== "fn"
    }),
    e.set("animations", {
        colors: {
            type: "color",
            properties: wm
        },
        numbers: {
            type: "number",
            properties: Om
        }
    }),
    e.describe("animations", {
        _fallback: "animation"
    }),
    e.set("transitions", {
        active: {
            animation: {
                duration: 400
            }
        },
        resize: {
            animation: {
                duration: 0
            }
        },
        show: {
            animations: {
                colors: {
                    from: "transparent"
                },
                visible: {
                    type: "boolean",
                    duration: 0
                }
            }
        },
        hide: {
            animations: {
                colors: {
                    to: "transparent"
                },
                visible: {
                    type: "boolean",
                    easing: "linear",
                    fn: t => t | 0
                }
            }
        }
    })
}
function Pm(e) {
    e.set("layout", {
        autoPadding: !0,
        padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
    })
}
const $l = new Map;
function Am(e, t) {
    t = t || {};
    const n = e + JSON.stringify(t);
    let r = $l.get(n);
    return r || (r = new Intl.NumberFormat(e,t),
    $l.set(n, r)),
    r
}
function si(e, t, n) {
    return Am(t, n).format(e)
}
const gh = {
    values(e) {
        return ut(e) ? e : "" + e
    },
    numeric(e, t, n) {
        if (e === 0)
            return "0";
        const r = this.chart.options.locale;
        let i, a = e;
        if (n.length > 1) {
            const c = Math.max(Math.abs(n[0].value), Math.abs(n[n.length - 1].value));
            (c < 1e-4 || c > 1e15) && (i = "scientific"),
            a = Sm(e, n)
        }
        const o = ye(Math.abs(a))
          , s = isNaN(o) ? 1 : Math.max(Math.min(-1 * Math.floor(o), 20), 0)
          , l = {
            notation: i,
            minimumFractionDigits: s,
            maximumFractionDigits: s
        };
        return Object.assign(l, this.options.ticks.format),
        si(e, r, l)
    },
    logarithmic(e, t, n) {
        if (e === 0)
            return "0";
        const r = n[t].significand || e / Math.pow(10, Math.floor(ye(e)));
        return [1, 2, 3, 5, 10, 15].includes(r) || t > .8 * n.length ? gh.numeric.call(this, e, t, n) : ""
    }
};
function Sm(e, t) {
    let n = t.length > 3 ? t[2].value - t[1].value : t[1].value - t[0].value;
    return Math.abs(n) >= 1 && e !== Math.floor(e) && (n = e - Math.floor(e)),
    n
}
var li = {
    formatters: gh
};
function km(e) {
    e.set("scale", {
        display: !0,
        offset: !1,
        reverse: !1,
        beginAtZero: !1,
        bounds: "ticks",
        clip: !0,
        grace: 0,
        grid: {
            display: !0,
            lineWidth: 1,
            drawOnChartArea: !0,
            drawTicks: !0,
            tickLength: 8,
            tickWidth: (t, n) => n.lineWidth,
            tickColor: (t, n) => n.color,
            offset: !1
        },
        border: {
            display: !0,
            dash: [],
            dashOffset: 0,
            width: 1
        },
        title: {
            display: !1,
            text: "",
            padding: {
                top: 4,
                bottom: 4
            }
        },
        ticks: {
            minRotation: 0,
            maxRotation: 50,
            mirror: !1,
            textStrokeWidth: 0,
            textStrokeColor: "",
            padding: 3,
            display: !0,
            autoSkip: !0,
            autoSkipPadding: 3,
            labelOffset: 0,
            callback: li.formatters.values,
            minor: {},
            major: {},
            align: "center",
            crossAlign: "near",
            showLabelBackdrop: !1,
            backdropColor: "rgba(255, 255, 255, 0.75)",
            backdropPadding: 2
        }
    }),
    e.route("scale.ticks", "color", "", "color"),
    e.route("scale.grid", "color", "", "borderColor"),
    e.route("scale.border", "color", "", "borderColor"),
    e.route("scale.title", "color", "", "color"),
    e.describe("scale", {
        _fallback: !1,
        _scriptable: t => !t.startsWith("before") && !t.startsWith("after") && t !== "callback" && t !== "parser",
        _indexable: t => t !== "borderDash" && t !== "tickBorderDash" && t !== "dash"
    }),
    e.describe("scales", {
        _fallback: "scale"
    }),
    e.describe("scale.ticks", {
        _scriptable: t => t !== "backdropPadding" && t !== "callback",
        _indexable: t => t !== "backdropPadding"
    })
}
const Ze = Object.create(null)
  , Mo = Object.create(null);
function xr(e, t) {
    if (!t)
        return e;
    const n = t.split(".");
    for (let r = 0, i = n.length; r < i; ++r) {
        const a = n[r];
        e = e[a] || (e[a] = Object.create(null))
    }
    return e
}
function oo(e, t, n) {
    return typeof t == "string" ? Er(xr(e, t), n) : Er(xr(e, ""), t)
}
class Em {
    constructor(t, n) {
        this.animation = void 0,
        this.backgroundColor = "rgba(0,0,0,0.1)",
        this.borderColor = "rgba(0,0,0,0.1)",
        this.color = "#666",
        this.datasets = {},
        this.devicePixelRatio = r => r.chart.platform.getDevicePixelRatio(),
        this.elements = {},
        this.events = ["mousemove", "mouseout", "click", "touchstart", "touchmove"],
        this.font = {
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            size: 12,
            style: "normal",
            lineHeight: 1.2,
            weight: null
        },
        this.hover = {},
        this.hoverBackgroundColor = (r, i) => ao(i.backgroundColor),
        this.hoverBorderColor = (r, i) => ao(i.borderColor),
        this.hoverColor = (r, i) => ao(i.color),
        this.indexAxis = "x",
        this.interaction = {
            mode: "nearest",
            intersect: !0,
            includeInvisible: !1
        },
        this.maintainAspectRatio = !0,
        this.onHover = null,
        this.onClick = null,
        this.parsing = !0,
        this.plugins = {},
        this.responsive = !0,
        this.scale = void 0,
        this.scales = {},
        this.showLine = !0,
        this.drawActiveElementsOnTop = !0,
        this.describe(t),
        this.apply(n)
    }
    set(t, n) {
        return oo(this, t, n)
    }
    get(t) {
        return xr(this, t)
    }
    describe(t, n) {
        return oo(Mo, t, n)
    }
    override(t, n) {
        return oo(Ze, t, n)
    }
    route(t, n, r, i) {
        const a = xr(this, t)
          , o = xr(this, r)
          , s = "_" + n;
        Object.defineProperties(a, {
            [s]: {
                value: a[n],
                writable: !0
            },
            [n]: {
                enumerable: !0,
                get() {
                    const l = this[s]
                      , c = o[i];
                    return Z(l) ? Object.assign({}, c, l) : Y(l, c)
                },
                set(l) {
                    this[s] = l
                }
            }
        })
    }
    apply(t) {
        t.forEach(n => n(this))
    }
}
var st = new Em({
    _scriptable: e => !e.startsWith("on"),
    _indexable: e => e !== "events",
    hover: {
        _fallback: "interaction"
    },
    interaction: {
        _scriptable: !1,
        _indexable: !1
    }
},[_m, Pm, km]);
function Mm(e) {
    return !e || J(e.size) || J(e.family) ? null : (e.style ? e.style + " " : "") + (e.weight ? e.weight + " " : "") + e.size + "px " + e.family
}
function Vi(e, t, n, r, i) {
    let a = t[i];
    return a || (a = t[i] = e.measureText(i).width,
    n.push(i)),
    a > r && (r = a),
    r
}
function Tm(e, t, n, r) {
    r = r || {};
    let i = r.data = r.data || {}
      , a = r.garbageCollect = r.garbageCollect || [];
    r.font !== t && (i = r.data = {},
    a = r.garbageCollect = [],
    r.font = t),
    e.save(),
    e.font = t;
    let o = 0;
    const s = n.length;
    let l, c, u, f, h;
    for (l = 0; l < s; l++)
        if (f = n[l],
        f != null && !ut(f))
            o = Vi(e, i, a, o, f);
        else if (ut(f))
            for (c = 0,
            u = f.length; c < u; c++)
                h = f[c],
                h != null && !ut(h) && (o = Vi(e, i, a, o, h));
    e.restore();
    const d = a.length / 2;
    if (d > n.length) {
        for (l = 0; l < d; l++)
            delete i[a[l]];
        a.splice(0, d)
    }
    return o
}
function $e(e, t, n) {
    const r = e.currentDevicePixelRatio
      , i = n !== 0 ? Math.max(n / 2, .5) : 0;
    return Math.round((t - i) * r) / r + i
}
function Ll(e, t) {
    !t && !e || (t = t || e.getContext("2d"),
    t.save(),
    t.resetTransform(),
    t.clearRect(0, 0, e.width, e.height),
    t.restore())
}
function To(e, t, n, r) {
    mh(e, t, n, r, null)
}
function mh(e, t, n, r, i) {
    let a, o, s, l, c, u, f, h;
    const d = t.pointStyle
      , p = t.rotation
      , g = t.radius;
    let m = (p || 0) * fm;
    if (d && typeof d == "object" && (a = d.toString(),
    a === "[object HTMLImageElement]" || a === "[object HTMLCanvasElement]")) {
        e.save(),
        e.translate(n, r),
        e.rotate(m),
        e.drawImage(d, -d.width / 2, -d.height / 2, d.width, d.height),
        e.restore();
        return
    }
    if (!(isNaN(g) || g <= 0)) {
        switch (e.beginPath(),
        d) {
        default:
            i ? e.ellipse(n, r, i / 2, g, 0, 0, ot) : e.arc(n, r, g, 0, ot),
            e.closePath();
            break;
        case "triangle":
            u = i ? i / 2 : g,
            e.moveTo(n + Math.sin(m) * u, r - Math.cos(m) * g),
            m += El,
            e.lineTo(n + Math.sin(m) * u, r - Math.cos(m) * g),
            m += El,
            e.lineTo(n + Math.sin(m) * u, r - Math.cos(m) * g),
            e.closePath();
            break;
        case "rectRounded":
            c = g * .516,
            l = g - c,
            o = Math.cos(m + Ie) * l,
            f = Math.cos(m + Ie) * (i ? i / 2 - c : l),
            s = Math.sin(m + Ie) * l,
            h = Math.sin(m + Ie) * (i ? i / 2 - c : l),
            e.arc(n - f, r - s, c, m - lt, m - pt),
            e.arc(n + h, r - o, c, m - pt, m),
            e.arc(n + f, r + s, c, m, m + pt),
            e.arc(n - h, r + o, c, m + pt, m + lt),
            e.closePath();
            break;
        case "rect":
            if (!p) {
                l = Math.SQRT1_2 * g,
                u = i ? i / 2 : l,
                e.rect(n - u, r - l, 2 * u, 2 * l);
                break
            }
            m += Ie;
        case "rectRot":
            f = Math.cos(m) * (i ? i / 2 : g),
            o = Math.cos(m) * g,
            s = Math.sin(m) * g,
            h = Math.sin(m) * (i ? i / 2 : g),
            e.moveTo(n - f, r - s),
            e.lineTo(n + h, r - o),
            e.lineTo(n + f, r + s),
            e.lineTo(n - h, r + o),
            e.closePath();
            break;
        case "crossRot":
            m += Ie;
        case "cross":
            f = Math.cos(m) * (i ? i / 2 : g),
            o = Math.cos(m) * g,
            s = Math.sin(m) * g,
            h = Math.sin(m) * (i ? i / 2 : g),
            e.moveTo(n - f, r - s),
            e.lineTo(n + f, r + s),
            e.moveTo(n + h, r - o),
            e.lineTo(n - h, r + o);
            break;
        case "star":
            f = Math.cos(m) * (i ? i / 2 : g),
            o = Math.cos(m) * g,
            s = Math.sin(m) * g,
            h = Math.sin(m) * (i ? i / 2 : g),
            e.moveTo(n - f, r - s),
            e.lineTo(n + f, r + s),
            e.moveTo(n + h, r - o),
            e.lineTo(n - h, r + o),
            m += Ie,
            f = Math.cos(m) * (i ? i / 2 : g),
            o = Math.cos(m) * g,
            s = Math.sin(m) * g,
            h = Math.sin(m) * (i ? i / 2 : g),
            e.moveTo(n - f, r - s),
            e.lineTo(n + f, r + s),
            e.moveTo(n + h, r - o),
            e.lineTo(n - h, r + o);
            break;
        case "line":
            o = i ? i / 2 : Math.cos(m) * g,
            s = Math.sin(m) * g,
            e.moveTo(n - o, r - s),
            e.lineTo(n + o, r + s);
            break;
        case "dash":
            e.moveTo(n, r),
            e.lineTo(n + Math.cos(m) * (i ? i / 2 : g), r + Math.sin(m) * g);
            break;
        case !1:
            e.closePath();
            break
        }
        e.fill(),
        t.borderWidth > 0 && e.stroke()
    }
}
function le(e, t, n) {
    return n = n || .5,
    !t || e && e.x > t.left - n && e.x < t.right + n && e.y > t.top - n && e.y < t.bottom + n
}
function Ca(e, t) {
    e.save(),
    e.beginPath(),
    e.rect(t.left, t.top, t.right - t.left, t.bottom - t.top),
    e.clip()
}
function Da(e) {
    e.restore()
}
function jm(e, t, n, r, i) {
    if (!t)
        return e.lineTo(n.x, n.y);
    if (i === "middle") {
        const a = (t.x + n.x) / 2;
        e.lineTo(a, t.y),
        e.lineTo(a, n.y)
    } else
        i === "after" != !!r ? e.lineTo(t.x, n.y) : e.lineTo(n.x, t.y);
    e.lineTo(n.x, n.y)
}
function Cm(e, t, n, r) {
    if (!t)
        return e.lineTo(n.x, n.y);
    e.bezierCurveTo(r ? t.cp1x : t.cp2x, r ? t.cp1y : t.cp2y, r ? n.cp2x : n.cp1x, r ? n.cp2y : n.cp1y, n.x, n.y)
}
function Dm(e, t) {
    t.translation && e.translate(t.translation[0], t.translation[1]),
    J(t.rotation) || e.rotate(t.rotation),
    t.color && (e.fillStyle = t.color),
    t.textAlign && (e.textAlign = t.textAlign),
    t.textBaseline && (e.textBaseline = t.textBaseline)
}
function Im(e, t, n, r, i) {
    if (i.strikethrough || i.underline) {
        const a = e.measureText(r)
          , o = t - a.actualBoundingBoxLeft
          , s = t + a.actualBoundingBoxRight
          , l = n - a.actualBoundingBoxAscent
          , c = n + a.actualBoundingBoxDescent
          , u = i.strikethrough ? (l + c) / 2 : c;
        e.strokeStyle = e.fillStyle,
        e.beginPath(),
        e.lineWidth = i.decorationWidth || 2,
        e.moveTo(o, u),
        e.lineTo(s, u),
        e.stroke()
    }
}
function $m(e, t) {
    const n = e.fillStyle;
    e.fillStyle = t.color,
    e.fillRect(t.left, t.top, t.width, t.height),
    e.fillStyle = n
}
function Je(e, t, n, r, i, a={}) {
    const o = ut(t) ? t : [t]
      , s = a.strokeWidth > 0 && a.strokeColor !== "";
    let l, c;
    for (e.save(),
    e.font = i.string,
    Dm(e, a),
    l = 0; l < o.length; ++l)
        c = o[l],
        a.backdrop && $m(e, a.backdrop),
        s && (a.strokeColor && (e.strokeStyle = a.strokeColor),
        J(a.strokeWidth) || (e.lineWidth = a.strokeWidth),
        e.strokeText(c, n, r, a.maxWidth)),
        e.fillText(c, n, r, a.maxWidth),
        Im(e, n, r, c, a),
        r += Number(i.lineHeight);
    e.restore()
}
function jr(e, t) {
    const {x: n, y: r, w: i, h: a, radius: o} = t;
    e.arc(n + o.topLeft, r + o.topLeft, o.topLeft, 1.5 * lt, lt, !0),
    e.lineTo(n, r + a - o.bottomLeft),
    e.arc(n + o.bottomLeft, r + a - o.bottomLeft, o.bottomLeft, lt, pt, !0),
    e.lineTo(n + i - o.bottomRight, r + a),
    e.arc(n + i - o.bottomRight, r + a - o.bottomRight, o.bottomRight, pt, 0, !0),
    e.lineTo(n + i, r + o.topRight),
    e.arc(n + i - o.topRight, r + o.topRight, o.topRight, 0, -pt, !0),
    e.lineTo(n + o.topLeft, r)
}
const Lm = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/
  , Rm = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;
function Bm(e, t) {
    const n = ("" + e).match(Lm);
    if (!n || n[1] === "normal")
        return t * 1.2;
    switch (e = +n[2],
    n[3]) {
    case "px":
        return e;
    case "%":
        e /= 100;
        break
    }
    return t * e
}
const Nm = e => +e || 0;
function Gs(e, t) {
    const n = {}
      , r = Z(t)
      , i = r ? Object.keys(t) : t
      , a = Z(e) ? r ? o => Y(e[o], e[t[o]]) : o => e[o] : () => e;
    for (const o of i)
        n[o] = Nm(a(o));
    return n
}
function yh(e) {
    return Gs(e, {
        top: "y",
        right: "x",
        bottom: "y",
        left: "x"
    })
}
function Ge(e) {
    return Gs(e, ["topLeft", "topRight", "bottomLeft", "bottomRight"])
}
function St(e) {
    const t = yh(e);
    return t.width = t.left + t.right,
    t.height = t.top + t.bottom,
    t
}
function vt(e, t) {
    e = e || {},
    t = t || st.font;
    let n = Y(e.size, t.size);
    typeof n == "string" && (n = parseInt(n, 10));
    let r = Y(e.style, t.style);
    r && !("" + r).match(Rm) && (console.warn('Invalid font style specified: "' + r + '"'),
    r = void 0);
    const i = {
        family: Y(e.family, t.family),
        lineHeight: Bm(Y(e.lineHeight, t.lineHeight), n),
        size: n,
        style: r,
        weight: Y(e.weight, t.weight),
        string: ""
    };
    return i.string = Mm(i),
    i
}
function pr(e, t, n, r) {
    let i, a, o;
    for (i = 0,
    a = e.length; i < a; ++i)
        if (o = e[i],
        o !== void 0 && o !== void 0)
            return o
}
function zm(e, t, n) {
    const {min: r, max: i} = e
      , a = ah(t, (i - r) / 2)
      , o = (s, l) => n && s === 0 ? 0 : s + l;
    return {
        min: o(r, -Math.abs(a)),
        max: o(i, a)
    }
}
function Se(e, t) {
    return Object.assign(Object.create(e), t)
}
function Us(e, t=[""], n, r, i= () => e[0]) {
    const a = n || e;
    typeof r > "u" && (r = Oh("_fallback", e));
    const o = {
        [Symbol.toStringTag]: "Object",
        _cacheable: !0,
        _scopes: e,
        _rootScopes: a,
        _fallback: r,
        _getTarget: i,
        override: s => Us([s, ...e], t, a, r)
    };
    return new Proxy(o,{
        deleteProperty(s, l) {
            return delete s[l],
            delete s._keys,
            delete e[0][l],
            !0
        },
        get(s, l) {
            return bh(s, l, () => Um(l, t, e, s))
        },
        getOwnPropertyDescriptor(s, l) {
            return Reflect.getOwnPropertyDescriptor(s._scopes[0], l)
        },
        getPrototypeOf() {
            return Reflect.getPrototypeOf(e[0])
        },
        has(s, l) {
            return Bl(s).includes(l)
        },
        ownKeys(s) {
            return Bl(s)
        },
        set(s, l, c) {
            const u = s._storage || (s._storage = i());
            return s[l] = u[l] = c,
            delete s._keys,
            !0
        }
    })
}
function On(e, t, n, r) {
    const i = {
        _cacheable: !1,
        _proxy: e,
        _context: t,
        _subProxy: n,
        _stack: new Set,
        _descriptors: vh(e, r),
        setContext: a => On(e, a, n, r),
        override: a => On(e.override(a), t, n, r)
    };
    return new Proxy(i,{
        deleteProperty(a, o) {
            return delete a[o],
            delete e[o],
            !0
        },
        get(a, o, s) {
            return bh(a, o, () => Wm(a, o, s))
        },
        getOwnPropertyDescriptor(a, o) {
            return a._descriptors.allKeys ? Reflect.has(e, o) ? {
                enumerable: !0,
                configurable: !0
            } : void 0 : Reflect.getOwnPropertyDescriptor(e, o)
        },
        getPrototypeOf() {
            return Reflect.getPrototypeOf(e)
        },
        has(a, o) {
            return Reflect.has(e, o)
        },
        ownKeys() {
            return Reflect.ownKeys(e)
        },
        set(a, o, s) {
            return e[o] = s,
            delete a[o],
            !0
        }
    })
}
function vh(e, t={
    scriptable: !0,
    indexable: !0
}) {
    const {_scriptable: n=t.scriptable, _indexable: r=t.indexable, _allKeys: i=t.allKeys} = e;
    return {
        allKeys: i,
        scriptable: n,
        indexable: r,
        isScriptable: Pe(n) ? n : () => n,
        isIndexable: Pe(r) ? r : () => r
    }
}
const Fm = (e, t) => e ? e + Ws(t) : t
  , Ys = (e, t) => Z(t) && e !== "adapters" && (Object.getPrototypeOf(t) === null || t.constructor === Object);
function bh(e, t, n) {
    if (Object.prototype.hasOwnProperty.call(e, t) || t === "constructor")
        return e[t];
    const r = n();
    return e[t] = r,
    r
}
function Wm(e, t, n) {
    const {_proxy: r, _context: i, _subProxy: a, _descriptors: o} = e;
    let s = r[t];
    return Pe(s) && o.isScriptable(t) && (s = Vm(t, s, e, n)),
    ut(s) && s.length && (s = Hm(t, s, e, o.isIndexable)),
    Ys(t, s) && (s = On(s, i, a && a[t], o)),
    s
}
function Vm(e, t, n, r) {
    const {_proxy: i, _context: a, _subProxy: o, _stack: s} = n;
    if (s.has(e))
        throw new Error("Recursion detected: " + Array.from(s).join("->") + "->" + e);
    s.add(e);
    let l = t(a, o || r);
    return s.delete(e),
    Ys(e, l) && (l = qs(i._scopes, i, e, l)),
    l
}
function Hm(e, t, n, r) {
    const {_proxy: i, _context: a, _subProxy: o, _descriptors: s} = n;
    if (typeof a.index < "u" && r(e))
        return t[a.index % t.length];
    if (Z(t[0])) {
        const l = t
          , c = i._scopes.filter(u => u !== l);
        t = [];
        for (const u of l) {
            const f = qs(c, i, e, u);
            t.push(On(f, a, o && o[e], s))
        }
    }
    return t
}
function xh(e, t, n) {
    return Pe(e) ? e(t, n) : e
}
const Km = (e, t) => e === !0 ? t : typeof e == "string" ? _e(t, e) : void 0;
function Xm(e, t, n, r, i) {
    for (const a of t) {
        const o = Km(n, a);
        if (o) {
            e.add(o);
            const s = xh(o._fallback, n, i);
            if (typeof s < "u" && s !== n && s !== r)
                return s
        } else if (o === !1 && typeof r < "u" && n !== r)
            return null
    }
    return !1
}
function qs(e, t, n, r) {
    const i = t._rootScopes
      , a = xh(t._fallback, n, r)
      , o = [...e, ...i]
      , s = new Set;
    s.add(r);
    let l = Rl(s, o, n, a || n, r);
    return l === null || typeof a < "u" && a !== n && (l = Rl(s, o, a, l, r),
    l === null) ? !1 : Us(Array.from(s), [""], i, a, () => Gm(t, n, r))
}
function Rl(e, t, n, r, i) {
    for (; n; )
        n = Xm(e, t, n, r, i);
    return n
}
function Gm(e, t, n) {
    const r = e._getTarget();
    t in r || (r[t] = {});
    const i = r[t];
    return ut(i) && Z(n) ? n : i || {}
}
function Um(e, t, n, r) {
    let i;
    for (const a of t)
        if (i = Oh(Fm(a, e), n),
        typeof i < "u")
            return Ys(e, i) ? qs(n, r, e, i) : i
}
function Oh(e, t) {
    for (const n of t) {
        if (!n)
            continue;
        const r = n[e];
        if (typeof r < "u")
            return r
    }
}
function Bl(e) {
    let t = e._keys;
    return t || (t = e._keys = Ym(e._scopes)),
    t
}
function Ym(e) {
    const t = new Set;
    for (const n of e)
        for (const r of Object.keys(n).filter(i => !i.startsWith("_")))
            t.add(r);
    return Array.from(t)
}
function wh(e, t, n, r) {
    const {iScale: i} = e
      , {key: a="r"} = this._parsing
      , o = new Array(r);
    let s, l, c, u;
    for (s = 0,
    l = r; s < l; ++s)
        c = s + n,
        u = t[c],
        o[s] = {
            r: i.parse(_e(u, a), c)
        };
    return o
}
const qm = Number.EPSILON || 1e-14
  , wn = (e, t) => t < e.length && !e[t].skip && e[t]
  , _h = e => e === "x" ? "y" : "x";
function Zm(e, t, n, r) {
    const i = e.skip ? t : e
      , a = t
      , o = n.skip ? t : n
      , s = Eo(a, i)
      , l = Eo(o, a);
    let c = s / (s + l)
      , u = l / (s + l);
    c = isNaN(c) ? 0 : c,
    u = isNaN(u) ? 0 : u;
    const f = r * c
      , h = r * u;
    return {
        previous: {
            x: a.x - f * (o.x - i.x),
            y: a.y - f * (o.y - i.y)
        },
        next: {
            x: a.x + h * (o.x - i.x),
            y: a.y + h * (o.y - i.y)
        }
    }
}
function Jm(e, t, n) {
    const r = e.length;
    let i, a, o, s, l, c = wn(e, 0);
    for (let u = 0; u < r - 1; ++u)
        if (l = c,
        c = wn(e, u + 1),
        !(!l || !c)) {
            if (vr(t[u], 0, qm)) {
                n[u] = n[u + 1] = 0;
                continue
            }
            i = n[u] / t[u],
            a = n[u + 1] / t[u],
            s = Math.pow(i, 2) + Math.pow(a, 2),
            !(s <= 9) && (o = 3 / Math.sqrt(s),
            n[u] = i * o * t[u],
            n[u + 1] = a * o * t[u])
        }
}
function Qm(e, t, n="x") {
    const r = _h(n)
      , i = e.length;
    let a, o, s, l = wn(e, 0);
    for (let c = 0; c < i; ++c) {
        if (o = s,
        s = l,
        l = wn(e, c + 1),
        !s)
            continue;
        const u = s[n]
          , f = s[r];
        o && (a = (u - o[n]) / 3,
        s[`cp1${n}`] = u - a,
        s[`cp1${r}`] = f - a * t[c]),
        l && (a = (l[n] - u) / 3,
        s[`cp2${n}`] = u + a,
        s[`cp2${r}`] = f + a * t[c])
    }
}
function ty(e, t="x") {
    const n = _h(t)
      , r = e.length
      , i = Array(r).fill(0)
      , a = Array(r);
    let o, s, l, c = wn(e, 0);
    for (o = 0; o < r; ++o)
        if (s = l,
        l = c,
        c = wn(e, o + 1),
        !!l) {
            if (c) {
                const u = c[t] - l[t];
                i[o] = u !== 0 ? (c[n] - l[n]) / u : 0
            }
            a[o] = s ? c ? Jt(i[o - 1]) !== Jt(i[o]) ? 0 : (i[o - 1] + i[o]) / 2 : i[o - 1] : i[o]
        }
    Jm(e, i, a),
    Qm(e, a, t)
}
function yi(e, t, n) {
    return Math.max(Math.min(e, n), t)
}
function ey(e, t) {
    let n, r, i, a, o, s = le(e[0], t);
    for (n = 0,
    r = e.length; n < r; ++n)
        o = a,
        a = s,
        s = n < r - 1 && le(e[n + 1], t),
        a && (i = e[n],
        o && (i.cp1x = yi(i.cp1x, t.left, t.right),
        i.cp1y = yi(i.cp1y, t.top, t.bottom)),
        s && (i.cp2x = yi(i.cp2x, t.left, t.right),
        i.cp2y = yi(i.cp2y, t.top, t.bottom)))
}
function ny(e, t, n, r, i) {
    let a, o, s, l;
    if (t.spanGaps && (e = e.filter(c => !c.skip)),
    t.cubicInterpolationMode === "monotone")
        ty(e, i);
    else {
        let c = r ? e[e.length - 1] : e[0];
        for (a = 0,
        o = e.length; a < o; ++a)
            s = e[a],
            l = Zm(c, s, e[Math.min(a + 1, o - (r ? 0 : 1)) % o], t.tension),
            s.cp1x = l.previous.x,
            s.cp1y = l.previous.y,
            s.cp2x = l.next.x,
            s.cp2y = l.next.y,
            c = s
    }
    t.capBezierPoints && ey(e, n)
}
function Zs() {
    return typeof window < "u" && typeof document < "u"
}
function Js(e) {
    let t = e.parentNode;
    return t && t.toString() === "[object ShadowRoot]" && (t = t.host),
    t
}
function Hi(e, t, n) {
    let r;
    return typeof e == "string" ? (r = parseInt(e, 10),
    e.indexOf("%") !== -1 && (r = r / 100 * t.parentNode[n])) : r = e,
    r
}
const Ia = e => e.ownerDocument.defaultView.getComputedStyle(e, null);
function ry(e, t) {
    return Ia(e).getPropertyValue(t)
}
const iy = ["top", "right", "bottom", "left"];
function Ue(e, t, n) {
    const r = {};
    n = n ? "-" + n : "";
    for (let i = 0; i < 4; i++) {
        const a = iy[i];
        r[a] = parseFloat(e[t + "-" + a + n]) || 0
    }
    return r.width = r.left + r.right,
    r.height = r.top + r.bottom,
    r
}
const ay = (e, t, n) => (e > 0 || t > 0) && (!n || !n.shadowRoot);
function oy(e, t) {
    const n = e.touches
      , r = n && n.length ? n[0] : e
      , {offsetX: i, offsetY: a} = r;
    let o = !1, s, l;
    if (ay(i, a, e.target))
        s = i,
        l = a;
    else {
        const c = t.getBoundingClientRect();
        s = r.clientX - c.left,
        l = r.clientY - c.top,
        o = !0
    }
    return {
        x: s,
        y: l,
        box: o
    }
}
function Fe(e, t) {
    if ("native"in e)
        return e;
    const {canvas: n, currentDevicePixelRatio: r} = t
      , i = Ia(n)
      , a = i.boxSizing === "border-box"
      , o = Ue(i, "padding")
      , s = Ue(i, "border", "width")
      , {x: l, y: c, box: u} = oy(e, n)
      , f = o.left + (u && s.left)
      , h = o.top + (u && s.top);
    let {width: d, height: p} = t;
    return a && (d -= o.width + s.width,
    p -= o.height + s.height),
    {
        x: Math.round((l - f) / d * n.width / r),
        y: Math.round((c - h) / p * n.height / r)
    }
}
function sy(e, t, n) {
    let r, i;
    if (t === void 0 || n === void 0) {
        const a = e && Js(e);
        if (!a)
            t = e.clientWidth,
            n = e.clientHeight;
        else {
            const o = a.getBoundingClientRect()
              , s = Ia(a)
              , l = Ue(s, "border", "width")
              , c = Ue(s, "padding");
            t = o.width - c.width - l.width,
            n = o.height - c.height - l.height,
            r = Hi(s.maxWidth, a, "clientWidth"),
            i = Hi(s.maxHeight, a, "clientHeight")
        }
    }
    return {
        width: t,
        height: n,
        maxWidth: r || Wi,
        maxHeight: i || Wi
    }
}
const vi = e => Math.round(e * 10) / 10;
function ly(e, t, n, r) {
    const i = Ia(e)
      , a = Ue(i, "margin")
      , o = Hi(i.maxWidth, e, "clientWidth") || Wi
      , s = Hi(i.maxHeight, e, "clientHeight") || Wi
      , l = sy(e, t, n);
    let {width: c, height: u} = l;
    if (i.boxSizing === "content-box") {
        const h = Ue(i, "border", "width")
          , d = Ue(i, "padding");
        c -= d.width + h.width,
        u -= d.height + h.height
    }
    return c = Math.max(0, c - a.width),
    u = Math.max(0, r ? c / r : u - a.height),
    c = vi(Math.min(c, o, l.maxWidth)),
    u = vi(Math.min(u, s, l.maxHeight)),
    c && !u && (u = vi(c / 2)),
    (t !== void 0 || n !== void 0) && r && l.height && u > l.height && (u = l.height,
    c = vi(Math.floor(u * r))),
    {
        width: c,
        height: u
    }
}
function Nl(e, t, n) {
    const r = t || 1
      , i = Math.floor(e.height * r)
      , a = Math.floor(e.width * r);
    e.height = Math.floor(e.height),
    e.width = Math.floor(e.width);
    const o = e.canvas;
    return o.style && (n || !o.style.height && !o.style.width) && (o.style.height = `${e.height}px`,
    o.style.width = `${e.width}px`),
    e.currentDevicePixelRatio !== r || o.height !== i || o.width !== a ? (e.currentDevicePixelRatio = r,
    o.height = i,
    o.width = a,
    e.ctx.setTransform(r, 0, 0, r, 0, 0),
    !0) : !1
}
const cy = function() {
    let e = !1;
    try {
        const t = {
            get passive() {
                return e = !0,
                !1
            }
        };
        Zs() && (window.addEventListener("test", null, t),
        window.removeEventListener("test", null, t))
    } catch {}
    return e
}();
function zl(e, t) {
    const n = ry(e, t)
      , r = n && n.match(/^(\d+)(\.\d+)?px$/);
    return r ? +r[1] : void 0
}
function We(e, t, n, r) {
    return {
        x: e.x + n * (t.x - e.x),
        y: e.y + n * (t.y - e.y)
    }
}
function uy(e, t, n, r) {
    return {
        x: e.x + n * (t.x - e.x),
        y: r === "middle" ? n < .5 ? e.y : t.y : r === "after" ? n < 1 ? e.y : t.y : n > 0 ? t.y : e.y
    }
}
function fy(e, t, n, r) {
    const i = {
        x: e.cp2x,
        y: e.cp2y
    }
      , a = {
        x: t.cp1x,
        y: t.cp1y
    }
      , o = We(e, i, n)
      , s = We(i, a, n)
      , l = We(a, t, n)
      , c = We(o, s, n)
      , u = We(s, l, n);
    return We(c, u, n)
}
const hy = function(e, t) {
    return {
        x(n) {
            return e + e + t - n
        },
        setWidth(n) {
            t = n
        },
        textAlign(n) {
            return n === "center" ? n : n === "right" ? "left" : "right"
        },
        xPlus(n, r) {
            return n - r
        },
        leftForLtr(n, r) {
            return n - r
        }
    }
}
  , dy = function() {
    return {
        x(e) {
            return e
        },
        setWidth(e) {},
        textAlign(e) {
            return e
        },
        xPlus(e, t) {
            return e + t
        },
        leftForLtr(e, t) {
            return e
        }
    }
};
function mn(e, t, n) {
    return e ? hy(t, n) : dy()
}
function Ph(e, t) {
    let n, r;
    (t === "ltr" || t === "rtl") && (n = e.canvas.style,
    r = [n.getPropertyValue("direction"), n.getPropertyPriority("direction")],
    n.setProperty("direction", t, "important"),
    e.prevTextDirection = r)
}
function Ah(e, t) {
    t !== void 0 && (delete e.prevTextDirection,
    e.canvas.style.setProperty("direction", t[0], t[1]))
}
function Sh(e) {
    return e === "angle" ? {
        between: Tr,
        compare: pm,
        normalize: Rt
    } : {
        between: oe,
        compare: (t, n) => t - n,
        normalize: t => t
    }
}
function Fl({start: e, end: t, count: n, loop: r, style: i}) {
    return {
        start: e % n,
        end: t % n,
        loop: r && (t - e + 1) % n === 0,
        style: i
    }
}
function py(e, t, n) {
    const {property: r, start: i, end: a} = n
      , {between: o, normalize: s} = Sh(r)
      , l = t.length;
    let {start: c, end: u, loop: f} = e, h, d;
    if (f) {
        for (c += l,
        u += l,
        h = 0,
        d = l; h < d && o(s(t[c % l][r]), i, a); ++h)
            c--,
            u--;
        c %= l,
        u %= l
    }
    return u < c && (u += l),
    {
        start: c,
        end: u,
        loop: f,
        style: e.style
    }
}
function kh(e, t, n) {
    if (!n)
        return [e];
    const {property: r, start: i, end: a} = n
      , o = t.length
      , {compare: s, between: l, normalize: c} = Sh(r)
      , {start: u, end: f, loop: h, style: d} = py(e, t, n)
      , p = [];
    let g = !1, m = null, v, b, x;
    const w = () => l(i, x, v) && s(i, x) !== 0
      , y = () => s(a, v) === 0 || l(a, x, v)
      , O = () => g || w()
      , _ = () => !g || y();
    for (let P = u, S = u; P <= f; ++P)
        b = t[P % o],
        !b.skip && (v = c(b[r]),
        v !== x && (g = l(v, i, a),
        m === null && O() && (m = s(v, i) === 0 ? P : S),
        m !== null && _() && (p.push(Fl({
            start: m,
            end: P,
            loop: h,
            count: o,
            style: d
        })),
        m = null),
        S = P,
        x = v));
    return m !== null && p.push(Fl({
        start: m,
        end: f,
        loop: h,
        count: o,
        style: d
    })),
    p
}
function Eh(e, t) {
    const n = []
      , r = e.segments;
    for (let i = 0; i < r.length; i++) {
        const a = kh(r[i], e.points, t);
        a.length && n.push(...a)
    }
    return n
}
function gy(e, t, n, r) {
    let i = 0
      , a = t - 1;
    if (n && !r)
        for (; i < t && !e[i].skip; )
            i++;
    for (; i < t && e[i].skip; )
        i++;
    for (i %= t,
    n && (a += i); a > i && e[a % t].skip; )
        a--;
    return a %= t,
    {
        start: i,
        end: a
    }
}
function my(e, t, n, r) {
    const i = e.length
      , a = [];
    let o = t, s = e[t], l;
    for (l = t + 1; l <= n; ++l) {
        const c = e[l % i];
        c.skip || c.stop ? s.skip || (r = !1,
        a.push({
            start: t % i,
            end: (l - 1) % i,
            loop: r
        }),
        t = o = c.stop ? l : null) : (o = l,
        s.skip && (t = l)),
        s = c
    }
    return o !== null && a.push({
        start: t % i,
        end: o % i,
        loop: r
    }),
    a
}
function yy(e, t) {
    const n = e.points
      , r = e.options.spanGaps
      , i = n.length;
    if (!i)
        return [];
    const a = !!e._loop
      , {start: o, end: s} = gy(n, i, a, r);
    if (r === !0)
        return Wl(e, [{
            start: o,
            end: s,
            loop: a
        }], n, t);
    const l = s < o ? s + i : s
      , c = !!e._fullLoop && o === 0 && s === i - 1;
    return Wl(e, my(n, o, l, c), n, t)
}
function Wl(e, t, n, r) {
    return !r || !r.setContext || !n ? t : vy(e, t, n, r)
}
function vy(e, t, n, r) {
    const i = e._chart.getContext()
      , a = Vl(e.options)
      , {_datasetIndex: o, options: {spanGaps: s}} = e
      , l = n.length
      , c = [];
    let u = a
      , f = t[0].start
      , h = f;
    function d(p, g, m, v) {
        const b = s ? -1 : 1;
        if (p !== g) {
            for (p += l; n[p % l].skip; )
                p -= b;
            for (; n[g % l].skip; )
                g += b;
            p % l !== g % l && (c.push({
                start: p % l,
                end: g % l,
                loop: m,
                style: v
            }),
            u = v,
            f = g % l)
        }
    }
    for (const p of t) {
        f = s ? f : p.start;
        let g = n[f % l], m;
        for (h = f + 1; h <= p.end; h++) {
            const v = n[h % l];
            m = Vl(r.setContext(Se(i, {
                type: "segment",
                p0: g,
                p1: v,
                p0DataIndex: (h - 1) % l,
                p1DataIndex: h % l,
                datasetIndex: o
            }))),
            by(m, u) && d(f, h - 1, p.loop, u),
            g = v,
            u = m
        }
        f < h - 1 && d(f, h - 1, p.loop, u)
    }
    return c
}
function Vl(e) {
    return {
        backgroundColor: e.backgroundColor,
        borderCapStyle: e.borderCapStyle,
        borderDash: e.borderDash,
        borderDashOffset: e.borderDashOffset,
        borderJoinStyle: e.borderJoinStyle,
        borderWidth: e.borderWidth,
        borderColor: e.borderColor
    }
}
function by(e, t) {
    if (!t)
        return !1;
    const n = []
      , r = function(i, a) {
        return Xs(a) ? (n.includes(a) || n.push(a),
        n.indexOf(a)) : a
    };
    return JSON.stringify(e, r) !== JSON.stringify(t, r)
}
/*!
 * Chart.js v4.4.7
 * https://www.chartjs.org
 * (c) 2024 Chart.js Contributors
 * Released under the MIT License
 */
class xy {
    constructor() {
        this._request = null,
        this._charts = new Map,
        this._running = !1,
        this._lastDate = void 0
    }
    _notify(t, n, r, i) {
        const a = n.listeners[i]
          , o = n.duration;
        a.forEach(s => s({
            chart: t,
            initial: n.initial,
            numSteps: o,
            currentStep: Math.min(r - n.start, o)
        }))
    }
    _refresh() {
        this._request || (this._running = !0,
        this._request = fh.call(window, () => {
            this._update(),
            this._request = null,
            this._running && this._refresh()
        }
        ))
    }
    _update(t=Date.now()) {
        let n = 0;
        this._charts.forEach( (r, i) => {
            if (!r.running || !r.items.length)
                return;
            const a = r.items;
            let o = a.length - 1, s = !1, l;
            for (; o >= 0; --o)
                l = a[o],
                l._active ? (l._total > r.duration && (r.duration = l._total),
                l.tick(t),
                s = !0) : (a[o] = a[a.length - 1],
                a.pop());
            s && (i.draw(),
            this._notify(i, r, t, "progress")),
            a.length || (r.running = !1,
            this._notify(i, r, t, "complete"),
            r.initial = !1),
            n += a.length
        }
        ),
        this._lastDate = t,
        n === 0 && (this._running = !1)
    }
    _getAnims(t) {
        const n = this._charts;
        let r = n.get(t);
        return r || (r = {
            running: !1,
            initial: !0,
            items: [],
            listeners: {
                complete: [],
                progress: []
            }
        },
        n.set(t, r)),
        r
    }
    listen(t, n, r) {
        this._getAnims(t).listeners[n].push(r)
    }
    add(t, n) {
        !n || !n.length || this._getAnims(t).items.push(...n)
    }
    has(t) {
        return this._getAnims(t).items.length > 0
    }
    start(t) {
        const n = this._charts.get(t);
        n && (n.running = !0,
        n.start = Date.now(),
        n.duration = n.items.reduce( (r, i) => Math.max(r, i._duration), 0),
        this._refresh())
    }
    running(t) {
        if (!this._running)
            return !1;
        const n = this._charts.get(t);
        return !(!n || !n.running || !n.items.length)
    }
    stop(t) {
        const n = this._charts.get(t);
        if (!n || !n.items.length)
            return;
        const r = n.items;
        let i = r.length - 1;
        for (; i >= 0; --i)
            r[i].cancel();
        n.items = [],
        this._notify(t, n, Date.now(), "complete")
    }
    remove(t) {
        return this._charts.delete(t)
    }
}
var qt = new xy;
const Hl = "transparent"
  , Oy = {
    boolean(e, t, n) {
        return n > .5 ? t : e
    },
    color(e, t, n) {
        const r = Il(e || Hl)
          , i = r.valid && Il(t || Hl);
        return i && i.valid ? i.mix(r, n).hexString() : t
    },
    number(e, t, n) {
        return e + (t - e) * n
    }
};
class Mh {
    constructor(t, n, r, i) {
        const a = n[r];
        i = pr([t.to, i, a, t.from]);
        const o = pr([t.from, a, i]);
        this._active = !0,
        this._fn = t.fn || Oy[t.type || typeof o],
        this._easing = br[t.easing] || br.linear,
        this._start = Math.floor(Date.now() + (t.delay || 0)),
        this._duration = this._total = Math.floor(t.duration),
        this._loop = !!t.loop,
        this._target = n,
        this._prop = r,
        this._from = o,
        this._to = i,
        this._promises = void 0
    }
    active() {
        return this._active
    }
    update(t, n, r) {
        if (this._active) {
            this._notify(!1);
            const i = this._target[this._prop]
              , a = r - this._start
              , o = this._duration - a;
            this._start = r,
            this._duration = Math.floor(Math.max(o, t.duration)),
            this._total += a,
            this._loop = !!t.loop,
            this._to = pr([t.to, n, i, t.from]),
            this._from = pr([t.from, i, n])
        }
    }
    cancel() {
        this._active && (this.tick(Date.now()),
        this._active = !1,
        this._notify(!1))
    }
    tick(t) {
        const n = t - this._start
          , r = this._duration
          , i = this._prop
          , a = this._from
          , o = this._loop
          , s = this._to;
        let l;
        if (this._active = a !== s && (o || n < r),
        !this._active) {
            this._target[i] = s,
            this._notify(!0);
            return
        }
        if (n < 0) {
            this._target[i] = a;
            return
        }
        l = n / r % 2,
        l = o && l > 1 ? 2 - l : l,
        l = this._easing(Math.min(1, Math.max(0, l))),
        this._target[i] = this._fn(a, s, l)
    }
    wait() {
        const t = this._promises || (this._promises = []);
        return new Promise( (n, r) => {
            t.push({
                res: n,
                rej: r
            })
        }
        )
    }
    _notify(t) {
        const n = t ? "res" : "rej"
          , r = this._promises || [];
        for (let i = 0; i < r.length; i++)
            r[i][n]()
    }
}
class Qs {
    constructor(t, n) {
        this._chart = t,
        this._properties = new Map,
        this.configure(n)
    }
    configure(t) {
        if (!Z(t))
            return;
        const n = Object.keys(st.animation)
          , r = this._properties;
        Object.getOwnPropertyNames(t).forEach(i => {
            const a = t[i];
            if (!Z(a))
                return;
            const o = {};
            for (const s of n)
                o[s] = a[s];
            (ut(a.properties) && a.properties || [i]).forEach(s => {
                (s === i || !r.has(s)) && r.set(s, o)
            }
            )
        }
        )
    }
    _animateOptions(t, n) {
        const r = n.options
          , i = _y(t, r);
        if (!i)
            return [];
        const a = this._createAnimations(i, r);
        return r.$shared && wy(t.options.$animations, r).then( () => {
            t.options = r
        }
        , () => {}
        ),
        a
    }
    _createAnimations(t, n) {
        const r = this._properties
          , i = []
          , a = t.$animations || (t.$animations = {})
          , o = Object.keys(n)
          , s = Date.now();
        let l;
        for (l = o.length - 1; l >= 0; --l) {
            const c = o[l];
            if (c.charAt(0) === "$")
                continue;
            if (c === "options") {
                i.push(...this._animateOptions(t, n));
                continue
            }
            const u = n[c];
            let f = a[c];
            const h = r.get(c);
            if (f)
                if (h && f.active()) {
                    f.update(h, u, s);
                    continue
                } else
                    f.cancel();
            if (!h || !h.duration) {
                t[c] = u;
                continue
            }
            a[c] = f = new Mh(h,t,c,u),
            i.push(f)
        }
        return i
    }
    update(t, n) {
        if (this._properties.size === 0) {
            Object.assign(t, n);
            return
        }
        const r = this._createAnimations(t, n);
        if (r.length)
            return qt.add(this._chart, r),
            !0
    }
}
function wy(e, t) {
    const n = []
      , r = Object.keys(t);
    for (let i = 0; i < r.length; i++) {
        const a = e[r[i]];
        a && a.active() && n.push(a.wait())
    }
    return Promise.all(n)
}
function _y(e, t) {
    if (!t)
        return;
    let n = e.options;
    if (!n) {
        e.options = t;
        return
    }
    return n.$shared && (e.options = n = Object.assign({}, n, {
        $shared: !1,
        $animations: {}
    })),
    n
}
function Kl(e, t) {
    const n = e && e.options || {}
      , r = n.reverse
      , i = n.min === void 0 ? t : 0
      , a = n.max === void 0 ? t : 0;
    return {
        start: r ? a : i,
        end: r ? i : a
    }
}
function Py(e, t, n) {
    if (n === !1)
        return !1;
    const r = Kl(e, n)
      , i = Kl(t, n);
    return {
        top: i.end,
        right: r.end,
        bottom: i.start,
        left: r.start
    }
}
function Ay(e) {
    let t, n, r, i;
    return Z(e) ? (t = e.top,
    n = e.right,
    r = e.bottom,
    i = e.left) : t = n = r = i = e,
    {
        top: t,
        right: n,
        bottom: r,
        left: i,
        disabled: e === !1
    }
}
function Th(e, t) {
    const n = []
      , r = e._getSortedDatasetMetas(t);
    let i, a;
    for (i = 0,
    a = r.length; i < a; ++i)
        n.push(r[i].index);
    return n
}
function Xl(e, t, n, r={}) {
    const i = e.keys
      , a = r.mode === "single";
    let o, s, l, c;
    if (t === null)
        return;
    let u = !1;
    for (o = 0,
    s = i.length; o < s; ++o) {
        if (l = +i[o],
        l === n) {
            if (u = !0,
            r.all)
                continue;
            break
        }
        c = e.values[l],
        dt(c) && (a || t === 0 || Jt(t) === Jt(c)) && (t += c)
    }
    return !u && !r.all ? 0 : t
}
function Sy(e, t) {
    const {iScale: n, vScale: r} = t
      , i = n.axis === "x" ? "x" : "y"
      , a = r.axis === "x" ? "x" : "y"
      , o = Object.keys(e)
      , s = new Array(o.length);
    let l, c, u;
    for (l = 0,
    c = o.length; l < c; ++l)
        u = o[l],
        s[l] = {
            [i]: u,
            [a]: e[u]
        };
    return s
}
function so(e, t) {
    const n = e && e.options.stacked;
    return n || n === void 0 && t.stack !== void 0
}
function ky(e, t, n) {
    return `${e.id}.${t.id}.${n.stack || n.type}`
}
function Ey(e) {
    const {min: t, max: n, minDefined: r, maxDefined: i} = e.getUserBounds();
    return {
        min: r ? t : Number.NEGATIVE_INFINITY,
        max: i ? n : Number.POSITIVE_INFINITY
    }
}
function My(e, t, n) {
    const r = e[t] || (e[t] = {});
    return r[n] || (r[n] = {})
}
function Gl(e, t, n, r) {
    for (const i of t.getMatchingVisibleMetas(r).reverse()) {
        const a = e[i.index];
        if (n && a > 0 || !n && a < 0)
            return i.index
    }
    return null
}
function Ul(e, t) {
    const {chart: n, _cachedMeta: r} = e
      , i = n._stacks || (n._stacks = {})
      , {iScale: a, vScale: o, index: s} = r
      , l = a.axis
      , c = o.axis
      , u = ky(a, o, r)
      , f = t.length;
    let h;
    for (let d = 0; d < f; ++d) {
        const p = t[d]
          , {[l]: g, [c]: m} = p
          , v = p._stacks || (p._stacks = {});
        h = v[c] = My(i, u, g),
        h[s] = m,
        h._top = Gl(h, o, !0, r.type),
        h._bottom = Gl(h, o, !1, r.type);
        const b = h._visualValues || (h._visualValues = {});
        b[s] = m
    }
}
function lo(e, t) {
    const n = e.scales;
    return Object.keys(n).filter(r => n[r].axis === t).shift()
}
function Ty(e, t) {
    return Se(e, {
        active: !1,
        dataset: void 0,
        datasetIndex: t,
        index: t,
        mode: "default",
        type: "dataset"
    })
}
function jy(e, t, n) {
    return Se(e, {
        active: !1,
        dataIndex: t,
        parsed: void 0,
        raw: void 0,
        element: n,
        index: t,
        mode: "default",
        type: "data"
    })
}
function ar(e, t) {
    const n = e.controller.index
      , r = e.vScale && e.vScale.axis;
    if (r) {
        t = t || e._parsed;
        for (const i of t) {
            const a = i._stacks;
            if (!a || a[r] === void 0 || a[r][n] === void 0)
                return;
            delete a[r][n],
            a[r]._visualValues !== void 0 && a[r]._visualValues[n] !== void 0 && delete a[r]._visualValues[n]
        }
    }
}
const co = e => e === "reset" || e === "none"
  , Yl = (e, t) => t ? e : Object.assign({}, e)
  , Cy = (e, t, n) => e && !t.hidden && t._stacked && {
    keys: Th(n, !0),
    values: null
};
class he {
    static defaults = {};
    static datasetElementType = null;
    static dataElementType = null;
    constructor(t, n) {
        this.chart = t,
        this._ctx = t.ctx,
        this.index = n,
        this._cachedDataOpts = {},
        this._cachedMeta = this.getMeta(),
        this._type = this._cachedMeta.type,
        this.options = void 0,
        this._parsing = !1,
        this._data = void 0,
        this._objectData = void 0,
        this._sharedOptions = void 0,
        this._drawStart = void 0,
        this._drawCount = void 0,
        this.enableOptionSharing = !1,
        this.supportsDecimation = !1,
        this.$context = void 0,
        this._syncList = [],
        this.datasetElementType = new.target.datasetElementType,
        this.dataElementType = new.target.dataElementType,
        this.initialize()
    }
    initialize() {
        const t = this._cachedMeta;
        this.configure(),
        this.linkScales(),
        t._stacked = so(t.vScale, t),
        this.addElements(),
        this.options.fill && !this.chart.isPluginEnabled("filler") && console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options")
    }
    updateIndex(t) {
        this.index !== t && ar(this._cachedMeta),
        this.index = t
    }
    linkScales() {
        const t = this.chart
          , n = this._cachedMeta
          , r = this.getDataset()
          , i = (f, h, d, p) => f === "x" ? h : f === "r" ? p : d
          , a = n.xAxisID = Y(r.xAxisID, lo(t, "x"))
          , o = n.yAxisID = Y(r.yAxisID, lo(t, "y"))
          , s = n.rAxisID = Y(r.rAxisID, lo(t, "r"))
          , l = n.indexAxis
          , c = n.iAxisID = i(l, a, o, s)
          , u = n.vAxisID = i(l, o, a, s);
        n.xScale = this.getScaleForId(a),
        n.yScale = this.getScaleForId(o),
        n.rScale = this.getScaleForId(s),
        n.iScale = this.getScaleForId(c),
        n.vScale = this.getScaleForId(u)
    }
    getDataset() {
        return this.chart.data.datasets[this.index]
    }
    getMeta() {
        return this.chart.getDatasetMeta(this.index)
    }
    getScaleForId(t) {
        return this.chart.scales[t]
    }
    _getOtherScale(t) {
        const n = this._cachedMeta;
        return t === n.iScale ? n.vScale : n.iScale
    }
    reset() {
        this._update("reset")
    }
    _destroy() {
        const t = this._cachedMeta;
        this._data && jl(this._data, this),
        t._stacked && ar(t)
    }
    _dataCheck() {
        const t = this.getDataset()
          , n = t.data || (t.data = [])
          , r = this._data;
        if (Z(n)) {
            const i = this._cachedMeta;
            this._data = Sy(n, i)
        } else if (r !== n) {
            if (r) {
                jl(r, this);
                const i = this._cachedMeta;
                ar(i),
                i._parsed = []
            }
            n && Object.isExtensible(n) && vm(n, this),
            this._syncList = [],
            this._data = n
        }
    }
    addElements() {
        const t = this._cachedMeta;
        this._dataCheck(),
        this.datasetElementType && (t.dataset = new this.datasetElementType)
    }
    buildOrUpdateElements(t) {
        const n = this._cachedMeta
          , r = this.getDataset();
        let i = !1;
        this._dataCheck();
        const a = n._stacked;
        n._stacked = so(n.vScale, n),
        n.stack !== r.stack && (i = !0,
        ar(n),
        n.stack = r.stack),
        this._resyncElements(t),
        (i || a !== n._stacked) && (Ul(this, n._parsed),
        n._stacked = so(n.vScale, n))
    }
    configure() {
        const t = this.chart.config
          , n = t.datasetScopeKeys(this._type)
          , r = t.getOptionScopes(this.getDataset(), n, !0);
        this.options = t.createResolver(r, this.getContext()),
        this._parsing = this.options.parsing,
        this._cachedDataOpts = {}
    }
    parse(t, n) {
        const {_cachedMeta: r, _data: i} = this
          , {iScale: a, _stacked: o} = r
          , s = a.axis;
        let l = t === 0 && n === i.length ? !0 : r._sorted, c = t > 0 && r._parsed[t - 1], u, f, h;
        if (this._parsing === !1)
            r._parsed = i,
            r._sorted = !0,
            h = i;
        else {
            ut(i[t]) ? h = this.parseArrayData(r, i, t, n) : Z(i[t]) ? h = this.parseObjectData(r, i, t, n) : h = this.parsePrimitiveData(r, i, t, n);
            const d = () => f[s] === null || c && f[s] < c[s];
            for (u = 0; u < n; ++u)
                r._parsed[u + t] = f = h[u],
                l && (d() && (l = !1),
                c = f);
            r._sorted = l
        }
        o && Ul(this, h)
    }
    parsePrimitiveData(t, n, r, i) {
        const {iScale: a, vScale: o} = t
          , s = a.axis
          , l = o.axis
          , c = a.getLabels()
          , u = a === o
          , f = new Array(i);
        let h, d, p;
        for (h = 0,
        d = i; h < d; ++h)
            p = h + r,
            f[h] = {
                [s]: u || a.parse(c[p], p),
                [l]: o.parse(n[p], p)
            };
        return f
    }
    parseArrayData(t, n, r, i) {
        const {xScale: a, yScale: o} = t
          , s = new Array(i);
        let l, c, u, f;
        for (l = 0,
        c = i; l < c; ++l)
            u = l + r,
            f = n[u],
            s[l] = {
                x: a.parse(f[0], u),
                y: o.parse(f[1], u)
            };
        return s
    }
    parseObjectData(t, n, r, i) {
        const {xScale: a, yScale: o} = t
          , {xAxisKey: s="x", yAxisKey: l="y"} = this._parsing
          , c = new Array(i);
        let u, f, h, d;
        for (u = 0,
        f = i; u < f; ++u)
            h = u + r,
            d = n[h],
            c[u] = {
                x: a.parse(_e(d, s), h),
                y: o.parse(_e(d, l), h)
            };
        return c
    }
    getParsed(t) {
        return this._cachedMeta._parsed[t]
    }
    getDataElement(t) {
        return this._cachedMeta.data[t]
    }
    applyStack(t, n, r) {
        const i = this.chart
          , a = this._cachedMeta
          , o = n[t.axis]
          , s = {
            keys: Th(i, !0),
            values: n._stacks[t.axis]._visualValues
        };
        return Xl(s, o, a.index, {
            mode: r
        })
    }
    updateRangeFromParsed(t, n, r, i) {
        const a = r[n.axis];
        let o = a === null ? NaN : a;
        const s = i && r._stacks[n.axis];
        i && s && (i.values = s,
        o = Xl(i, a, this._cachedMeta.index)),
        t.min = Math.min(t.min, o),
        t.max = Math.max(t.max, o)
    }
    getMinMax(t, n) {
        const r = this._cachedMeta
          , i = r._parsed
          , a = r._sorted && t === r.iScale
          , o = i.length
          , s = this._getOtherScale(t)
          , l = Cy(n, r, this.chart)
          , c = {
            min: Number.POSITIVE_INFINITY,
            max: Number.NEGATIVE_INFINITY
        }
          , {min: u, max: f} = Ey(s);
        let h, d;
        function p() {
            d = i[h];
            const g = d[s.axis];
            return !dt(d[t.axis]) || u > g || f < g
        }
        for (h = 0; h < o && !(!p() && (this.updateRangeFromParsed(c, t, d, l),
        a)); ++h)
            ;
        if (a) {
            for (h = o - 1; h >= 0; --h)
                if (!p()) {
                    this.updateRangeFromParsed(c, t, d, l);
                    break
                }
        }
        return c
    }
    getAllParsedValues(t) {
        const n = this._cachedMeta._parsed
          , r = [];
        let i, a, o;
        for (i = 0,
        a = n.length; i < a; ++i)
            o = n[i][t.axis],
            dt(o) && r.push(o);
        return r
    }
    getMaxOverflow() {
        return !1
    }
    getLabelAndValue(t) {
        const n = this._cachedMeta
          , r = n.iScale
          , i = n.vScale
          , a = this.getParsed(t);
        return {
            label: r ? "" + r.getLabelForValue(a[r.axis]) : "",
            value: i ? "" + i.getLabelForValue(a[i.axis]) : ""
        }
    }
    _update(t) {
        const n = this._cachedMeta;
        this.update(t || "default"),
        n._clip = Ay(Y(this.options.clip, Py(n.xScale, n.yScale, this.getMaxOverflow())))
    }
    update(t) {}
    draw() {
        const t = this._ctx
          , n = this.chart
          , r = this._cachedMeta
          , i = r.data || []
          , a = n.chartArea
          , o = []
          , s = this._drawStart || 0
          , l = this._drawCount || i.length - s
          , c = this.options.drawActiveElementsOnTop;
        let u;
        for (r.dataset && r.dataset.draw(t, a, s, l),
        u = s; u < s + l; ++u) {
            const f = i[u];
            f.hidden || (f.active && c ? o.push(f) : f.draw(t, a))
        }
        for (u = 0; u < o.length; ++u)
            o[u].draw(t, a)
    }
    getStyle(t, n) {
        const r = n ? "active" : "default";
        return t === void 0 && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(r) : this.resolveDataElementOptions(t || 0, r)
    }
    getContext(t, n, r) {
        const i = this.getDataset();
        let a;
        if (t >= 0 && t < this._cachedMeta.data.length) {
            const o = this._cachedMeta.data[t];
            a = o.$context || (o.$context = jy(this.getContext(), t, o)),
            a.parsed = this.getParsed(t),
            a.raw = i.data[t],
            a.index = a.dataIndex = t
        } else
            a = this.$context || (this.$context = Ty(this.chart.getContext(), this.index)),
            a.dataset = i,
            a.index = a.datasetIndex = this.index;
        return a.active = !!n,
        a.mode = r,
        a
    }
    resolveDatasetElementOptions(t) {
        return this._resolveElementOptions(this.datasetElementType.id, t)
    }
    resolveDataElementOptions(t, n) {
        return this._resolveElementOptions(this.dataElementType.id, n, t)
    }
    _resolveElementOptions(t, n="default", r) {
        const i = n === "active"
          , a = this._cachedDataOpts
          , o = t + "-" + n
          , s = a[o]
          , l = this.enableOptionSharing && Mr(r);
        if (s)
            return Yl(s, l);
        const c = this.chart.config
          , u = c.datasetElementScopeKeys(this._type, t)
          , f = i ? [`${t}Hover`, "hover", t, ""] : [t, ""]
          , h = c.getOptionScopes(this.getDataset(), u)
          , d = Object.keys(st.elements[t])
          , p = () => this.getContext(r, i, n)
          , g = c.resolveNamedOptions(h, d, p, f);
        return g.$shared && (g.$shared = l,
        a[o] = Object.freeze(Yl(g, l))),
        g
    }
    _resolveAnimations(t, n, r) {
        const i = this.chart
          , a = this._cachedDataOpts
          , o = `animation-${n}`
          , s = a[o];
        if (s)
            return s;
        let l;
        if (i.options.animation !== !1) {
            const u = this.chart.config
              , f = u.datasetAnimationScopeKeys(this._type, n)
              , h = u.getOptionScopes(this.getDataset(), f);
            l = u.createResolver(h, this.getContext(t, r, n))
        }
        const c = new Qs(i,l && l.animations);
        return l && l._cacheable && (a[o] = Object.freeze(c)),
        c
    }
    getSharedOptions(t) {
        if (t.$shared)
            return this._sharedOptions || (this._sharedOptions = Object.assign({}, t))
    }
    includeOptions(t, n) {
        return !n || co(t) || this.chart._animationsDisabled
    }
    _getSharedOptions(t, n) {
        const r = this.resolveDataElementOptions(t, n)
          , i = this._sharedOptions
          , a = this.getSharedOptions(r)
          , o = this.includeOptions(n, a) || a !== i;
        return this.updateSharedOptions(a, n, r),
        {
            sharedOptions: a,
            includeOptions: o
        }
    }
    updateElement(t, n, r, i) {
        co(i) ? Object.assign(t, r) : this._resolveAnimations(n, i).update(t, r)
    }
    updateSharedOptions(t, n, r) {
        t && !co(n) && this._resolveAnimations(void 0, n).update(t, r)
    }
    _setStyle(t, n, r, i) {
        t.active = i;
        const a = this.getStyle(n, i);
        this._resolveAnimations(n, r, i).update(t, {
            options: !i && this.getSharedOptions(a) || a
        })
    }
    removeHoverStyle(t, n, r) {
        this._setStyle(t, r, "active", !1)
    }
    setHoverStyle(t, n, r) {
        this._setStyle(t, r, "active", !0)
    }
    _removeDatasetHoverStyle() {
        const t = this._cachedMeta.dataset;
        t && this._setStyle(t, void 0, "active", !1)
    }
    _setDatasetHoverStyle() {
        const t = this._cachedMeta.dataset;
        t && this._setStyle(t, void 0, "active", !0)
    }
    _resyncElements(t) {
        const n = this._data
          , r = this._cachedMeta.data;
        for (const [s,l,c] of this._syncList)
            this[s](l, c);
        this._syncList = [];
        const i = r.length
          , a = n.length
          , o = Math.min(a, i);
        o && this.parse(0, o),
        a > i ? this._insertElements(i, a - i, t) : a < i && this._removeElements(a, i - a)
    }
    _insertElements(t, n, r=!0) {
        const i = this._cachedMeta
          , a = i.data
          , o = t + n;
        let s;
        const l = c => {
            for (c.length += n,
            s = c.length - 1; s >= o; s--)
                c[s] = c[s - n]
        }
        ;
        for (l(a),
        s = t; s < o; ++s)
            a[s] = new this.dataElementType;
        this._parsing && l(i._parsed),
        this.parse(t, n),
        r && this.updateElements(a, t, n, "reset")
    }
    updateElements(t, n, r, i) {}
    _removeElements(t, n) {
        const r = this._cachedMeta;
        if (this._parsing) {
            const i = r._parsed.splice(t, n);
            r._stacked && ar(r, i)
        }
        r.data.splice(t, n)
    }
    _sync(t) {
        if (this._parsing)
            this._syncList.push(t);
        else {
            const [n,r,i] = t;
            this[n](r, i)
        }
        this.chart._dataChanges.push([this.index, ...t])
    }
    _onDataPush() {
        const t = arguments.length;
        this._sync(["_insertElements", this.getDataset().data.length - t, t])
    }
    _onDataPop() {
        this._sync(["_removeElements", this._cachedMeta.data.length - 1, 1])
    }
    _onDataShift() {
        this._sync(["_removeElements", 0, 1])
    }
    _onDataSplice(t, n) {
        n && this._sync(["_removeElements", t, n]);
        const r = arguments.length - 2;
        r && this._sync(["_insertElements", t, r])
    }
    _onDataUnshift() {
        this._sync(["_insertElements", 0, arguments.length])
    }
}
function Dy(e, t) {
    if (!e._cache.$bar) {
        const n = e.getMatchingVisibleMetas(t);
        let r = [];
        for (let i = 0, a = n.length; i < a; i++)
            r = r.concat(n[i].controller.getAllParsedValues(e));
        e._cache.$bar = uh(r.sort( (i, a) => i - a))
    }
    return e._cache.$bar
}
function Iy(e) {
    const t = e.iScale
      , n = Dy(t, e.type);
    let r = t._length, i, a, o, s;
    const l = () => {
        o === 32767 || o === -32768 || (Mr(s) && (r = Math.min(r, Math.abs(o - s) || r)),
        s = o)
    }
    ;
    for (i = 0,
    a = n.length; i < a; ++i)
        o = t.getPixelForValue(n[i]),
        l();
    for (s = void 0,
    i = 0,
    a = t.ticks.length; i < a; ++i)
        o = t.getPixelForTick(i),
        l();
    return r
}
function $y(e, t, n, r) {
    const i = n.barThickness;
    let a, o;
    return J(i) ? (a = t.min * n.categoryPercentage,
    o = n.barPercentage) : (a = i * r,
    o = 1),
    {
        chunk: a / r,
        ratio: o,
        start: t.pixels[e] - a / 2
    }
}
function Ly(e, t, n, r) {
    const i = t.pixels
      , a = i[e];
    let o = e > 0 ? i[e - 1] : null
      , s = e < i.length - 1 ? i[e + 1] : null;
    const l = n.categoryPercentage;
    o === null && (o = a - (s === null ? t.end - t.start : s - a)),
    s === null && (s = a + a - o);
    const c = a - (a - Math.min(o, s)) / 2 * l;
    return {
        chunk: Math.abs(s - o) / 2 * l / r,
        ratio: n.barPercentage,
        start: c
    }
}
function Ry(e, t, n, r) {
    const i = n.parse(e[0], r)
      , a = n.parse(e[1], r)
      , o = Math.min(i, a)
      , s = Math.max(i, a);
    let l = o
      , c = s;
    Math.abs(o) > Math.abs(s) && (l = s,
    c = o),
    t[n.axis] = c,
    t._custom = {
        barStart: l,
        barEnd: c,
        start: i,
        end: a,
        min: o,
        max: s
    }
}
function jh(e, t, n, r) {
    return ut(e) ? Ry(e, t, n, r) : t[n.axis] = n.parse(e, r),
    t
}
function ql(e, t, n, r) {
    const i = e.iScale
      , a = e.vScale
      , o = i.getLabels()
      , s = i === a
      , l = [];
    let c, u, f, h;
    for (c = n,
    u = n + r; c < u; ++c)
        h = t[c],
        f = {},
        f[i.axis] = s || i.parse(o[c], c),
        l.push(jh(h, f, a, c));
    return l
}
function uo(e) {
    return e && e.barStart !== void 0 && e.barEnd !== void 0
}
function By(e, t, n) {
    return e !== 0 ? Jt(e) : (t.isHorizontal() ? 1 : -1) * (t.min >= n ? 1 : -1)
}
function Ny(e) {
    let t, n, r, i, a;
    return e.horizontal ? (t = e.base > e.x,
    n = "left",
    r = "right") : (t = e.base < e.y,
    n = "bottom",
    r = "top"),
    t ? (i = "end",
    a = "start") : (i = "start",
    a = "end"),
    {
        start: n,
        end: r,
        reverse: t,
        top: i,
        bottom: a
    }
}
function zy(e, t, n, r) {
    let i = t.borderSkipped;
    const a = {};
    if (!i) {
        e.borderSkipped = a;
        return
    }
    if (i === !0) {
        e.borderSkipped = {
            top: !0,
            right: !0,
            bottom: !0,
            left: !0
        };
        return
    }
    const {start: o, end: s, reverse: l, top: c, bottom: u} = Ny(e);
    i === "middle" && n && (e.enableBorderRadius = !0,
    (n._top || 0) === r ? i = c : (n._bottom || 0) === r ? i = u : (a[Zl(u, o, s, l)] = !0,
    i = c)),
    a[Zl(i, o, s, l)] = !0,
    e.borderSkipped = a
}
function Zl(e, t, n, r) {
    return r ? (e = Fy(e, t, n),
    e = Jl(e, n, t)) : e = Jl(e, t, n),
    e
}
function Fy(e, t, n) {
    return e === t ? n : e === n ? t : e
}
function Jl(e, t, n) {
    return e === "start" ? t : e === "end" ? n : e
}
function Wy(e, {inflateAmount: t}, n) {
    e.inflateAmount = t === "auto" ? n === 1 ? .33 : 0 : t
}
class Ch extends he {
    static id = "bar";
    static defaults = {
        datasetElementType: !1,
        dataElementType: "bar",
        categoryPercentage: .8,
        barPercentage: .9,
        grouped: !0,
        animations: {
            numbers: {
                type: "number",
                properties: ["x", "y", "base", "width", "height"]
            }
        }
    };
    static overrides = {
        scales: {
            _index_: {
                type: "category",
                offset: !0,
                grid: {
                    offset: !0
                }
            },
            _value_: {
                type: "linear",
                beginAtZero: !0
            }
        }
    };
    parsePrimitiveData(t, n, r, i) {
        return ql(t, n, r, i)
    }
    parseArrayData(t, n, r, i) {
        return ql(t, n, r, i)
    }
    parseObjectData(t, n, r, i) {
        const {iScale: a, vScale: o} = t
          , {xAxisKey: s="x", yAxisKey: l="y"} = this._parsing
          , c = a.axis === "x" ? s : l
          , u = o.axis === "x" ? s : l
          , f = [];
        let h, d, p, g;
        for (h = r,
        d = r + i; h < d; ++h)
            g = n[h],
            p = {},
            p[a.axis] = a.parse(_e(g, c), h),
            f.push(jh(_e(g, u), p, o, h));
        return f
    }
    updateRangeFromParsed(t, n, r, i) {
        super.updateRangeFromParsed(t, n, r, i);
        const a = r._custom;
        a && n === this._cachedMeta.vScale && (t.min = Math.min(t.min, a.min),
        t.max = Math.max(t.max, a.max))
    }
    getMaxOverflow() {
        return 0
    }
    getLabelAndValue(t) {
        const n = this._cachedMeta
          , {iScale: r, vScale: i} = n
          , a = this.getParsed(t)
          , o = a._custom
          , s = uo(o) ? "[" + o.start + ", " + o.end + "]" : "" + i.getLabelForValue(a[i.axis]);
        return {
            label: "" + r.getLabelForValue(a[r.axis]),
            value: s
        }
    }
    initialize() {
        this.enableOptionSharing = !0,
        super.initialize();
        const t = this._cachedMeta;
        t.stack = this.getDataset().stack
    }
    update(t) {
        const n = this._cachedMeta;
        this.updateElements(n.data, 0, n.data.length, t)
    }
    updateElements(t, n, r, i) {
        const a = i === "reset"
          , {index: o, _cachedMeta: {vScale: s}} = this
          , l = s.getBasePixel()
          , c = s.isHorizontal()
          , u = this._getRuler()
          , {sharedOptions: f, includeOptions: h} = this._getSharedOptions(n, i);
        for (let d = n; d < n + r; d++) {
            const p = this.getParsed(d)
              , g = a || J(p[s.axis]) ? {
                base: l,
                head: l
            } : this._calculateBarValuePixels(d)
              , m = this._calculateBarIndexPixels(d, u)
              , v = (p._stacks || {})[s.axis]
              , b = {
                horizontal: c,
                base: g.base,
                enableBorderRadius: !v || uo(p._custom) || o === v._top || o === v._bottom,
                x: c ? g.head : m.center,
                y: c ? m.center : g.head,
                height: c ? m.size : Math.abs(g.size),
                width: c ? Math.abs(g.size) : m.size
            };
            h && (b.options = f || this.resolveDataElementOptions(d, t[d].active ? "active" : i));
            const x = b.options || t[d].options;
            zy(b, x, v, o),
            Wy(b, x, u.ratio),
            this.updateElement(t[d], d, b, i)
        }
    }
    _getStacks(t, n) {
        const {iScale: r} = this._cachedMeta
          , i = r.getMatchingVisibleMetas(this._type).filter(u => u.controller.options.grouped)
          , a = r.options.stacked
          , o = []
          , s = this._cachedMeta.controller.getParsed(n)
          , l = s && s[r.axis]
          , c = u => {
            const f = u._parsed.find(d => d[r.axis] === l)
              , h = f && f[u.vScale.axis];
            if (J(h) || isNaN(h))
                return !0
        }
        ;
        for (const u of i)
            if (!(n !== void 0 && c(u)) && ((a === !1 || o.indexOf(u.stack) === -1 || a === void 0 && u.stack === void 0) && o.push(u.stack),
            u.index === t))
                break;
        return o.length || o.push(void 0),
        o
    }
    _getStackCount(t) {
        return this._getStacks(void 0, t).length
    }
    _getStackIndex(t, n, r) {
        const i = this._getStacks(t, r)
          , a = n !== void 0 ? i.indexOf(n) : -1;
        return a === -1 ? i.length - 1 : a
    }
    _getRuler() {
        const t = this.options
          , n = this._cachedMeta
          , r = n.iScale
          , i = [];
        let a, o;
        for (a = 0,
        o = n.data.length; a < o; ++a)
            i.push(r.getPixelForValue(this.getParsed(a)[r.axis], a));
        const s = t.barThickness;
        return {
            min: s || Iy(n),
            pixels: i,
            start: r._startPixel,
            end: r._endPixel,
            stackCount: this._getStackCount(),
            scale: r,
            grouped: t.grouped,
            ratio: s ? 1 : t.categoryPercentage * t.barPercentage
        }
    }
    _calculateBarValuePixels(t) {
        const {_cachedMeta: {vScale: n, _stacked: r, index: i}, options: {base: a, minBarLength: o}} = this
          , s = a || 0
          , l = this.getParsed(t)
          , c = l._custom
          , u = uo(c);
        let f = l[n.axis], h = 0, d = r ? this.applyStack(n, l, r) : f, p, g;
        d !== f && (h = d - f,
        d = f),
        u && (f = c.barStart,
        d = c.barEnd - c.barStart,
        f !== 0 && Jt(f) !== Jt(c.barEnd) && (h = 0),
        h += f);
        const m = !J(a) && !u ? a : h;
        let v = n.getPixelForValue(m);
        if (this.chart.getDataVisibility(t) ? p = n.getPixelForValue(h + d) : p = v,
        g = p - v,
        Math.abs(g) < o) {
            g = By(g, n, s) * o,
            f === s && (v -= g / 2);
            const b = n.getPixelForDecimal(0)
              , x = n.getPixelForDecimal(1)
              , w = Math.min(b, x)
              , y = Math.max(b, x);
            v = Math.max(Math.min(v, y), w),
            p = v + g,
            r && !u && (l._stacks[n.axis]._visualValues[i] = n.getValueForPixel(p) - n.getValueForPixel(v))
        }
        if (v === n.getPixelForValue(s)) {
            const b = Jt(g) * n.getLineWidthForValue(s) / 2;
            v += b,
            g -= b
        }
        return {
            size: g,
            base: v,
            head: p,
            center: p + g / 2
        }
    }
    _calculateBarIndexPixels(t, n) {
        const r = n.scale
          , i = this.options
          , a = i.skipNull
          , o = Y(i.maxBarThickness, 1 / 0);
        let s, l;
        if (n.grouped) {
            const c = a ? this._getStackCount(t) : n.stackCount
              , u = i.barThickness === "flex" ? Ly(t, n, i, c) : $y(t, n, i, c)
              , f = this._getStackIndex(this.index, this._cachedMeta.stack, a ? t : void 0);
            s = u.start + u.chunk * f + u.chunk / 2,
            l = Math.min(o, u.chunk * u.ratio)
        } else
            s = r.getPixelForValue(this.getParsed(t)[r.axis], t),
            l = Math.min(o, n.min * n.ratio);
        return {
            base: s - l / 2,
            head: s + l / 2,
            center: s,
            size: l
        }
    }
    draw() {
        const t = this._cachedMeta
          , n = t.vScale
          , r = t.data
          , i = r.length;
        let a = 0;
        for (; a < i; ++a)
            this.getParsed(a)[n.axis] !== null && !r[a].hidden && r[a].draw(this._ctx)
    }
}
class Dh extends he {
    static id = "bubble";
    static defaults = {
        datasetElementType: !1,
        dataElementType: "point",
        animations: {
            numbers: {
                type: "number",
                properties: ["x", "y", "borderWidth", "radius"]
            }
        }
    };
    static overrides = {
        scales: {
            x: {
                type: "linear"
            },
            y: {
                type: "linear"
            }
        }
    };
    initialize() {
        this.enableOptionSharing = !0,
        super.initialize()
    }
    parsePrimitiveData(t, n, r, i) {
        const a = super.parsePrimitiveData(t, n, r, i);
        for (let o = 0; o < a.length; o++)
            a[o]._custom = this.resolveDataElementOptions(o + r).radius;
        return a
    }
    parseArrayData(t, n, r, i) {
        const a = super.parseArrayData(t, n, r, i);
        for (let o = 0; o < a.length; o++) {
            const s = n[r + o];
            a[o]._custom = Y(s[2], this.resolveDataElementOptions(o + r).radius)
        }
        return a
    }
    parseObjectData(t, n, r, i) {
        const a = super.parseObjectData(t, n, r, i);
        for (let o = 0; o < a.length; o++) {
            const s = n[r + o];
            a[o]._custom = Y(s && s.r && +s.r, this.resolveDataElementOptions(o + r).radius)
        }
        return a
    }
    getMaxOverflow() {
        const t = this._cachedMeta.data;
        let n = 0;
        for (let r = t.length - 1; r >= 0; --r)
            n = Math.max(n, t[r].size(this.resolveDataElementOptions(r)) / 2);
        return n > 0 && n
    }
    getLabelAndValue(t) {
        const n = this._cachedMeta
          , r = this.chart.data.labels || []
          , {xScale: i, yScale: a} = n
          , o = this.getParsed(t)
          , s = i.getLabelForValue(o.x)
          , l = a.getLabelForValue(o.y)
          , c = o._custom;
        return {
            label: r[t] || "",
            value: "(" + s + ", " + l + (c ? ", " + c : "") + ")"
        }
    }
    update(t) {
        const n = this._cachedMeta.data;
        this.updateElements(n, 0, n.length, t)
    }
    updateElements(t, n, r, i) {
        const a = i === "reset"
          , {iScale: o, vScale: s} = this._cachedMeta
          , {sharedOptions: l, includeOptions: c} = this._getSharedOptions(n, i)
          , u = o.axis
          , f = s.axis;
        for (let h = n; h < n + r; h++) {
            const d = t[h]
              , p = !a && this.getParsed(h)
              , g = {}
              , m = g[u] = a ? o.getPixelForDecimal(.5) : o.getPixelForValue(p[u])
              , v = g[f] = a ? s.getBasePixel() : s.getPixelForValue(p[f]);
            g.skip = isNaN(m) || isNaN(v),
            c && (g.options = l || this.resolveDataElementOptions(h, d.active ? "active" : i),
            a && (g.options.radius = 0)),
            this.updateElement(d, h, g, i)
        }
    }
    resolveDataElementOptions(t, n) {
        const r = this.getParsed(t);
        let i = super.resolveDataElementOptions(t, n);
        i.$shared && (i = Object.assign({}, i, {
            $shared: !1
        }));
        const a = i.radius;
        return n !== "active" && (i.radius = 0),
        i.radius += Y(r && r._custom, a),
        i
    }
}
function Vy(e, t, n) {
    let r = 1
      , i = 1
      , a = 0
      , o = 0;
    if (t < ot) {
        const s = e
          , l = s + t
          , c = Math.cos(s)
          , u = Math.sin(s)
          , f = Math.cos(l)
          , h = Math.sin(l)
          , d = (x, w, y) => Tr(x, s, l, !0) ? 1 : Math.max(w, w * n, y, y * n)
          , p = (x, w, y) => Tr(x, s, l, !0) ? -1 : Math.min(w, w * n, y, y * n)
          , g = d(0, c, f)
          , m = d(pt, u, h)
          , v = p(lt, c, f)
          , b = p(lt + pt, u, h);
        r = (g - v) / 2,
        i = (m - b) / 2,
        a = -(g + v) / 2,
        o = -(m + b) / 2
    }
    return {
        ratioX: r,
        ratioY: i,
        offsetX: a,
        offsetY: o
    }
}
class $a extends he {
    static id = "doughnut";
    static defaults = {
        datasetElementType: !1,
        dataElementType: "arc",
        animation: {
            animateRotate: !0,
            animateScale: !1
        },
        animations: {
            numbers: {
                type: "number",
                properties: ["circumference", "endAngle", "innerRadius", "outerRadius", "startAngle", "x", "y", "offset", "borderWidth", "spacing"]
            }
        },
        cutout: "50%",
        rotation: 0,
        circumference: 360,
        radius: "100%",
        spacing: 0,
        indexAxis: "r"
    };
    static descriptors = {
        _scriptable: t => t !== "spacing",
        _indexable: t => t !== "spacing" && !t.startsWith("borderDash") && !t.startsWith("hoverBorderDash")
    };
    static overrides = {
        aspectRatio: 1,
        plugins: {
            legend: {
                labels: {
                    generateLabels(t) {
                        const n = t.data;
                        if (n.labels.length && n.datasets.length) {
                            const {labels: {pointStyle: r, color: i}} = t.legend.options;
                            return n.labels.map( (a, o) => {
                                const l = t.getDatasetMeta(0).controller.getStyle(o);
                                return {
                                    text: a,
                                    fillStyle: l.backgroundColor,
                                    strokeStyle: l.borderColor,
                                    fontColor: i,
                                    lineWidth: l.borderWidth,
                                    pointStyle: r,
                                    hidden: !t.getDataVisibility(o),
                                    index: o
                                }
                            }
                            )
                        }
                        return []
                    }
                },
                onClick(t, n, r) {
                    r.chart.toggleDataVisibility(n.index),
                    r.chart.update()
                }
            }
        }
    };
    constructor(t, n) {
        super(t, n),
        this.enableOptionSharing = !0,
        this.innerRadius = void 0,
        this.outerRadius = void 0,
        this.offsetX = void 0,
        this.offsetY = void 0
    }
    linkScales() {}
    parse(t, n) {
        const r = this.getDataset().data
          , i = this._cachedMeta;
        if (this._parsing === !1)
            i._parsed = r;
        else {
            let a = l => +r[l];
            if (Z(r[t])) {
                const {key: l="value"} = this._parsing;
                a = c => +_e(r[c], l)
            }
            let o, s;
            for (o = t,
            s = t + n; o < s; ++o)
                i._parsed[o] = a(o)
        }
    }
    _getRotation() {
        return Xt(this.options.rotation - 90)
    }
    _getCircumference() {
        return Xt(this.options.circumference)
    }
    _getRotationExtents() {
        let t = ot
          , n = -ot;
        for (let r = 0; r < this.chart.data.datasets.length; ++r)
            if (this.chart.isDatasetVisible(r) && this.chart.getDatasetMeta(r).type === this._type) {
                const i = this.chart.getDatasetMeta(r).controller
                  , a = i._getRotation()
                  , o = i._getCircumference();
                t = Math.min(t, a),
                n = Math.max(n, a + o)
            }
        return {
            rotation: t,
            circumference: n - t
        }
    }
    update(t) {
        const n = this.chart
          , {chartArea: r} = n
          , i = this._cachedMeta
          , a = i.data
          , o = this.getMaxBorderWidth() + this.getMaxOffset(a) + this.options.spacing
          , s = Math.max((Math.min(r.width, r.height) - o) / 2, 0)
          , l = Math.min(im(this.options.cutout, s), 1)
          , c = this._getRingWeight(this.index)
          , {circumference: u, rotation: f} = this._getRotationExtents()
          , {ratioX: h, ratioY: d, offsetX: p, offsetY: g} = Vy(f, u, l)
          , m = (r.width - o) / h
          , v = (r.height - o) / d
          , b = Math.max(Math.min(m, v) / 2, 0)
          , x = ah(this.options.radius, b)
          , w = Math.max(x * l, 0)
          , y = (x - w) / this._getVisibleDatasetWeightTotal();
        this.offsetX = p * x,
        this.offsetY = g * x,
        i.total = this.calculateTotal(),
        this.outerRadius = x - y * this._getRingWeightOffset(this.index),
        this.innerRadius = Math.max(this.outerRadius - y * c, 0),
        this.updateElements(a, 0, a.length, t)
    }
    _circumference(t, n) {
        const r = this.options
          , i = this._cachedMeta
          , a = this._getCircumference();
        return n && r.animation.animateRotate || !this.chart.getDataVisibility(t) || i._parsed[t] === null || i.data[t].hidden ? 0 : this.calculateCircumference(i._parsed[t] * a / ot)
    }
    updateElements(t, n, r, i) {
        const a = i === "reset"
          , o = this.chart
          , s = o.chartArea
          , c = o.options.animation
          , u = (s.left + s.right) / 2
          , f = (s.top + s.bottom) / 2
          , h = a && c.animateScale
          , d = h ? 0 : this.innerRadius
          , p = h ? 0 : this.outerRadius
          , {sharedOptions: g, includeOptions: m} = this._getSharedOptions(n, i);
        let v = this._getRotation(), b;
        for (b = 0; b < n; ++b)
            v += this._circumference(b, a);
        for (b = n; b < n + r; ++b) {
            const x = this._circumference(b, a)
              , w = t[b]
              , y = {
                x: u + this.offsetX,
                y: f + this.offsetY,
                startAngle: v,
                endAngle: v + x,
                circumference: x,
                outerRadius: p,
                innerRadius: d
            };
            m && (y.options = g || this.resolveDataElementOptions(b, w.active ? "active" : i)),
            v += x,
            this.updateElement(w, b, y, i)
        }
    }
    calculateTotal() {
        const t = this._cachedMeta
          , n = t.data;
        let r = 0, i;
        for (i = 0; i < n.length; i++) {
            const a = t._parsed[i];
            a !== null && !isNaN(a) && this.chart.getDataVisibility(i) && !n[i].hidden && (r += Math.abs(a))
        }
        return r
    }
    calculateCircumference(t) {
        const n = this._cachedMeta.total;
        return n > 0 && !isNaN(t) ? ot * (Math.abs(t) / n) : 0
    }
    getLabelAndValue(t) {
        const n = this._cachedMeta
          , r = this.chart
          , i = r.data.labels || []
          , a = si(n._parsed[t], r.options.locale);
        return {
            label: i[t] || "",
            value: a
        }
    }
    getMaxBorderWidth(t) {
        let n = 0;
        const r = this.chart;
        let i, a, o, s, l;
        if (!t) {
            for (i = 0,
            a = r.data.datasets.length; i < a; ++i)
                if (r.isDatasetVisible(i)) {
                    o = r.getDatasetMeta(i),
                    t = o.data,
                    s = o.controller;
                    break
                }
        }
        if (!t)
            return 0;
        for (i = 0,
        a = t.length; i < a; ++i)
            l = s.resolveDataElementOptions(i),
            l.borderAlign !== "inner" && (n = Math.max(n, l.borderWidth || 0, l.hoverBorderWidth || 0));
        return n
    }
    getMaxOffset(t) {
        let n = 0;
        for (let r = 0, i = t.length; r < i; ++r) {
            const a = this.resolveDataElementOptions(r);
            n = Math.max(n, a.offset || 0, a.hoverOffset || 0)
        }
        return n
    }
    _getRingWeightOffset(t) {
        let n = 0;
        for (let r = 0; r < t; ++r)
            this.chart.isDatasetVisible(r) && (n += this._getRingWeight(r));
        return n
    }
    _getRingWeight(t) {
        return Math.max(Y(this.chart.data.datasets[t].weight, 1), 0)
    }
    _getVisibleDatasetWeightTotal() {
        return this._getRingWeightOffset(this.chart.data.datasets.length) || 1
    }
}
class Ih extends he {
    static id = "line";
    static defaults = {
        datasetElementType: "line",
        dataElementType: "point",
        showLine: !0,
        spanGaps: !1
    };
    static overrides = {
        scales: {
            _index_: {
                type: "category"
            },
            _value_: {
                type: "linear"
            }
        }
    };
    initialize() {
        this.enableOptionSharing = !0,
        this.supportsDecimation = !0,
        super.initialize()
    }
    update(t) {
        const n = this._cachedMeta
          , {dataset: r, data: i=[], _dataset: a} = n
          , o = this.chart._animationsDisabled;
        let {start: s, count: l} = dh(n, i, o);
        this._drawStart = s,
        this._drawCount = l,
        ph(n) && (s = 0,
        l = i.length),
        r._chart = this.chart,
        r._datasetIndex = this.index,
        r._decimated = !!a._decimated,
        r.points = i;
        const c = this.resolveDatasetElementOptions(t);
        this.options.showLine || (c.borderWidth = 0),
        c.segment = this.options.segment,
        this.updateElement(r, void 0, {
            animated: !o,
            options: c
        }, t),
        this.updateElements(i, s, l, t)
    }
    updateElements(t, n, r, i) {
        const a = i === "reset"
          , {iScale: o, vScale: s, _stacked: l, _dataset: c} = this._cachedMeta
          , {sharedOptions: u, includeOptions: f} = this._getSharedOptions(n, i)
          , h = o.axis
          , d = s.axis
          , {spanGaps: p, segment: g} = this.options
          , m = xn(p) ? p : Number.POSITIVE_INFINITY
          , v = this.chart._animationsDisabled || a || i === "none"
          , b = n + r
          , x = t.length;
        let w = n > 0 && this.getParsed(n - 1);
        for (let y = 0; y < x; ++y) {
            const O = t[y]
              , _ = v ? O : {};
            if (y < n || y >= b) {
                _.skip = !0;
                continue
            }
            const P = this.getParsed(y)
              , S = J(P[d])
              , k = _[h] = o.getPixelForValue(P[h], y)
              , E = _[d] = a || S ? s.getBasePixel() : s.getPixelForValue(l ? this.applyStack(s, P, l) : P[d], y);
            _.skip = isNaN(k) || isNaN(E) || S,
            _.stop = y > 0 && Math.abs(P[h] - w[h]) > m,
            g && (_.parsed = P,
            _.raw = c.data[y]),
            f && (_.options = u || this.resolveDataElementOptions(y, O.active ? "active" : i)),
            v || this.updateElement(O, y, _, i),
            w = P
        }
    }
    getMaxOverflow() {
        const t = this._cachedMeta
          , n = t.dataset
          , r = n.options && n.options.borderWidth || 0
          , i = t.data || [];
        if (!i.length)
            return r;
        const a = i[0].size(this.resolveDataElementOptions(0))
          , o = i[i.length - 1].size(this.resolveDataElementOptions(i.length - 1));
        return Math.max(r, a, o) / 2
    }
    draw() {
        const t = this._cachedMeta;
        t.dataset.updateControlPoints(this.chart.chartArea, t.iScale.axis),
        super.draw()
    }
}
class tl extends he {
    static id = "polarArea";
    static defaults = {
        dataElementType: "arc",
        animation: {
            animateRotate: !0,
            animateScale: !0
        },
        animations: {
            numbers: {
                type: "number",
                properties: ["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius"]
            }
        },
        indexAxis: "r",
        startAngle: 0
    };
    static overrides = {
        aspectRatio: 1,
        plugins: {
            legend: {
                labels: {
                    generateLabels(t) {
                        const n = t.data;
                        if (n.labels.length && n.datasets.length) {
                            const {labels: {pointStyle: r, color: i}} = t.legend.options;
                            return n.labels.map( (a, o) => {
                                const l = t.getDatasetMeta(0).controller.getStyle(o);
                                return {
                                    text: a,
                                    fillStyle: l.backgroundColor,
                                    strokeStyle: l.borderColor,
                                    fontColor: i,
                                    lineWidth: l.borderWidth,
                                    pointStyle: r,
                                    hidden: !t.getDataVisibility(o),
                                    index: o
                                }
                            }
                            )
                        }
                        return []
                    }
                },
                onClick(t, n, r) {
                    r.chart.toggleDataVisibility(n.index),
                    r.chart.update()
                }
            }
        },
        scales: {
            r: {
                type: "radialLinear",
                angleLines: {
                    display: !1
                },
                beginAtZero: !0,
                grid: {
                    circular: !0
                },
                pointLabels: {
                    display: !1
                },
                startAngle: 0
            }
        }
    };
    constructor(t, n) {
        super(t, n),
        this.innerRadius = void 0,
        this.outerRadius = void 0
    }
    getLabelAndValue(t) {
        const n = this._cachedMeta
          , r = this.chart
          , i = r.data.labels || []
          , a = si(n._parsed[t].r, r.options.locale);
        return {
            label: i[t] || "",
            value: a
        }
    }
    parseObjectData(t, n, r, i) {
        return wh.bind(this)(t, n, r, i)
    }
    update(t) {
        const n = this._cachedMeta.data;
        this._updateRadius(),
        this.updateElements(n, 0, n.length, t)
    }
    getMinMax() {
        const t = this._cachedMeta
          , n = {
            min: Number.POSITIVE_INFINITY,
            max: Number.NEGATIVE_INFINITY
        };
        return t.data.forEach( (r, i) => {
            const a = this.getParsed(i).r;
            !isNaN(a) && this.chart.getDataVisibility(i) && (a < n.min && (n.min = a),
            a > n.max && (n.max = a))
        }
        ),
        n
    }
    _updateRadius() {
        const t = this.chart
          , n = t.chartArea
          , r = t.options
          , i = Math.min(n.right - n.left, n.bottom - n.top)
          , a = Math.max(i / 2, 0)
          , o = Math.max(r.cutoutPercentage ? a / 100 * r.cutoutPercentage : 1, 0)
          , s = (a - o) / t.getVisibleDatasetCount();
        this.outerRadius = a - s * this.index,
        this.innerRadius = this.outerRadius - s
    }
    updateElements(t, n, r, i) {
        const a = i === "reset"
          , o = this.chart
          , l = o.options.animation
          , c = this._cachedMeta.rScale
          , u = c.xCenter
          , f = c.yCenter
          , h = c.getIndexAngle(0) - .5 * lt;
        let d = h, p;
        const g = 360 / this.countVisibleElements();
        for (p = 0; p < n; ++p)
            d += this._computeAngle(p, i, g);
        for (p = n; p < n + r; p++) {
            const m = t[p];
            let v = d
              , b = d + this._computeAngle(p, i, g)
              , x = o.getDataVisibility(p) ? c.getDistanceFromCenterForValue(this.getParsed(p).r) : 0;
            d = b,
            a && (l.animateScale && (x = 0),
            l.animateRotate && (v = b = h));
            const w = {
                x: u,
                y: f,
                innerRadius: 0,
                outerRadius: x,
                startAngle: v,
                endAngle: b,
                options: this.resolveDataElementOptions(p, m.active ? "active" : i)
            };
            this.updateElement(m, p, w, i)
        }
    }
    countVisibleElements() {
        const t = this._cachedMeta;
        let n = 0;
        return t.data.forEach( (r, i) => {
            !isNaN(this.getParsed(i).r) && this.chart.getDataVisibility(i) && n++
        }
        ),
        n
    }
    _computeAngle(t, n, r) {
        return this.chart.getDataVisibility(t) ? Xt(this.resolveDataElementOptions(t, n).angle || r) : 0
    }
}
class $h extends $a {
    static id = "pie";
    static defaults = {
        cutout: 0,
        rotation: 0,
        circumference: 360,
        radius: "100%"
    }
}
class Lh extends he {
    static id = "radar";
    static defaults = {
        datasetElementType: "line",
        dataElementType: "point",
        indexAxis: "r",
        showLine: !0,
        elements: {
            line: {
                fill: "start"
            }
        }
    };
    static overrides = {
        aspectRatio: 1,
        scales: {
            r: {
                type: "radialLinear"
            }
        }
    };
    getLabelAndValue(t) {
        const n = this._cachedMeta.vScale
          , r = this.getParsed(t);
        return {
            label: n.getLabels()[t],
            value: "" + n.getLabelForValue(r[n.axis])
        }
    }
    parseObjectData(t, n, r, i) {
        return wh.bind(this)(t, n, r, i)
    }
    update(t) {
        const n = this._cachedMeta
          , r = n.dataset
          , i = n.data || []
          , a = n.iScale.getLabels();
        if (r.points = i,
        t !== "resize") {
            const o = this.resolveDatasetElementOptions(t);
            this.options.showLine || (o.borderWidth = 0);
            const s = {
                _loop: !0,
                _fullLoop: a.length === i.length,
                options: o
            };
            this.updateElement(r, void 0, s, t)
        }
        this.updateElements(i, 0, i.length, t)
    }
    updateElements(t, n, r, i) {
        const a = this._cachedMeta.rScale
          , o = i === "reset";
        for (let s = n; s < n + r; s++) {
            const l = t[s]
              , c = this.resolveDataElementOptions(s, l.active ? "active" : i)
              , u = a.getPointPositionForValue(s, this.getParsed(s).r)
              , f = o ? a.xCenter : u.x
              , h = o ? a.yCenter : u.y
              , d = {
                x: f,
                y: h,
                angle: u.angle,
                skip: isNaN(f) || isNaN(h),
                options: c
            };
            this.updateElement(l, s, d, i)
        }
    }
}
class Rh extends he {
    static id = "scatter";
    static defaults = {
        datasetElementType: !1,
        dataElementType: "point",
        showLine: !1,
        fill: !1
    };
    static overrides = {
        interaction: {
            mode: "point"
        },
        scales: {
            x: {
                type: "linear"
            },
            y: {
                type: "linear"
            }
        }
    };
    getLabelAndValue(t) {
        const n = this._cachedMeta
          , r = this.chart.data.labels || []
          , {xScale: i, yScale: a} = n
          , o = this.getParsed(t)
          , s = i.getLabelForValue(o.x)
          , l = a.getLabelForValue(o.y);
        return {
            label: r[t] || "",
            value: "(" + s + ", " + l + ")"
        }
    }
    update(t) {
        const n = this._cachedMeta
          , {data: r=[]} = n
          , i = this.chart._animationsDisabled;
        let {start: a, count: o} = dh(n, r, i);
        if (this._drawStart = a,
        this._drawCount = o,
        ph(n) && (a = 0,
        o = r.length),
        this.options.showLine) {
            this.datasetElementType || this.addElements();
            const {dataset: s, _dataset: l} = n;
            s._chart = this.chart,
            s._datasetIndex = this.index,
            s._decimated = !!l._decimated,
            s.points = r;
            const c = this.resolveDatasetElementOptions(t);
            c.segment = this.options.segment,
            this.updateElement(s, void 0, {
                animated: !i,
                options: c
            }, t)
        } else
            this.datasetElementType && (delete n.dataset,
            this.datasetElementType = !1);
        this.updateElements(r, a, o, t)
    }
    addElements() {
        const {showLine: t} = this.options;
        !this.datasetElementType && t && (this.datasetElementType = this.chart.registry.getElement("line")),
        super.addElements()
    }
    updateElements(t, n, r, i) {
        const a = i === "reset"
          , {iScale: o, vScale: s, _stacked: l, _dataset: c} = this._cachedMeta
          , u = this.resolveDataElementOptions(n, i)
          , f = this.getSharedOptions(u)
          , h = this.includeOptions(i, f)
          , d = o.axis
          , p = s.axis
          , {spanGaps: g, segment: m} = this.options
          , v = xn(g) ? g : Number.POSITIVE_INFINITY
          , b = this.chart._animationsDisabled || a || i === "none";
        let x = n > 0 && this.getParsed(n - 1);
        for (let w = n; w < n + r; ++w) {
            const y = t[w]
              , O = this.getParsed(w)
              , _ = b ? y : {}
              , P = J(O[p])
              , S = _[d] = o.getPixelForValue(O[d], w)
              , k = _[p] = a || P ? s.getBasePixel() : s.getPixelForValue(l ? this.applyStack(s, O, l) : O[p], w);
            _.skip = isNaN(S) || isNaN(k) || P,
            _.stop = w > 0 && Math.abs(O[d] - x[d]) > v,
            m && (_.parsed = O,
            _.raw = c.data[w]),
            h && (_.options = f || this.resolveDataElementOptions(w, y.active ? "active" : i)),
            b || this.updateElement(y, w, _, i),
            x = O
        }
        this.updateSharedOptions(f, i, u)
    }
    getMaxOverflow() {
        const t = this._cachedMeta
          , n = t.data || [];
        if (!this.options.showLine) {
            let s = 0;
            for (let l = n.length - 1; l >= 0; --l)
                s = Math.max(s, n[l].size(this.resolveDataElementOptions(l)) / 2);
            return s > 0 && s
        }
        const r = t.dataset
          , i = r.options && r.options.borderWidth || 0;
        if (!n.length)
            return i;
        const a = n[0].size(this.resolveDataElementOptions(0))
          , o = n[n.length - 1].size(this.resolveDataElementOptions(n.length - 1));
        return Math.max(i, a, o) / 2
    }
}
var Bh = Object.freeze({
    __proto__: null,
    BarController: Ch,
    BubbleController: Dh,
    DoughnutController: $a,
    LineController: Ih,
    PieController: $h,
    PolarAreaController: tl,
    RadarController: Lh,
    ScatterController: Rh
});
function Le() {
    throw new Error("This method is not implemented: Check that a complete date adapter is provided.")
}
class el {
    static override(t) {
        Object.assign(el.prototype, t)
    }
    options;
    constructor(t) {
        this.options = t || {}
    }
    init() {}
    formats() {
        return Le()
    }
    parse() {
        return Le()
    }
    format() {
        return Le()
    }
    add() {
        return Le()
    }
    diff() {
        return Le()
    }
    startOf() {
        return Le()
    }
    endOf() {
        return Le()
    }
}
var Nh = {
    _date: el
};
function Hy(e, t, n, r) {
    const {controller: i, data: a, _sorted: o} = e
      , s = i._cachedMeta.iScale;
    if (s && t === s.axis && t !== "r" && o && a.length) {
        const l = s._reversePixels ? mm : se;
        if (r) {
            if (i._sharedOptions) {
                const c = a[0]
                  , u = typeof c.getRange == "function" && c.getRange(t);
                if (u) {
                    const f = l(a, t, n - u)
                      , h = l(a, t, n + u);
                    return {
                        lo: f.lo,
                        hi: h.hi
                    }
                }
            }
        } else
            return l(a, t, n)
    }
    return {
        lo: 0,
        hi: a.length - 1
    }
}
function ci(e, t, n, r, i) {
    const a = e.getSortedVisibleDatasetMetas()
      , o = n[t];
    for (let s = 0, l = a.length; s < l; ++s) {
        const {index: c, data: u} = a[s]
          , {lo: f, hi: h} = Hy(a[s], t, o, i);
        for (let d = f; d <= h; ++d) {
            const p = u[d];
            p.skip || r(p, c, d)
        }
    }
}
function Ky(e) {
    const t = e.indexOf("x") !== -1
      , n = e.indexOf("y") !== -1;
    return function(r, i) {
        const a = t ? Math.abs(r.x - i.x) : 0
          , o = n ? Math.abs(r.y - i.y) : 0;
        return Math.sqrt(Math.pow(a, 2) + Math.pow(o, 2))
    }
}
function fo(e, t, n, r, i) {
    const a = [];
    return !i && !e.isPointInArea(t) || ci(e, n, t, function(s, l, c) {
        !i && !le(s, e.chartArea, 0) || s.inRange(t.x, t.y, r) && a.push({
            element: s,
            datasetIndex: l,
            index: c
        })
    }, !0),
    a
}
function Xy(e, t, n, r) {
    let i = [];
    function a(o, s, l) {
        const {startAngle: c, endAngle: u} = o.getProps(["startAngle", "endAngle"], r)
          , {angle: f} = lh(o, {
            x: t.x,
            y: t.y
        });
        Tr(f, c, u) && i.push({
            element: o,
            datasetIndex: s,
            index: l
        })
    }
    return ci(e, n, t, a),
    i
}
function Gy(e, t, n, r, i, a) {
    let o = [];
    const s = Ky(n);
    let l = Number.POSITIVE_INFINITY;
    function c(u, f, h) {
        const d = u.inRange(t.x, t.y, i);
        if (r && !d)
            return;
        const p = u.getCenterPoint(i);
        if (!(!!a || e.isPointInArea(p)) && !d)
            return;
        const m = s(t, p);
        m < l ? (o = [{
            element: u,
            datasetIndex: f,
            index: h
        }],
        l = m) : m === l && o.push({
            element: u,
            datasetIndex: f,
            index: h
        })
    }
    return ci(e, n, t, c),
    o
}
function ho(e, t, n, r, i, a) {
    return !a && !e.isPointInArea(t) ? [] : n === "r" && !r ? Xy(e, t, n, i) : Gy(e, t, n, r, i, a)
}
function Ql(e, t, n, r, i) {
    const a = []
      , o = n === "x" ? "inXRange" : "inYRange";
    let s = !1;
    return ci(e, n, t, (l, c, u) => {
        l[o] && l[o](t[n], i) && (a.push({
            element: l,
            datasetIndex: c,
            index: u
        }),
        s = s || l.inRange(t.x, t.y, i))
    }
    ),
    r && !s ? [] : a
}
var zh = {
    evaluateInteractionItems: ci,
    modes: {
        index(e, t, n, r) {
            const i = Fe(t, e)
              , a = n.axis || "x"
              , o = n.includeInvisible || !1
              , s = n.intersect ? fo(e, i, a, r, o) : ho(e, i, a, !1, r, o)
              , l = [];
            return s.length ? (e.getSortedVisibleDatasetMetas().forEach(c => {
                const u = s[0].index
                  , f = c.data[u];
                f && !f.skip && l.push({
                    element: f,
                    datasetIndex: c.index,
                    index: u
                })
            }
            ),
            l) : []
        },
        dataset(e, t, n, r) {
            const i = Fe(t, e)
              , a = n.axis || "xy"
              , o = n.includeInvisible || !1;
            let s = n.intersect ? fo(e, i, a, r, o) : ho(e, i, a, !1, r, o);
            if (s.length > 0) {
                const l = s[0].datasetIndex
                  , c = e.getDatasetMeta(l).data;
                s = [];
                for (let u = 0; u < c.length; ++u)
                    s.push({
                        element: c[u],
                        datasetIndex: l,
                        index: u
                    })
            }
            return s
        },
        point(e, t, n, r) {
            const i = Fe(t, e)
              , a = n.axis || "xy"
              , o = n.includeInvisible || !1;
            return fo(e, i, a, r, o)
        },
        nearest(e, t, n, r) {
            const i = Fe(t, e)
              , a = n.axis || "xy"
              , o = n.includeInvisible || !1;
            return ho(e, i, a, n.intersect, r, o)
        },
        x(e, t, n, r) {
            const i = Fe(t, e);
            return Ql(e, i, "x", n.intersect, r)
        },
        y(e, t, n, r) {
            const i = Fe(t, e);
            return Ql(e, i, "y", n.intersect, r)
        }
    }
};
const Fh = ["left", "top", "right", "bottom"];
function or(e, t) {
    return e.filter(n => n.pos === t)
}
function tc(e, t) {
    return e.filter(n => Fh.indexOf(n.pos) === -1 && n.box.axis === t)
}
function sr(e, t) {
    return e.sort( (n, r) => {
        const i = t ? r : n
          , a = t ? n : r;
        return i.weight === a.weight ? i.index - a.index : i.weight - a.weight
    }
    )
}
function Uy(e) {
    const t = [];
    let n, r, i, a, o, s;
    for (n = 0,
    r = (e || []).length; n < r; ++n)
        i = e[n],
        {position: a, options: {stack: o, stackWeight: s=1}} = i,
        t.push({
            index: n,
            box: i,
            pos: a,
            horizontal: i.isHorizontal(),
            weight: i.weight,
            stack: o && a + o,
            stackWeight: s
        });
    return t
}
function Yy(e) {
    const t = {};
    for (const n of e) {
        const {stack: r, pos: i, stackWeight: a} = n;
        if (!r || !Fh.includes(i))
            continue;
        const o = t[r] || (t[r] = {
            count: 0,
            placed: 0,
            weight: 0,
            size: 0
        });
        o.count++,
        o.weight += a
    }
    return t
}
function qy(e, t) {
    const n = Yy(e)
      , {vBoxMaxWidth: r, hBoxMaxHeight: i} = t;
    let a, o, s;
    for (a = 0,
    o = e.length; a < o; ++a) {
        s = e[a];
        const {fullSize: l} = s.box
          , c = n[s.stack]
          , u = c && s.stackWeight / c.weight;
        s.horizontal ? (s.width = u ? u * r : l && t.availableWidth,
        s.height = i) : (s.width = r,
        s.height = u ? u * i : l && t.availableHeight)
    }
    return n
}
function Zy(e) {
    const t = Uy(e)
      , n = sr(t.filter(c => c.box.fullSize), !0)
      , r = sr(or(t, "left"), !0)
      , i = sr(or(t, "right"))
      , a = sr(or(t, "top"), !0)
      , o = sr(or(t, "bottom"))
      , s = tc(t, "x")
      , l = tc(t, "y");
    return {
        fullSize: n,
        leftAndTop: r.concat(a),
        rightAndBottom: i.concat(l).concat(o).concat(s),
        chartArea: or(t, "chartArea"),
        vertical: r.concat(i).concat(l),
        horizontal: a.concat(o).concat(s)
    }
}
function ec(e, t, n, r) {
    return Math.max(e[n], t[n]) + Math.max(e[r], t[r])
}
function Wh(e, t) {
    e.top = Math.max(e.top, t.top),
    e.left = Math.max(e.left, t.left),
    e.bottom = Math.max(e.bottom, t.bottom),
    e.right = Math.max(e.right, t.right)
}
function Jy(e, t, n, r) {
    const {pos: i, box: a} = n
      , o = e.maxPadding;
    if (!Z(i)) {
        n.size && (e[i] -= n.size);
        const f = r[n.stack] || {
            size: 0,
            count: 1
        };
        f.size = Math.max(f.size, n.horizontal ? a.height : a.width),
        n.size = f.size / f.count,
        e[i] += n.size
    }
    a.getPadding && Wh(o, a.getPadding());
    const s = Math.max(0, t.outerWidth - ec(o, e, "left", "right"))
      , l = Math.max(0, t.outerHeight - ec(o, e, "top", "bottom"))
      , c = s !== e.w
      , u = l !== e.h;
    return e.w = s,
    e.h = l,
    n.horizontal ? {
        same: c,
        other: u
    } : {
        same: u,
        other: c
    }
}
function Qy(e) {
    const t = e.maxPadding;
    function n(r) {
        const i = Math.max(t[r] - e[r], 0);
        return e[r] += i,
        i
    }
    e.y += n("top"),
    e.x += n("left"),
    n("right"),
    n("bottom")
}
function tv(e, t) {
    const n = t.maxPadding;
    function r(i) {
        const a = {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        };
        return i.forEach(o => {
            a[o] = Math.max(t[o], n[o])
        }
        ),
        a
    }
    return r(e ? ["left", "right"] : ["top", "bottom"])
}
function gr(e, t, n, r) {
    const i = [];
    let a, o, s, l, c, u;
    for (a = 0,
    o = e.length,
    c = 0; a < o; ++a) {
        s = e[a],
        l = s.box,
        l.update(s.width || t.w, s.height || t.h, tv(s.horizontal, t));
        const {same: f, other: h} = Jy(t, n, s, r);
        c |= f && i.length,
        u = u || h,
        l.fullSize || i.push(s)
    }
    return c && gr(i, t, n, r) || u
}
function bi(e, t, n, r, i) {
    e.top = n,
    e.left = t,
    e.right = t + r,
    e.bottom = n + i,
    e.width = r,
    e.height = i
}
function nc(e, t, n, r) {
    const i = n.padding;
    let {x: a, y: o} = t;
    for (const s of e) {
        const l = s.box
          , c = r[s.stack] || {
            placed: 0,
            weight: 1
        }
          , u = s.stackWeight / c.weight || 1;
        if (s.horizontal) {
            const f = t.w * u
              , h = c.size || l.height;
            Mr(c.start) && (o = c.start),
            l.fullSize ? bi(l, i.left, o, n.outerWidth - i.right - i.left, h) : bi(l, t.left + c.placed, o, f, h),
            c.start = o,
            c.placed += f,
            o = l.bottom
        } else {
            const f = t.h * u
              , h = c.size || l.width;
            Mr(c.start) && (a = c.start),
            l.fullSize ? bi(l, a, i.top, h, n.outerHeight - i.bottom - i.top) : bi(l, a, t.top + c.placed, h, f),
            c.start = a,
            c.placed += f,
            a = l.right
        }
    }
    t.x = a,
    t.y = o
}
var wt = {
    addBox(e, t) {
        e.boxes || (e.boxes = []),
        t.fullSize = t.fullSize || !1,
        t.position = t.position || "top",
        t.weight = t.weight || 0,
        t._layers = t._layers || function() {
            return [{
                z: 0,
                draw(n) {
                    t.draw(n)
                }
            }]
        }
        ,
        e.boxes.push(t)
    },
    removeBox(e, t) {
        const n = e.boxes ? e.boxes.indexOf(t) : -1;
        n !== -1 && e.boxes.splice(n, 1)
    },
    configure(e, t, n) {
        t.fullSize = n.fullSize,
        t.position = n.position,
        t.weight = n.weight
    },
    update(e, t, n, r) {
        if (!e)
            return;
        const i = St(e.options.layout.padding)
          , a = Math.max(t - i.width, 0)
          , o = Math.max(n - i.height, 0)
          , s = Zy(e.boxes)
          , l = s.vertical
          , c = s.horizontal;
        tt(e.boxes, g => {
            typeof g.beforeLayout == "function" && g.beforeLayout()
        }
        );
        const u = l.reduce( (g, m) => m.box.options && m.box.options.display === !1 ? g : g + 1, 0) || 1
          , f = Object.freeze({
            outerWidth: t,
            outerHeight: n,
            padding: i,
            availableWidth: a,
            availableHeight: o,
            vBoxMaxWidth: a / 2 / u,
            hBoxMaxHeight: o / 2
        })
          , h = Object.assign({}, i);
        Wh(h, St(r));
        const d = Object.assign({
            maxPadding: h,
            w: a,
            h: o,
            x: i.left,
            y: i.top
        }, i)
          , p = qy(l.concat(c), f);
        gr(s.fullSize, d, f, p),
        gr(l, d, f, p),
        gr(c, d, f, p) && gr(l, d, f, p),
        Qy(d),
        nc(s.leftAndTop, d, f, p),
        d.x += d.w,
        d.y += d.h,
        nc(s.rightAndBottom, d, f, p),
        e.chartArea = {
            left: d.left,
            top: d.top,
            right: d.left + d.w,
            bottom: d.top + d.h,
            height: d.h,
            width: d.w
        },
        tt(s.chartArea, g => {
            const m = g.box;
            Object.assign(m, e.chartArea),
            m.update(d.w, d.h, {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            })
        }
        )
    }
};
class nl {
    acquireContext(t, n) {}
    releaseContext(t) {
        return !1
    }
    addEventListener(t, n, r) {}
    removeEventListener(t, n, r) {}
    getDevicePixelRatio() {
        return 1
    }
    getMaximumSize(t, n, r, i) {
        return n = Math.max(0, n || t.width),
        r = r || t.height,
        {
            width: n,
            height: Math.max(0, i ? Math.floor(n / i) : r)
        }
    }
    isAttached(t) {
        return !0
    }
    updateConfig(t) {}
}
class Vh extends nl {
    acquireContext(t) {
        return t && t.getContext && t.getContext("2d") || null
    }
    updateConfig(t) {
        t.options.animation = !1
    }
}
const Li = "$chartjs"
  , ev = {
    touchstart: "mousedown",
    touchmove: "mousemove",
    touchend: "mouseup",
    pointerenter: "mouseenter",
    pointerdown: "mousedown",
    pointermove: "mousemove",
    pointerup: "mouseup",
    pointerleave: "mouseout",
    pointerout: "mouseout"
}
  , rc = e => e === null || e === "";
function nv(e, t) {
    const n = e.style
      , r = e.getAttribute("height")
      , i = e.getAttribute("width");
    if (e[Li] = {
        initial: {
            height: r,
            width: i,
            style: {
                display: n.display,
                height: n.height,
                width: n.width
            }
        }
    },
    n.display = n.display || "block",
    n.boxSizing = n.boxSizing || "border-box",
    rc(i)) {
        const a = zl(e, "width");
        a !== void 0 && (e.width = a)
    }
    if (rc(r))
        if (e.style.height === "")
            e.height = e.width / (t || 2);
        else {
            const a = zl(e, "height");
            a !== void 0 && (e.height = a)
        }
    return e
}
const Hh = cy ? {
    passive: !0
} : !1;
function rv(e, t, n) {
    e && e.addEventListener(t, n, Hh)
}
function iv(e, t, n) {
    e && e.canvas && e.canvas.removeEventListener(t, n, Hh)
}
function av(e, t) {
    const n = ev[e.type] || e.type
      , {x: r, y: i} = Fe(e, t);
    return {
        type: n,
        chart: t,
        native: e,
        x: r !== void 0 ? r : null,
        y: i !== void 0 ? i : null
    }
}
function Ki(e, t) {
    for (const n of e)
        if (n === t || n.contains(t))
            return !0
}
function ov(e, t, n) {
    const r = e.canvas
      , i = new MutationObserver(a => {
        let o = !1;
        for (const s of a)
            o = o || Ki(s.addedNodes, r),
            o = o && !Ki(s.removedNodes, r);
        o && n()
    }
    );
    return i.observe(document, {
        childList: !0,
        subtree: !0
    }),
    i
}
function sv(e, t, n) {
    const r = e.canvas
      , i = new MutationObserver(a => {
        let o = !1;
        for (const s of a)
            o = o || Ki(s.removedNodes, r),
            o = o && !Ki(s.addedNodes, r);
        o && n()
    }
    );
    return i.observe(document, {
        childList: !0,
        subtree: !0
    }),
    i
}
const Cr = new Map;
let ic = 0;
function Kh() {
    const e = window.devicePixelRatio;
    e !== ic && (ic = e,
    Cr.forEach( (t, n) => {
        n.currentDevicePixelRatio !== e && t()
    }
    ))
}
function lv(e, t) {
    Cr.size || window.addEventListener("resize", Kh),
    Cr.set(e, t)
}
function cv(e) {
    Cr.delete(e),
    Cr.size || window.removeEventListener("resize", Kh)
}
function uv(e, t, n) {
    const r = e.canvas
      , i = r && Js(r);
    if (!i)
        return;
    const a = hh( (s, l) => {
        const c = i.clientWidth;
        n(s, l),
        c < i.clientWidth && n()
    }
    , window)
      , o = new ResizeObserver(s => {
        const l = s[0]
          , c = l.contentRect.width
          , u = l.contentRect.height;
        c === 0 && u === 0 || a(c, u)
    }
    );
    return o.observe(i),
    lv(e, a),
    o
}
function po(e, t, n) {
    n && n.disconnect(),
    t === "resize" && cv(e)
}
function fv(e, t, n) {
    const r = e.canvas
      , i = hh(a => {
        e.ctx !== null && n(av(a, e))
    }
    , e);
    return rv(r, t, i),
    i
}
class Xh extends nl {
    acquireContext(t, n) {
        const r = t && t.getContext && t.getContext("2d");
        return r && r.canvas === t ? (nv(t, n),
        r) : null
    }
    releaseContext(t) {
        const n = t.canvas;
        if (!n[Li])
            return !1;
        const r = n[Li].initial;
        ["height", "width"].forEach(a => {
            const o = r[a];
            J(o) ? n.removeAttribute(a) : n.setAttribute(a, o)
        }
        );
        const i = r.style || {};
        return Object.keys(i).forEach(a => {
            n.style[a] = i[a]
        }
        ),
        n.width = n.width,
        delete n[Li],
        !0
    }
    addEventListener(t, n, r) {
        this.removeEventListener(t, n);
        const i = t.$proxies || (t.$proxies = {})
          , o = {
            attach: ov,
            detach: sv,
            resize: uv
        }[n] || fv;
        i[n] = o(t, n, r)
    }
    removeEventListener(t, n) {
        const r = t.$proxies || (t.$proxies = {})
          , i = r[n];
        if (!i)
            return;
        ({
            attach: po,
            detach: po,
            resize: po
        }[n] || iv)(t, n, i),
        r[n] = void 0
    }
    getDevicePixelRatio() {
        return window.devicePixelRatio
    }
    getMaximumSize(t, n, r, i) {
        return ly(t, n, r, i)
    }
    isAttached(t) {
        const n = t && Js(t);
        return !!(n && n.isConnected)
    }
}
function Gh(e) {
    return !Zs() || typeof OffscreenCanvas < "u" && e instanceof OffscreenCanvas ? Vh : Xh
}
class te {
    static defaults = {};
    static defaultRoutes = void 0;
    x;
    y;
    active = !1;
    options;
    $animations;
    tooltipPosition(t) {
        const {x: n, y: r} = this.getProps(["x", "y"], t);
        return {
            x: n,
            y: r
        }
    }
    hasValue() {
        return xn(this.x) && xn(this.y)
    }
    getProps(t, n) {
        const r = this.$animations;
        if (!n || !r)
            return this;
        const i = {};
        return t.forEach(a => {
            i[a] = r[a] && r[a].active() ? r[a]._to : this[a]
        }
        ),
        i
    }
}
function hv(e, t) {
    const n = e.options.ticks
      , r = dv(e)
      , i = Math.min(n.maxTicksLimit || r, r)
      , a = n.major.enabled ? gv(t) : []
      , o = a.length
      , s = a[0]
      , l = a[o - 1]
      , c = [];
    if (o > i)
        return mv(t, c, a, o / i),
        c;
    const u = pv(a, t, i);
    if (o > 0) {
        let f, h;
        const d = o > 1 ? Math.round((l - s) / (o - 1)) : null;
        for (xi(t, c, u, J(d) ? 0 : s - d, s),
        f = 0,
        h = o - 1; f < h; f++)
            xi(t, c, u, a[f], a[f + 1]);
        return xi(t, c, u, l, J(d) ? t.length : l + d),
        c
    }
    return xi(t, c, u),
    c
}
function dv(e) {
    const t = e.options.offset
      , n = e._tickSize()
      , r = e._length / n + (t ? 0 : 1)
      , i = e._maxLength / n;
    return Math.floor(Math.min(r, i))
}
function pv(e, t, n) {
    const r = yv(e)
      , i = t.length / n;
    if (!r)
        return Math.max(i, 1);
    const a = hm(r);
    for (let o = 0, s = a.length - 1; o < s; o++) {
        const l = a[o];
        if (l > i)
            return l
    }
    return Math.max(i, 1)
}
function gv(e) {
    const t = [];
    let n, r;
    for (n = 0,
    r = e.length; n < r; n++)
        e[n].major && t.push(n);
    return t
}
function mv(e, t, n, r) {
    let i = 0, a = n[0], o;
    for (r = Math.ceil(r),
    o = 0; o < e.length; o++)
        o === a && (t.push(e[o]),
        i++,
        a = n[i * r])
}
function xi(e, t, n, r, i) {
    const a = Y(r, 0)
      , o = Math.min(Y(i, e.length), e.length);
    let s = 0, l, c, u;
    for (n = Math.ceil(n),
    i && (l = i - r,
    n = l / Math.floor(l / n)),
    u = a; u < 0; )
        s++,
        u = Math.round(a + s * n);
    for (c = Math.max(a, 0); c < o; c++)
        c === u && (t.push(e[c]),
        s++,
        u = Math.round(a + s * n))
}
function yv(e) {
    const t = e.length;
    let n, r;
    if (t < 2)
        return !1;
    for (r = e[0],
    n = 1; n < t; ++n)
        if (e[n] - e[n - 1] !== r)
            return !1;
    return r
}
const vv = e => e === "left" ? "right" : e === "right" ? "left" : e
  , ac = (e, t, n) => t === "top" || t === "left" ? e[t] + n : e[t] - n
  , oc = (e, t) => Math.min(t || e, e);
function sc(e, t) {
    const n = []
      , r = e.length / t
      , i = e.length;
    let a = 0;
    for (; a < i; a += r)
        n.push(e[Math.floor(a)]);
    return n
}
function bv(e, t, n) {
    const r = e.ticks.length
      , i = Math.min(t, r - 1)
      , a = e._startPixel
      , o = e._endPixel
      , s = 1e-6;
    let l = e.getPixelForTick(i), c;
    if (!(n && (r === 1 ? c = Math.max(l - a, o - l) : t === 0 ? c = (e.getPixelForTick(1) - l) / 2 : c = (l - e.getPixelForTick(i - 1)) / 2,
    l += i < t ? c : -c,
    l < a - s || l > o + s)))
        return l
}
function xv(e, t) {
    tt(e, n => {
        const r = n.gc
          , i = r.length / 2;
        let a;
        if (i > t) {
            for (a = 0; a < i; ++a)
                delete n.data[r[a]];
            r.splice(0, i)
        }
    }
    )
}
function lr(e) {
    return e.drawTicks ? e.tickLength : 0
}
function lc(e, t) {
    if (!e.display)
        return 0;
    const n = vt(e.font, t)
      , r = St(e.padding);
    return (ut(e.text) ? e.text.length : 1) * n.lineHeight + r.height
}
function Ov(e, t) {
    return Se(e, {
        scale: t,
        type: "scale"
    })
}
function wv(e, t, n) {
    return Se(e, {
        tick: n,
        index: t,
        type: "tick"
    })
}
function _v(e, t, n) {
    let r = Ks(e);
    return (n && t !== "right" || !n && t === "right") && (r = vv(r)),
    r
}
function Pv(e, t, n, r) {
    const {top: i, left: a, bottom: o, right: s, chart: l} = e
      , {chartArea: c, scales: u} = l;
    let f = 0, h, d, p;
    const g = o - i
      , m = s - a;
    if (e.isHorizontal()) {
        if (d = _t(r, a, s),
        Z(n)) {
            const v = Object.keys(n)[0]
              , b = n[v];
            p = u[v].getPixelForValue(b) + g - t
        } else
            n === "center" ? p = (c.bottom + c.top) / 2 + g - t : p = ac(e, n, t);
        h = s - a
    } else {
        if (Z(n)) {
            const v = Object.keys(n)[0]
              , b = n[v];
            d = u[v].getPixelForValue(b) - m + t
        } else
            n === "center" ? d = (c.left + c.right) / 2 - m + t : d = ac(e, n, t);
        p = _t(r, o, i),
        f = n === "left" ? -pt : pt
    }
    return {
        titleX: d,
        titleY: p,
        maxWidth: h,
        rotation: f
    }
}
class ke extends te {
    constructor(t) {
        super(),
        this.id = t.id,
        this.type = t.type,
        this.options = void 0,
        this.ctx = t.ctx,
        this.chart = t.chart,
        this.top = void 0,
        this.bottom = void 0,
        this.left = void 0,
        this.right = void 0,
        this.width = void 0,
        this.height = void 0,
        this._margins = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        },
        this.maxWidth = void 0,
        this.maxHeight = void 0,
        this.paddingTop = void 0,
        this.paddingBottom = void 0,
        this.paddingLeft = void 0,
        this.paddingRight = void 0,
        this.axis = void 0,
        this.labelRotation = void 0,
        this.min = void 0,
        this.max = void 0,
        this._range = void 0,
        this.ticks = [],
        this._gridLineItems = null,
        this._labelItems = null,
        this._labelSizes = null,
        this._length = 0,
        this._maxLength = 0,
        this._longestTextCache = {},
        this._startPixel = void 0,
        this._endPixel = void 0,
        this._reversePixels = !1,
        this._userMax = void 0,
        this._userMin = void 0,
        this._suggestedMax = void 0,
        this._suggestedMin = void 0,
        this._ticksLength = 0,
        this._borderValue = 0,
        this._cache = {},
        this._dataLimitsCached = !1,
        this.$context = void 0
    }
    init(t) {
        this.options = t.setContext(this.getContext()),
        this.axis = t.axis,
        this._userMin = this.parse(t.min),
        this._userMax = this.parse(t.max),
        this._suggestedMin = this.parse(t.suggestedMin),
        this._suggestedMax = this.parse(t.suggestedMax)
    }
    parse(t, n) {
        return t
    }
    getUserBounds() {
        let {_userMin: t, _userMax: n, _suggestedMin: r, _suggestedMax: i} = this;
        return t = It(t, Number.POSITIVE_INFINITY),
        n = It(n, Number.NEGATIVE_INFINITY),
        r = It(r, Number.POSITIVE_INFINITY),
        i = It(i, Number.NEGATIVE_INFINITY),
        {
            min: It(t, r),
            max: It(n, i),
            minDefined: dt(t),
            maxDefined: dt(n)
        }
    }
    getMinMax(t) {
        let {min: n, max: r, minDefined: i, maxDefined: a} = this.getUserBounds(), o;
        if (i && a)
            return {
                min: n,
                max: r
            };
        const s = this.getMatchingVisibleMetas();
        for (let l = 0, c = s.length; l < c; ++l)
            o = s[l].controller.getMinMax(this, t),
            i || (n = Math.min(n, o.min)),
            a || (r = Math.max(r, o.max));
        return n = a && n > r ? r : n,
        r = i && n > r ? n : r,
        {
            min: It(n, It(r, n)),
            max: It(r, It(n, r))
        }
    }
    getPadding() {
        return {
            left: this.paddingLeft || 0,
            top: this.paddingTop || 0,
            right: this.paddingRight || 0,
            bottom: this.paddingBottom || 0
        }
    }
    getTicks() {
        return this.ticks
    }
    getLabels() {
        const t = this.chart.data;
        return this.options.labels || (this.isHorizontal() ? t.xLabels : t.yLabels) || t.labels || []
    }
    getLabelItems(t=this.chart.chartArea) {
        return this._labelItems || (this._labelItems = this._computeLabelItems(t))
    }
    beforeLayout() {
        this._cache = {},
        this._dataLimitsCached = !1
    }
    beforeUpdate() {
        rt(this.options.beforeUpdate, [this])
    }
    update(t, n, r) {
        const {beginAtZero: i, grace: a, ticks: o} = this.options
          , s = o.sampleSize;
        this.beforeUpdate(),
        this.maxWidth = t,
        this.maxHeight = n,
        this._margins = r = Object.assign({
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        }, r),
        this.ticks = null,
        this._labelSizes = null,
        this._gridLineItems = null,
        this._labelItems = null,
        this.beforeSetDimensions(),
        this.setDimensions(),
        this.afterSetDimensions(),
        this._maxLength = this.isHorizontal() ? this.width + r.left + r.right : this.height + r.top + r.bottom,
        this._dataLimitsCached || (this.beforeDataLimits(),
        this.determineDataLimits(),
        this.afterDataLimits(),
        this._range = zm(this, a, i),
        this._dataLimitsCached = !0),
        this.beforeBuildTicks(),
        this.ticks = this.buildTicks() || [],
        this.afterBuildTicks();
        const l = s < this.ticks.length;
        this._convertTicksToLabels(l ? sc(this.ticks, s) : this.ticks),
        this.configure(),
        this.beforeCalculateLabelRotation(),
        this.calculateLabelRotation(),
        this.afterCalculateLabelRotation(),
        o.display && (o.autoSkip || o.source === "auto") && (this.ticks = hv(this, this.ticks),
        this._labelSizes = null,
        this.afterAutoSkip()),
        l && this._convertTicksToLabels(this.ticks),
        this.beforeFit(),
        this.fit(),
        this.afterFit(),
        this.afterUpdate()
    }
    configure() {
        let t = this.options.reverse, n, r;
        this.isHorizontal() ? (n = this.left,
        r = this.right) : (n = this.top,
        r = this.bottom,
        t = !t),
        this._startPixel = n,
        this._endPixel = r,
        this._reversePixels = t,
        this._length = r - n,
        this._alignToPixels = this.options.alignToPixels
    }
    afterUpdate() {
        rt(this.options.afterUpdate, [this])
    }
    beforeSetDimensions() {
        rt(this.options.beforeSetDimensions, [this])
    }
    setDimensions() {
        this.isHorizontal() ? (this.width = this.maxWidth,
        this.left = 0,
        this.right = this.width) : (this.height = this.maxHeight,
        this.top = 0,
        this.bottom = this.height),
        this.paddingLeft = 0,
        this.paddingTop = 0,
        this.paddingRight = 0,
        this.paddingBottom = 0
    }
    afterSetDimensions() {
        rt(this.options.afterSetDimensions, [this])
    }
    _callHooks(t) {
        this.chart.notifyPlugins(t, this.getContext()),
        rt(this.options[t], [this])
    }
    beforeDataLimits() {
        this._callHooks("beforeDataLimits")
    }
    determineDataLimits() {}
    afterDataLimits() {
        this._callHooks("afterDataLimits")
    }
    beforeBuildTicks() {
        this._callHooks("beforeBuildTicks")
    }
    buildTicks() {
        return []
    }
    afterBuildTicks() {
        this._callHooks("afterBuildTicks")
    }
    beforeTickToLabelConversion() {
        rt(this.options.beforeTickToLabelConversion, [this])
    }
    generateTickLabels(t) {
        const n = this.options.ticks;
        let r, i, a;
        for (r = 0,
        i = t.length; r < i; r++)
            a = t[r],
            a.label = rt(n.callback, [a.value, r, t], this)
    }
    afterTickToLabelConversion() {
        rt(this.options.afterTickToLabelConversion, [this])
    }
    beforeCalculateLabelRotation() {
        rt(this.options.beforeCalculateLabelRotation, [this])
    }
    calculateLabelRotation() {
        const t = this.options
          , n = t.ticks
          , r = oc(this.ticks.length, t.ticks.maxTicksLimit)
          , i = n.minRotation || 0
          , a = n.maxRotation;
        let o = i, s, l, c;
        if (!this._isVisible() || !n.display || i >= a || r <= 1 || !this.isHorizontal()) {
            this.labelRotation = i;
            return
        }
        const u = this._getLabelSizes()
          , f = u.widest.width
          , h = u.highest.height
          , d = Ot(this.chart.width - f, 0, this.maxWidth);
        s = t.offset ? this.maxWidth / r : d / (r - 1),
        f + 6 > s && (s = d / (r - (t.offset ? .5 : 1)),
        l = this.maxHeight - lr(t.grid) - n.padding - lc(t.title, this.chart.options.font),
        c = Math.sqrt(f * f + h * h),
        o = Vs(Math.min(Math.asin(Ot((u.highest.height + 6) / s, -1, 1)), Math.asin(Ot(l / c, -1, 1)) - Math.asin(Ot(h / c, -1, 1)))),
        o = Math.max(i, Math.min(a, o))),
        this.labelRotation = o
    }
    afterCalculateLabelRotation() {
        rt(this.options.afterCalculateLabelRotation, [this])
    }
    afterAutoSkip() {}
    beforeFit() {
        rt(this.options.beforeFit, [this])
    }
    fit() {
        const t = {
            width: 0,
            height: 0
        }
          , {chart: n, options: {ticks: r, title: i, grid: a}} = this
          , o = this._isVisible()
          , s = this.isHorizontal();
        if (o) {
            const l = lc(i, n.options.font);
            if (s ? (t.width = this.maxWidth,
            t.height = lr(a) + l) : (t.height = this.maxHeight,
            t.width = lr(a) + l),
            r.display && this.ticks.length) {
                const {first: c, last: u, widest: f, highest: h} = this._getLabelSizes()
                  , d = r.padding * 2
                  , p = Xt(this.labelRotation)
                  , g = Math.cos(p)
                  , m = Math.sin(p);
                if (s) {
                    const v = r.mirror ? 0 : m * f.width + g * h.height;
                    t.height = Math.min(this.maxHeight, t.height + v + d)
                } else {
                    const v = r.mirror ? 0 : g * f.width + m * h.height;
                    t.width = Math.min(this.maxWidth, t.width + v + d)
                }
                this._calculatePadding(c, u, m, g)
            }
        }
        this._handleMargins(),
        s ? (this.width = this._length = n.width - this._margins.left - this._margins.right,
        this.height = t.height) : (this.width = t.width,
        this.height = this._length = n.height - this._margins.top - this._margins.bottom)
    }
    _calculatePadding(t, n, r, i) {
        const {ticks: {align: a, padding: o}, position: s} = this.options
          , l = this.labelRotation !== 0
          , c = s !== "top" && this.axis === "x";
        if (this.isHorizontal()) {
            const u = this.getPixelForTick(0) - this.left
              , f = this.right - this.getPixelForTick(this.ticks.length - 1);
            let h = 0
              , d = 0;
            l ? c ? (h = i * t.width,
            d = r * n.height) : (h = r * t.height,
            d = i * n.width) : a === "start" ? d = n.width : a === "end" ? h = t.width : a !== "inner" && (h = t.width / 2,
            d = n.width / 2),
            this.paddingLeft = Math.max((h - u + o) * this.width / (this.width - u), 0),
            this.paddingRight = Math.max((d - f + o) * this.width / (this.width - f), 0)
        } else {
            let u = n.height / 2
              , f = t.height / 2;
            a === "start" ? (u = 0,
            f = t.height) : a === "end" && (u = n.height,
            f = 0),
            this.paddingTop = u + o,
            this.paddingBottom = f + o
        }
    }
    _handleMargins() {
        this._margins && (this._margins.left = Math.max(this.paddingLeft, this._margins.left),
        this._margins.top = Math.max(this.paddingTop, this._margins.top),
        this._margins.right = Math.max(this.paddingRight, this._margins.right),
        this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom))
    }
    afterFit() {
        rt(this.options.afterFit, [this])
    }
    isHorizontal() {
        const {axis: t, position: n} = this.options;
        return n === "top" || n === "bottom" || t === "x"
    }
    isFullSize() {
        return this.options.fullSize
    }
    _convertTicksToLabels(t) {
        this.beforeTickToLabelConversion(),
        this.generateTickLabels(t);
        let n, r;
        for (n = 0,
        r = t.length; n < r; n++)
            J(t[n].label) && (t.splice(n, 1),
            r--,
            n--);
        this.afterTickToLabelConversion()
    }
    _getLabelSizes() {
        let t = this._labelSizes;
        if (!t) {
            const n = this.options.ticks.sampleSize;
            let r = this.ticks;
            n < r.length && (r = sc(r, n)),
            this._labelSizes = t = this._computeLabelSizes(r, r.length, this.options.ticks.maxTicksLimit)
        }
        return t
    }
    _computeLabelSizes(t, n, r) {
        const {ctx: i, _longestTextCache: a} = this
          , o = []
          , s = []
          , l = Math.floor(n / oc(n, r));
        let c = 0, u = 0, f, h, d, p, g, m, v, b, x, w, y;
        for (f = 0; f < n; f += l) {
            if (p = t[f].label,
            g = this._resolveTickFontOptions(f),
            i.font = m = g.string,
            v = a[m] = a[m] || {
                data: {},
                gc: []
            },
            b = g.lineHeight,
            x = w = 0,
            !J(p) && !ut(p))
                x = Vi(i, v.data, v.gc, x, p),
                w = b;
            else if (ut(p))
                for (h = 0,
                d = p.length; h < d; ++h)
                    y = p[h],
                    !J(y) && !ut(y) && (x = Vi(i, v.data, v.gc, x, y),
                    w += b);
            o.push(x),
            s.push(w),
            c = Math.max(x, c),
            u = Math.max(w, u)
        }
        xv(a, n);
        const O = o.indexOf(c)
          , _ = s.indexOf(u)
          , P = S => ({
            width: o[S] || 0,
            height: s[S] || 0
        });
        return {
            first: P(0),
            last: P(n - 1),
            widest: P(O),
            highest: P(_),
            widths: o,
            heights: s
        }
    }
    getLabelForValue(t) {
        return t
    }
    getPixelForValue(t, n) {
        return NaN
    }
    getValueForPixel(t) {}
    getPixelForTick(t) {
        const n = this.ticks;
        return t < 0 || t > n.length - 1 ? null : this.getPixelForValue(n[t].value)
    }
    getPixelForDecimal(t) {
        this._reversePixels && (t = 1 - t);
        const n = this._startPixel + t * this._length;
        return gm(this._alignToPixels ? $e(this.chart, n, 0) : n)
    }
    getDecimalForPixel(t) {
        const n = (t - this._startPixel) / this._length;
        return this._reversePixels ? 1 - n : n
    }
    getBasePixel() {
        return this.getPixelForValue(this.getBaseValue())
    }
    getBaseValue() {
        const {min: t, max: n} = this;
        return t < 0 && n < 0 ? n : t > 0 && n > 0 ? t : 0
    }
    getContext(t) {
        const n = this.ticks || [];
        if (t >= 0 && t < n.length) {
            const r = n[t];
            return r.$context || (r.$context = wv(this.getContext(), t, r))
        }
        return this.$context || (this.$context = Ov(this.chart.getContext(), this))
    }
    _tickSize() {
        const t = this.options.ticks
          , n = Xt(this.labelRotation)
          , r = Math.abs(Math.cos(n))
          , i = Math.abs(Math.sin(n))
          , a = this._getLabelSizes()
          , o = t.autoSkipPadding || 0
          , s = a ? a.widest.width + o : 0
          , l = a ? a.highest.height + o : 0;
        return this.isHorizontal() ? l * r > s * i ? s / r : l / i : l * i < s * r ? l / r : s / i
    }
    _isVisible() {
        const t = this.options.display;
        return t !== "auto" ? !!t : this.getMatchingVisibleMetas().length > 0
    }
    _computeGridLineItems(t) {
        const n = this.axis
          , r = this.chart
          , i = this.options
          , {grid: a, position: o, border: s} = i
          , l = a.offset
          , c = this.isHorizontal()
          , f = this.ticks.length + (l ? 1 : 0)
          , h = lr(a)
          , d = []
          , p = s.setContext(this.getContext())
          , g = p.display ? p.width : 0
          , m = g / 2
          , v = function(j) {
            return $e(r, j, g)
        };
        let b, x, w, y, O, _, P, S, k, E, M, C;
        if (o === "top")
            b = v(this.bottom),
            _ = this.bottom - h,
            S = b - m,
            E = v(t.top) + m,
            C = t.bottom;
        else if (o === "bottom")
            b = v(this.top),
            E = t.top,
            C = v(t.bottom) - m,
            _ = b + m,
            S = this.top + h;
        else if (o === "left")
            b = v(this.right),
            O = this.right - h,
            P = b - m,
            k = v(t.left) + m,
            M = t.right;
        else if (o === "right")
            b = v(this.left),
            k = t.left,
            M = v(t.right) - m,
            O = b + m,
            P = this.left + h;
        else if (n === "x") {
            if (o === "center")
                b = v((t.top + t.bottom) / 2 + .5);
            else if (Z(o)) {
                const j = Object.keys(o)[0]
                  , $ = o[j];
                b = v(this.chart.scales[j].getPixelForValue($))
            }
            E = t.top,
            C = t.bottom,
            _ = b + m,
            S = _ + h
        } else if (n === "y") {
            if (o === "center")
                b = v((t.left + t.right) / 2);
            else if (Z(o)) {
                const j = Object.keys(o)[0]
                  , $ = o[j];
                b = v(this.chart.scales[j].getPixelForValue($))
            }
            O = b - m,
            P = O - h,
            k = t.left,
            M = t.right
        }
        const I = Y(i.ticks.maxTicksLimit, f)
          , T = Math.max(1, Math.ceil(f / I));
        for (x = 0; x < f; x += T) {
            const j = this.getContext(x)
              , $ = a.setContext(j)
              , R = s.setContext(j)
              , B = $.lineWidth
              , W = $.color
              , V = R.dash || []
              , z = R.dashOffset
              , H = $.tickWidth
              , Q = $.tickColor
              , ct = $.tickBorderDash || []
              , mt = $.tickBorderDashOffset;
            w = bv(this, x, l),
            w !== void 0 && (y = $e(r, w, B),
            c ? O = P = k = M = y : _ = S = E = C = y,
            d.push({
                tx1: O,
                ty1: _,
                tx2: P,
                ty2: S,
                x1: k,
                y1: E,
                x2: M,
                y2: C,
                width: B,
                color: W,
                borderDash: V,
                borderDashOffset: z,
                tickWidth: H,
                tickColor: Q,
                tickBorderDash: ct,
                tickBorderDashOffset: mt
            }))
        }
        return this._ticksLength = f,
        this._borderValue = b,
        d
    }
    _computeLabelItems(t) {
        const n = this.axis
          , r = this.options
          , {position: i, ticks: a} = r
          , o = this.isHorizontal()
          , s = this.ticks
          , {align: l, crossAlign: c, padding: u, mirror: f} = a
          , h = lr(r.grid)
          , d = h + u
          , p = f ? -u : d
          , g = -Xt(this.labelRotation)
          , m = [];
        let v, b, x, w, y, O, _, P, S, k, E, M, C = "middle";
        if (i === "top")
            O = this.bottom - p,
            _ = this._getXAxisLabelAlignment();
        else if (i === "bottom")
            O = this.top + p,
            _ = this._getXAxisLabelAlignment();
        else if (i === "left") {
            const T = this._getYAxisLabelAlignment(h);
            _ = T.textAlign,
            y = T.x
        } else if (i === "right") {
            const T = this._getYAxisLabelAlignment(h);
            _ = T.textAlign,
            y = T.x
        } else if (n === "x") {
            if (i === "center")
                O = (t.top + t.bottom) / 2 + d;
            else if (Z(i)) {
                const T = Object.keys(i)[0]
                  , j = i[T];
                O = this.chart.scales[T].getPixelForValue(j) + d
            }
            _ = this._getXAxisLabelAlignment()
        } else if (n === "y") {
            if (i === "center")
                y = (t.left + t.right) / 2 - d;
            else if (Z(i)) {
                const T = Object.keys(i)[0]
                  , j = i[T];
                y = this.chart.scales[T].getPixelForValue(j)
            }
            _ = this._getYAxisLabelAlignment(h).textAlign
        }
        n === "y" && (l === "start" ? C = "top" : l === "end" && (C = "bottom"));
        const I = this._getLabelSizes();
        for (v = 0,
        b = s.length; v < b; ++v) {
            x = s[v],
            w = x.label;
            const T = a.setContext(this.getContext(v));
            P = this.getPixelForTick(v) + a.labelOffset,
            S = this._resolveTickFontOptions(v),
            k = S.lineHeight,
            E = ut(w) ? w.length : 1;
            const j = E / 2
              , $ = T.color
              , R = T.textStrokeColor
              , B = T.textStrokeWidth;
            let W = _;
            o ? (y = P,
            _ === "inner" && (v === b - 1 ? W = this.options.reverse ? "left" : "right" : v === 0 ? W = this.options.reverse ? "right" : "left" : W = "center"),
            i === "top" ? c === "near" || g !== 0 ? M = -E * k + k / 2 : c === "center" ? M = -I.highest.height / 2 - j * k + k : M = -I.highest.height + k / 2 : c === "near" || g !== 0 ? M = k / 2 : c === "center" ? M = I.highest.height / 2 - j * k : M = I.highest.height - E * k,
            f && (M *= -1),
            g !== 0 && !T.showLabelBackdrop && (y += k / 2 * Math.sin(g))) : (O = P,
            M = (1 - E) * k / 2);
            let V;
            if (T.showLabelBackdrop) {
                const z = St(T.backdropPadding)
                  , H = I.heights[v]
                  , Q = I.widths[v];
                let ct = M - z.top
                  , mt = 0 - z.left;
                switch (C) {
                case "middle":
                    ct -= H / 2;
                    break;
                case "bottom":
                    ct -= H;
                    break
                }
                switch (_) {
                case "center":
                    mt -= Q / 2;
                    break;
                case "right":
                    mt -= Q;
                    break;
                case "inner":
                    v === b - 1 ? mt -= Q : v > 0 && (mt -= Q / 2);
                    break
                }
                V = {
                    left: mt,
                    top: ct,
                    width: Q + z.width,
                    height: H + z.height,
                    color: T.backdropColor
                }
            }
            m.push({
                label: w,
                font: S,
                textOffset: M,
                options: {
                    rotation: g,
                    color: $,
                    strokeColor: R,
                    strokeWidth: B,
                    textAlign: W,
                    textBaseline: C,
                    translation: [y, O],
                    backdrop: V
                }
            })
        }
        return m
    }
    _getXAxisLabelAlignment() {
        const {position: t, ticks: n} = this.options;
        if (-Xt(this.labelRotation))
            return t === "top" ? "left" : "right";
        let i = "center";
        return n.align === "start" ? i = "left" : n.align === "end" ? i = "right" : n.align === "inner" && (i = "inner"),
        i
    }
    _getYAxisLabelAlignment(t) {
        const {position: n, ticks: {crossAlign: r, mirror: i, padding: a}} = this.options
          , o = this._getLabelSizes()
          , s = t + a
          , l = o.widest.width;
        let c, u;
        return n === "left" ? i ? (u = this.right + a,
        r === "near" ? c = "left" : r === "center" ? (c = "center",
        u += l / 2) : (c = "right",
        u += l)) : (u = this.right - s,
        r === "near" ? c = "right" : r === "center" ? (c = "center",
        u -= l / 2) : (c = "left",
        u = this.left)) : n === "right" ? i ? (u = this.left + a,
        r === "near" ? c = "right" : r === "center" ? (c = "center",
        u -= l / 2) : (c = "left",
        u -= l)) : (u = this.left + s,
        r === "near" ? c = "left" : r === "center" ? (c = "center",
        u += l / 2) : (c = "right",
        u = this.right)) : c = "right",
        {
            textAlign: c,
            x: u
        }
    }
    _computeLabelArea() {
        if (this.options.ticks.mirror)
            return;
        const t = this.chart
          , n = this.options.position;
        if (n === "left" || n === "right")
            return {
                top: 0,
                left: this.left,
                bottom: t.height,
                right: this.right
            };
        if (n === "top" || n === "bottom")
            return {
                top: this.top,
                left: 0,
                bottom: this.bottom,
                right: t.width
            }
    }
    drawBackground() {
        const {ctx: t, options: {backgroundColor: n}, left: r, top: i, width: a, height: o} = this;
        n && (t.save(),
        t.fillStyle = n,
        t.fillRect(r, i, a, o),
        t.restore())
    }
    getLineWidthForValue(t) {
        const n = this.options.grid;
        if (!this._isVisible() || !n.display)
            return 0;
        const i = this.ticks.findIndex(a => a.value === t);
        return i >= 0 ? n.setContext(this.getContext(i)).lineWidth : 0
    }
    drawGrid(t) {
        const n = this.options.grid
          , r = this.ctx
          , i = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(t));
        let a, o;
        const s = (l, c, u) => {
            !u.width || !u.color || (r.save(),
            r.lineWidth = u.width,
            r.strokeStyle = u.color,
            r.setLineDash(u.borderDash || []),
            r.lineDashOffset = u.borderDashOffset,
            r.beginPath(),
            r.moveTo(l.x, l.y),
            r.lineTo(c.x, c.y),
            r.stroke(),
            r.restore())
        }
        ;
        if (n.display)
            for (a = 0,
            o = i.length; a < o; ++a) {
                const l = i[a];
                n.drawOnChartArea && s({
                    x: l.x1,
                    y: l.y1
                }, {
                    x: l.x2,
                    y: l.y2
                }, l),
                n.drawTicks && s({
                    x: l.tx1,
                    y: l.ty1
                }, {
                    x: l.tx2,
                    y: l.ty2
                }, {
                    color: l.tickColor,
                    width: l.tickWidth,
                    borderDash: l.tickBorderDash,
                    borderDashOffset: l.tickBorderDashOffset
                })
            }
    }
    drawBorder() {
        const {chart: t, ctx: n, options: {border: r, grid: i}} = this
          , a = r.setContext(this.getContext())
          , o = r.display ? a.width : 0;
        if (!o)
            return;
        const s = i.setContext(this.getContext(0)).lineWidth
          , l = this._borderValue;
        let c, u, f, h;
        this.isHorizontal() ? (c = $e(t, this.left, o) - o / 2,
        u = $e(t, this.right, s) + s / 2,
        f = h = l) : (f = $e(t, this.top, o) - o / 2,
        h = $e(t, this.bottom, s) + s / 2,
        c = u = l),
        n.save(),
        n.lineWidth = a.width,
        n.strokeStyle = a.color,
        n.beginPath(),
        n.moveTo(c, f),
        n.lineTo(u, h),
        n.stroke(),
        n.restore()
    }
    drawLabels(t) {
        if (!this.options.ticks.display)
            return;
        const r = this.ctx
          , i = this._computeLabelArea();
        i && Ca(r, i);
        const a = this.getLabelItems(t);
        for (const o of a) {
            const s = o.options
              , l = o.font
              , c = o.label
              , u = o.textOffset;
            Je(r, c, 0, u, l, s)
        }
        i && Da(r)
    }
    drawTitle() {
        const {ctx: t, options: {position: n, title: r, reverse: i}} = this;
        if (!r.display)
            return;
        const a = vt(r.font)
          , o = St(r.padding)
          , s = r.align;
        let l = a.lineHeight / 2;
        n === "bottom" || n === "center" || Z(n) ? (l += o.bottom,
        ut(r.text) && (l += a.lineHeight * (r.text.length - 1))) : l += o.top;
        const {titleX: c, titleY: u, maxWidth: f, rotation: h} = Pv(this, l, n, s);
        Je(t, r.text, 0, 0, a, {
            color: r.color,
            maxWidth: f,
            rotation: h,
            textAlign: _v(s, n, i),
            textBaseline: "middle",
            translation: [c, u]
        })
    }
    draw(t) {
        this._isVisible() && (this.drawBackground(),
        this.drawGrid(t),
        this.drawBorder(),
        this.drawTitle(),
        this.drawLabels(t))
    }
    _layers() {
        const t = this.options
          , n = t.ticks && t.ticks.z || 0
          , r = Y(t.grid && t.grid.z, -1)
          , i = Y(t.border && t.border.z, 0);
        return !this._isVisible() || this.draw !== ke.prototype.draw ? [{
            z: n,
            draw: a => {
                this.draw(a)
            }
        }] : [{
            z: r,
            draw: a => {
                this.drawBackground(),
                this.drawGrid(a),
                this.drawTitle()
            }
        }, {
            z: i,
            draw: () => {
                this.drawBorder()
            }
        }, {
            z: n,
            draw: a => {
                this.drawLabels(a)
            }
        }]
    }
    getMatchingVisibleMetas(t) {
        const n = this.chart.getSortedVisibleDatasetMetas()
          , r = this.axis + "AxisID"
          , i = [];
        let a, o;
        for (a = 0,
        o = n.length; a < o; ++a) {
            const s = n[a];
            s[r] === this.id && (!t || s.type === t) && i.push(s)
        }
        return i
    }
    _resolveTickFontOptions(t) {
        const n = this.options.ticks.setContext(this.getContext(t));
        return vt(n.font)
    }
    _maxDigits() {
        const t = this._resolveTickFontOptions(0).lineHeight;
        return (this.isHorizontal() ? this.width : this.height) / t
    }
}
class Oi {
    constructor(t, n, r) {
        this.type = t,
        this.scope = n,
        this.override = r,
        this.items = Object.create(null)
    }
    isForType(t) {
        return Object.prototype.isPrototypeOf.call(this.type.prototype, t.prototype)
    }
    register(t) {
        const n = Object.getPrototypeOf(t);
        let r;
        kv(n) && (r = this.register(n));
        const i = this.items
          , a = t.id
          , o = this.scope + "." + a;
        if (!a)
            throw new Error("class does not have id: " + t);
        return a in i || (i[a] = t,
        Av(t, o, r),
        this.override && st.override(t.id, t.overrides)),
        o
    }
    get(t) {
        return this.items[t]
    }
    unregister(t) {
        const n = this.items
          , r = t.id
          , i = this.scope;
        r in n && delete n[r],
        i && r in st[i] && (delete st[i][r],
        this.override && delete Ze[r])
    }
}
function Av(e, t, n) {
    const r = Er(Object.create(null), [n ? st.get(n) : {}, st.get(t), e.defaults]);
    st.set(t, r),
    e.defaultRoutes && Sv(t, e.defaultRoutes),
    e.descriptors && st.describe(t, e.descriptors)
}
function Sv(e, t) {
    Object.keys(t).forEach(n => {
        const r = n.split(".")
          , i = r.pop()
          , a = [e].concat(r).join(".")
          , o = t[n].split(".")
          , s = o.pop()
          , l = o.join(".");
        st.route(a, i, l, s)
    }
    )
}
function kv(e) {
    return "id"in e && "defaults"in e
}
class Ev {
    constructor() {
        this.controllers = new Oi(he,"datasets",!0),
        this.elements = new Oi(te,"elements"),
        this.plugins = new Oi(Object,"plugins"),
        this.scales = new Oi(ke,"scales"),
        this._typedRegistries = [this.controllers, this.scales, this.elements]
    }
    add(...t) {
        this._each("register", t)
    }
    remove(...t) {
        this._each("unregister", t)
    }
    addControllers(...t) {
        this._each("register", t, this.controllers)
    }
    addElements(...t) {
        this._each("register", t, this.elements)
    }
    addPlugins(...t) {
        this._each("register", t, this.plugins)
    }
    addScales(...t) {
        this._each("register", t, this.scales)
    }
    getController(t) {
        return this._get(t, this.controllers, "controller")
    }
    getElement(t) {
        return this._get(t, this.elements, "element")
    }
    getPlugin(t) {
        return this._get(t, this.plugins, "plugin")
    }
    getScale(t) {
        return this._get(t, this.scales, "scale")
    }
    removeControllers(...t) {
        this._each("unregister", t, this.controllers)
    }
    removeElements(...t) {
        this._each("unregister", t, this.elements)
    }
    removePlugins(...t) {
        this._each("unregister", t, this.plugins)
    }
    removeScales(...t) {
        this._each("unregister", t, this.scales)
    }
    _each(t, n, r) {
        [...n].forEach(i => {
            const a = r || this._getRegistryForType(i);
            r || a.isForType(i) || a === this.plugins && i.id ? this._exec(t, a, i) : tt(i, o => {
                const s = r || this._getRegistryForType(o);
                this._exec(t, s, o)
            }
            )
        }
        )
    }
    _exec(t, n, r) {
        const i = Ws(t);
        rt(r["before" + i], [], r),
        n[t](r),
        rt(r["after" + i], [], r)
    }
    _getRegistryForType(t) {
        for (let n = 0; n < this._typedRegistries.length; n++) {
            const r = this._typedRegistries[n];
            if (r.isForType(t))
                return r
        }
        return this.plugins
    }
    _get(t, n, r) {
        const i = n.get(t);
        if (i === void 0)
            throw new Error('"' + t + '" is not a registered ' + r + ".");
        return i
    }
}
var Vt = new Ev;
class Mv {
    constructor() {
        this._init = []
    }
    notify(t, n, r, i) {
        n === "beforeInit" && (this._init = this._createDescriptors(t, !0),
        this._notify(this._init, t, "install"));
        const a = i ? this._descriptors(t).filter(i) : this._descriptors(t)
          , o = this._notify(a, t, n, r);
        return n === "afterDestroy" && (this._notify(a, t, "stop"),
        this._notify(this._init, t, "uninstall")),
        o
    }
    _notify(t, n, r, i) {
        i = i || {};
        for (const a of t) {
            const o = a.plugin
              , s = o[r]
              , l = [n, i, a.options];
            if (rt(s, l, o) === !1 && i.cancelable)
                return !1
        }
        return !0
    }
    invalidate() {
        J(this._cache) || (this._oldCache = this._cache,
        this._cache = void 0)
    }
    _descriptors(t) {
        if (this._cache)
            return this._cache;
        const n = this._cache = this._createDescriptors(t);
        return this._notifyStateChanges(t),
        n
    }
    _createDescriptors(t, n) {
        const r = t && t.config
          , i = Y(r.options && r.options.plugins, {})
          , a = Tv(r);
        return i === !1 && !n ? [] : Cv(t, a, i, n)
    }
    _notifyStateChanges(t) {
        const n = this._oldCache || []
          , r = this._cache
          , i = (a, o) => a.filter(s => !o.some(l => s.plugin.id === l.plugin.id));
        this._notify(i(n, r), t, "stop"),
        this._notify(i(r, n), t, "start")
    }
}
function Tv(e) {
    const t = {}
      , n = []
      , r = Object.keys(Vt.plugins.items);
    for (let a = 0; a < r.length; a++)
        n.push(Vt.getPlugin(r[a]));
    const i = e.plugins || [];
    for (let a = 0; a < i.length; a++) {
        const o = i[a];
        n.indexOf(o) === -1 && (n.push(o),
        t[o.id] = !0)
    }
    return {
        plugins: n,
        localIds: t
    }
}
function jv(e, t) {
    return !t && e === !1 ? null : e === !0 ? {} : e
}
function Cv(e, {plugins: t, localIds: n}, r, i) {
    const a = []
      , o = e.getContext();
    for (const s of t) {
        const l = s.id
          , c = jv(r[l], i);
        c !== null && a.push({
            plugin: s,
            options: Dv(e.config, {
                plugin: s,
                local: n[l]
            }, c, o)
        })
    }
    return a
}
function Dv(e, {plugin: t, local: n}, r, i) {
    const a = e.pluginScopeKeys(t)
      , o = e.getOptionScopes(r, a);
    return n && t.defaults && o.push(t.defaults),
    e.createResolver(o, i, [""], {
        scriptable: !1,
        indexable: !1,
        allKeys: !0
    })
}
function jo(e, t) {
    const n = st.datasets[e] || {};
    return ((t.datasets || {})[e] || {}).indexAxis || t.indexAxis || n.indexAxis || "x"
}
function Iv(e, t) {
    let n = e;
    return e === "_index_" ? n = t : e === "_value_" && (n = t === "x" ? "y" : "x"),
    n
}
function $v(e, t) {
    return e === t ? "_index_" : "_value_"
}
function cc(e) {
    if (e === "x" || e === "y" || e === "r")
        return e
}
function Lv(e) {
    if (e === "top" || e === "bottom")
        return "x";
    if (e === "left" || e === "right")
        return "y"
}
function Co(e, ...t) {
    if (cc(e))
        return e;
    for (const n of t) {
        const r = n.axis || Lv(n.position) || e.length > 1 && cc(e[0].toLowerCase());
        if (r)
            return r
    }
    throw new Error(`Cannot determine type of '${e}' axis. Please provide 'axis' or 'position' option.`)
}
function uc(e, t, n) {
    if (n[t + "AxisID"] === e)
        return {
            axis: t
        }
}
function Rv(e, t) {
    if (t.data && t.data.datasets) {
        const n = t.data.datasets.filter(r => r.xAxisID === e || r.yAxisID === e);
        if (n.length)
            return uc(e, "x", n[0]) || uc(e, "y", n[0])
    }
    return {}
}
function Bv(e, t) {
    const n = Ze[e.type] || {
        scales: {}
    }
      , r = t.scales || {}
      , i = jo(e.type, t)
      , a = Object.create(null);
    return Object.keys(r).forEach(o => {
        const s = r[o];
        if (!Z(s))
            return console.error(`Invalid scale configuration for scale: ${o}`);
        if (s._proxy)
            return console.warn(`Ignoring resolver passed as options for scale: ${o}`);
        const l = Co(o, s, Rv(o, e), st.scales[s.type])
          , c = $v(l, i)
          , u = n.scales || {};
        a[o] = yr(Object.create(null), [{
            axis: l
        }, s, u[l], u[c]])
    }
    ),
    e.data.datasets.forEach(o => {
        const s = o.type || e.type
          , l = o.indexAxis || jo(s, t)
          , u = (Ze[s] || {}).scales || {};
        Object.keys(u).forEach(f => {
            const h = Iv(f, l)
              , d = o[h + "AxisID"] || h;
            a[d] = a[d] || Object.create(null),
            yr(a[d], [{
                axis: h
            }, r[d], u[f]])
        }
        )
    }
    ),
    Object.keys(a).forEach(o => {
        const s = a[o];
        yr(s, [st.scales[s.type], st.scale])
    }
    ),
    a
}
function Uh(e) {
    const t = e.options || (e.options = {});
    t.plugins = Y(t.plugins, {}),
    t.scales = Bv(e, t)
}
function Yh(e) {
    return e = e || {},
    e.datasets = e.datasets || [],
    e.labels = e.labels || [],
    e
}
function Nv(e) {
    return e = e || {},
    e.data = Yh(e.data),
    Uh(e),
    e
}
const fc = new Map
  , qh = new Set;
function wi(e, t) {
    let n = fc.get(e);
    return n || (n = t(),
    fc.set(e, n),
    qh.add(n)),
    n
}
const cr = (e, t, n) => {
    const r = _e(t, n);
    r !== void 0 && e.add(r)
}
;
class zv {
    constructor(t) {
        this._config = Nv(t),
        this._scopeCache = new Map,
        this._resolverCache = new Map
    }
    get platform() {
        return this._config.platform
    }
    get type() {
        return this._config.type
    }
    set type(t) {
        this._config.type = t
    }
    get data() {
        return this._config.data
    }
    set data(t) {
        this._config.data = Yh(t)
    }
    get options() {
        return this._config.options
    }
    set options(t) {
        this._config.options = t
    }
    get plugins() {
        return this._config.plugins
    }
    update() {
        const t = this._config;
        this.clearCache(),
        Uh(t)
    }
    clearCache() {
        this._scopeCache.clear(),
        this._resolverCache.clear()
    }
    datasetScopeKeys(t) {
        return wi(t, () => [[`datasets.${t}`, ""]])
    }
    datasetAnimationScopeKeys(t, n) {
        return wi(`${t}.transition.${n}`, () => [[`datasets.${t}.transitions.${n}`, `transitions.${n}`], [`datasets.${t}`, ""]])
    }
    datasetElementScopeKeys(t, n) {
        return wi(`${t}-${n}`, () => [[`datasets.${t}.elements.${n}`, `datasets.${t}`, `elements.${n}`, ""]])
    }
    pluginScopeKeys(t) {
        const n = t.id
          , r = this.type;
        return wi(`${r}-plugin-${n}`, () => [[`plugins.${n}`, ...t.additionalOptionScopes || []]])
    }
    _cachedScopes(t, n) {
        const r = this._scopeCache;
        let i = r.get(t);
        return (!i || n) && (i = new Map,
        r.set(t, i)),
        i
    }
    getOptionScopes(t, n, r) {
        const {options: i, type: a} = this
          , o = this._cachedScopes(t, r)
          , s = o.get(n);
        if (s)
            return s;
        const l = new Set;
        n.forEach(u => {
            t && (l.add(t),
            u.forEach(f => cr(l, t, f))),
            u.forEach(f => cr(l, i, f)),
            u.forEach(f => cr(l, Ze[a] || {}, f)),
            u.forEach(f => cr(l, st, f)),
            u.forEach(f => cr(l, Mo, f))
        }
        );
        const c = Array.from(l);
        return c.length === 0 && c.push(Object.create(null)),
        qh.has(n) && o.set(n, c),
        c
    }
    chartOptionScopes() {
        const {options: t, type: n} = this;
        return [t, Ze[n] || {}, st.datasets[n] || {}, {
            type: n
        }, st, Mo]
    }
    resolveNamedOptions(t, n, r, i=[""]) {
        const a = {
            $shared: !0
        }
          , {resolver: o, subPrefixes: s} = hc(this._resolverCache, t, i);
        let l = o;
        if (Wv(o, n)) {
            a.$shared = !1,
            r = Pe(r) ? r() : r;
            const c = this.createResolver(t, r, s);
            l = On(o, r, c)
        }
        for (const c of n)
            a[c] = l[c];
        return a
    }
    createResolver(t, n, r=[""], i) {
        const {resolver: a} = hc(this._resolverCache, t, r);
        return Z(n) ? On(a, n, void 0, i) : a
    }
}
function hc(e, t, n) {
    let r = e.get(t);
    r || (r = new Map,
    e.set(t, r));
    const i = n.join();
    let a = r.get(i);
    return a || (a = {
        resolver: Us(t, n),
        subPrefixes: n.filter(s => !s.toLowerCase().includes("hover"))
    },
    r.set(i, a)),
    a
}
const Fv = e => Z(e) && Object.getOwnPropertyNames(e).some(t => Pe(e[t]));
function Wv(e, t) {
    const {isScriptable: n, isIndexable: r} = vh(e);
    for (const i of t) {
        const a = n(i)
          , o = r(i)
          , s = (o || a) && e[i];
        if (a && (Pe(s) || Fv(s)) || o && ut(s))
            return !0
    }
    return !1
}
var Vv = "4.4.7";
const Hv = ["top", "bottom", "left", "right", "chartArea"];
function dc(e, t) {
    return e === "top" || e === "bottom" || Hv.indexOf(e) === -1 && t === "x"
}
function pc(e, t) {
    return function(n, r) {
        return n[e] === r[e] ? n[t] - r[t] : n[e] - r[e]
    }
}
function gc(e) {
    const t = e.chart
      , n = t.options.animation;
    t.notifyPlugins("afterRender"),
    rt(n && n.onComplete, [e], t)
}
function Kv(e) {
    const t = e.chart
      , n = t.options.animation;
    rt(n && n.onProgress, [e], t)
}
function Zh(e) {
    return Zs() && typeof e == "string" ? e = document.getElementById(e) : e && e.length && (e = e[0]),
    e && e.canvas && (e = e.canvas),
    e
}
const Ri = {}
  , mc = e => {
    const t = Zh(e);
    return Object.values(Ri).filter(n => n.canvas === t).pop()
}
;
function Xv(e, t, n) {
    const r = Object.keys(e);
    for (const i of r) {
        const a = +i;
        if (a >= t) {
            const o = e[i];
            delete e[i],
            (n > 0 || a > t) && (e[a + n] = o)
        }
    }
}
function Gv(e, t, n, r) {
    return !n || e.type === "mouseout" ? null : r ? t : e
}
function _i(e, t, n) {
    return e.options.clip ? e[n] : t[n]
}
function Uv(e, t) {
    const {xScale: n, yScale: r} = e;
    return n && r ? {
        left: _i(n, t, "left"),
        right: _i(n, t, "right"),
        top: _i(r, t, "top"),
        bottom: _i(r, t, "bottom")
    } : t
}
class Jh {
    static defaults = st;
    static instances = Ri;
    static overrides = Ze;
    static registry = Vt;
    static version = Vv;
    static getChart = mc;
    static register(...t) {
        Vt.add(...t),
        yc()
    }
    static unregister(...t) {
        Vt.remove(...t),
        yc()
    }
    constructor(t, n) {
        const r = this.config = new zv(n)
          , i = Zh(t)
          , a = mc(i);
        if (a)
            throw new Error("Canvas is already in use. Chart with ID '" + a.id + "' must be destroyed before the canvas with ID '" + a.canvas.id + "' can be reused.");
        const o = r.createResolver(r.chartOptionScopes(), this.getContext());
        this.platform = new (r.platform || Gh(i)),
        this.platform.updateConfig(r);
        const s = this.platform.acquireContext(i, o.aspectRatio)
          , l = s && s.canvas
          , c = l && l.height
          , u = l && l.width;
        if (this.id = rm(),
        this.ctx = s,
        this.canvas = l,
        this.width = u,
        this.height = c,
        this._options = o,
        this._aspectRatio = this.aspectRatio,
        this._layers = [],
        this._metasets = [],
        this._stacks = void 0,
        this.boxes = [],
        this.currentDevicePixelRatio = void 0,
        this.chartArea = void 0,
        this._active = [],
        this._lastEvent = void 0,
        this._listeners = {},
        this._responsiveListeners = void 0,
        this._sortedMetasets = [],
        this.scales = {},
        this._plugins = new Mv,
        this.$proxies = {},
        this._hiddenIndices = {},
        this.attached = !1,
        this._animationsDisabled = void 0,
        this.$context = void 0,
        this._doResize = bm(f => this.update(f), o.resizeDelay || 0),
        this._dataChanges = [],
        Ri[this.id] = this,
        !s || !l) {
            console.error("Failed to create chart: can't acquire context from the given item");
            return
        }
        qt.listen(this, "complete", gc),
        qt.listen(this, "progress", Kv),
        this._initialize(),
        this.attached && this.update()
    }
    get aspectRatio() {
        const {options: {aspectRatio: t, maintainAspectRatio: n}, width: r, height: i, _aspectRatio: a} = this;
        return J(t) ? n && a ? a : i ? r / i : null : t
    }
    get data() {
        return this.config.data
    }
    set data(t) {
        this.config.data = t
    }
    get options() {
        return this._options
    }
    set options(t) {
        this.config.options = t
    }
    get registry() {
        return Vt
    }
    _initialize() {
        return this.notifyPlugins("beforeInit"),
        this.options.responsive ? this.resize() : Nl(this, this.options.devicePixelRatio),
        this.bindEvents(),
        this.notifyPlugins("afterInit"),
        this
    }
    clear() {
        return Ll(this.canvas, this.ctx),
        this
    }
    stop() {
        return qt.stop(this),
        this
    }
    resize(t, n) {
        qt.running(this) ? this._resizeBeforeDraw = {
            width: t,
            height: n
        } : this._resize(t, n)
    }
    _resize(t, n) {
        const r = this.options
          , i = this.canvas
          , a = r.maintainAspectRatio && this.aspectRatio
          , o = this.platform.getMaximumSize(i, t, n, a)
          , s = r.devicePixelRatio || this.platform.getDevicePixelRatio()
          , l = this.width ? "resize" : "attach";
        this.width = o.width,
        this.height = o.height,
        this._aspectRatio = this.aspectRatio,
        Nl(this, s, !0) && (this.notifyPlugins("resize", {
            size: o
        }),
        rt(r.onResize, [this, o], this),
        this.attached && this._doResize(l) && this.render())
    }
    ensureScalesHaveIDs() {
        const n = this.options.scales || {};
        tt(n, (r, i) => {
            r.id = i
        }
        )
    }
    buildOrUpdateScales() {
        const t = this.options
          , n = t.scales
          , r = this.scales
          , i = Object.keys(r).reduce( (o, s) => (o[s] = !1,
        o), {});
        let a = [];
        n && (a = a.concat(Object.keys(n).map(o => {
            const s = n[o]
              , l = Co(o, s)
              , c = l === "r"
              , u = l === "x";
            return {
                options: s,
                dposition: c ? "chartArea" : u ? "bottom" : "left",
                dtype: c ? "radialLinear" : u ? "category" : "linear"
            }
        }
        ))),
        tt(a, o => {
            const s = o.options
              , l = s.id
              , c = Co(l, s)
              , u = Y(s.type, o.dtype);
            (s.position === void 0 || dc(s.position, c) !== dc(o.dposition)) && (s.position = o.dposition),
            i[l] = !0;
            let f = null;
            if (l in r && r[l].type === u)
                f = r[l];
            else {
                const h = Vt.getScale(u);
                f = new h({
                    id: l,
                    type: u,
                    ctx: this.ctx,
                    chart: this
                }),
                r[f.id] = f
            }
            f.init(s, t)
        }
        ),
        tt(i, (o, s) => {
            o || delete r[s]
        }
        ),
        tt(r, o => {
            wt.configure(this, o, o.options),
            wt.addBox(this, o)
        }
        )
    }
    _updateMetasets() {
        const t = this._metasets
          , n = this.data.datasets.length
          , r = t.length;
        if (t.sort( (i, a) => i.index - a.index),
        r > n) {
            for (let i = n; i < r; ++i)
                this._destroyDatasetMeta(i);
            t.splice(n, r - n)
        }
        this._sortedMetasets = t.slice(0).sort(pc("order", "index"))
    }
    _removeUnreferencedMetasets() {
        const {_metasets: t, data: {datasets: n}} = this;
        t.length > n.length && delete this._stacks,
        t.forEach( (r, i) => {
            n.filter(a => a === r._dataset).length === 0 && this._destroyDatasetMeta(i)
        }
        )
    }
    buildOrUpdateControllers() {
        const t = []
          , n = this.data.datasets;
        let r, i;
        for (this._removeUnreferencedMetasets(),
        r = 0,
        i = n.length; r < i; r++) {
            const a = n[r];
            let o = this.getDatasetMeta(r);
            const s = a.type || this.config.type;
            if (o.type && o.type !== s && (this._destroyDatasetMeta(r),
            o = this.getDatasetMeta(r)),
            o.type = s,
            o.indexAxis = a.indexAxis || jo(s, this.options),
            o.order = a.order || 0,
            o.index = r,
            o.label = "" + a.label,
            o.visible = this.isDatasetVisible(r),
            o.controller)
                o.controller.updateIndex(r),
                o.controller.linkScales();
            else {
                const l = Vt.getController(s)
                  , {datasetElementType: c, dataElementType: u} = st.datasets[s];
                Object.assign(l, {
                    dataElementType: Vt.getElement(u),
                    datasetElementType: c && Vt.getElement(c)
                }),
                o.controller = new l(this,r),
                t.push(o.controller)
            }
        }
        return this._updateMetasets(),
        t
    }
    _resetElements() {
        tt(this.data.datasets, (t, n) => {
            this.getDatasetMeta(n).controller.reset()
        }
        , this)
    }
    reset() {
        this._resetElements(),
        this.notifyPlugins("reset")
    }
    update(t) {
        const n = this.config;
        n.update();
        const r = this._options = n.createResolver(n.chartOptionScopes(), this.getContext())
          , i = this._animationsDisabled = !r.animation;
        if (this._updateScales(),
        this._checkEventBindings(),
        this._updateHiddenIndices(),
        this._plugins.invalidate(),
        this.notifyPlugins("beforeUpdate", {
            mode: t,
            cancelable: !0
        }) === !1)
            return;
        const a = this.buildOrUpdateControllers();
        this.notifyPlugins("beforeElementsUpdate");
        let o = 0;
        for (let c = 0, u = this.data.datasets.length; c < u; c++) {
            const {controller: f} = this.getDatasetMeta(c)
              , h = !i && a.indexOf(f) === -1;
            f.buildOrUpdateElements(h),
            o = Math.max(+f.getMaxOverflow(), o)
        }
        o = this._minPadding = r.layout.autoPadding ? o : 0,
        this._updateLayout(o),
        i || tt(a, c => {
            c.reset()
        }
        ),
        this._updateDatasets(t),
        this.notifyPlugins("afterUpdate", {
            mode: t
        }),
        this._layers.sort(pc("z", "_idx"));
        const {_active: s, _lastEvent: l} = this;
        l ? this._eventHandler(l, !0) : s.length && this._updateHoverStyles(s, s, !0),
        this.render()
    }
    _updateScales() {
        tt(this.scales, t => {
            wt.removeBox(this, t)
        }
        ),
        this.ensureScalesHaveIDs(),
        this.buildOrUpdateScales()
    }
    _checkEventBindings() {
        const t = this.options
          , n = new Set(Object.keys(this._listeners))
          , r = new Set(t.events);
        (!kl(n, r) || !!this._responsiveListeners !== t.responsive) && (this.unbindEvents(),
        this.bindEvents())
    }
    _updateHiddenIndices() {
        const {_hiddenIndices: t} = this
          , n = this._getUniformDataChanges() || [];
        for (const {method: r, start: i, count: a} of n) {
            const o = r === "_removeElements" ? -a : a;
            Xv(t, i, o)
        }
    }
    _getUniformDataChanges() {
        const t = this._dataChanges;
        if (!t || !t.length)
            return;
        this._dataChanges = [];
        const n = this.data.datasets.length
          , r = a => new Set(t.filter(o => o[0] === a).map( (o, s) => s + "," + o.splice(1).join(",")))
          , i = r(0);
        for (let a = 1; a < n; a++)
            if (!kl(i, r(a)))
                return;
        return Array.from(i).map(a => a.split(",")).map(a => ({
            method: a[1],
            start: +a[2],
            count: +a[3]
        }))
    }
    _updateLayout(t) {
        if (this.notifyPlugins("beforeLayout", {
            cancelable: !0
        }) === !1)
            return;
        wt.update(this, this.width, this.height, t);
        const n = this.chartArea
          , r = n.width <= 0 || n.height <= 0;
        this._layers = [],
        tt(this.boxes, i => {
            r && i.position === "chartArea" || (i.configure && i.configure(),
            this._layers.push(...i._layers()))
        }
        , this),
        this._layers.forEach( (i, a) => {
            i._idx = a
        }
        ),
        this.notifyPlugins("afterLayout")
    }
    _updateDatasets(t) {
        if (this.notifyPlugins("beforeDatasetsUpdate", {
            mode: t,
            cancelable: !0
        }) !== !1) {
            for (let n = 0, r = this.data.datasets.length; n < r; ++n)
                this.getDatasetMeta(n).controller.configure();
            for (let n = 0, r = this.data.datasets.length; n < r; ++n)
                this._updateDataset(n, Pe(t) ? t({
                    datasetIndex: n
                }) : t);
            this.notifyPlugins("afterDatasetsUpdate", {
                mode: t
            })
        }
    }
    _updateDataset(t, n) {
        const r = this.getDatasetMeta(t)
          , i = {
            meta: r,
            index: t,
            mode: n,
            cancelable: !0
        };
        this.notifyPlugins("beforeDatasetUpdate", i) !== !1 && (r.controller._update(n),
        i.cancelable = !1,
        this.notifyPlugins("afterDatasetUpdate", i))
    }
    render() {
        this.notifyPlugins("beforeRender", {
            cancelable: !0
        }) !== !1 && (qt.has(this) ? this.attached && !qt.running(this) && qt.start(this) : (this.draw(),
        gc({
            chart: this
        })))
    }
    draw() {
        let t;
        if (this._resizeBeforeDraw) {
            const {width: r, height: i} = this._resizeBeforeDraw;
            this._resizeBeforeDraw = null,
            this._resize(r, i)
        }
        if (this.clear(),
        this.width <= 0 || this.height <= 0 || this.notifyPlugins("beforeDraw", {
            cancelable: !0
        }) === !1)
            return;
        const n = this._layers;
        for (t = 0; t < n.length && n[t].z <= 0; ++t)
            n[t].draw(this.chartArea);
        for (this._drawDatasets(); t < n.length; ++t)
            n[t].draw(this.chartArea);
        this.notifyPlugins("afterDraw")
    }
    _getSortedDatasetMetas(t) {
        const n = this._sortedMetasets
          , r = [];
        let i, a;
        for (i = 0,
        a = n.length; i < a; ++i) {
            const o = n[i];
            (!t || o.visible) && r.push(o)
        }
        return r
    }
    getSortedVisibleDatasetMetas() {
        return this._getSortedDatasetMetas(!0)
    }
    _drawDatasets() {
        if (this.notifyPlugins("beforeDatasetsDraw", {
            cancelable: !0
        }) === !1)
            return;
        const t = this.getSortedVisibleDatasetMetas();
        for (let n = t.length - 1; n >= 0; --n)
            this._drawDataset(t[n]);
        this.notifyPlugins("afterDatasetsDraw")
    }
    _drawDataset(t) {
        const n = this.ctx
          , r = t._clip
          , i = !r.disabled
          , a = Uv(t, this.chartArea)
          , o = {
            meta: t,
            index: t.index,
            cancelable: !0
        };
        this.notifyPlugins("beforeDatasetDraw", o) !== !1 && (i && Ca(n, {
            left: r.left === !1 ? 0 : a.left - r.left,
            right: r.right === !1 ? this.width : a.right + r.right,
            top: r.top === !1 ? 0 : a.top - r.top,
            bottom: r.bottom === !1 ? this.height : a.bottom + r.bottom
        }),
        t.controller.draw(),
        i && Da(n),
        o.cancelable = !1,
        this.notifyPlugins("afterDatasetDraw", o))
    }
    isPointInArea(t) {
        return le(t, this.chartArea, this._minPadding)
    }
    getElementsAtEventForMode(t, n, r, i) {
        const a = zh.modes[n];
        return typeof a == "function" ? a(this, t, r, i) : []
    }
    getDatasetMeta(t) {
        const n = this.data.datasets[t]
          , r = this._metasets;
        let i = r.filter(a => a && a._dataset === n).pop();
        return i || (i = {
            type: null,
            data: [],
            dataset: null,
            controller: null,
            hidden: null,
            xAxisID: null,
            yAxisID: null,
            order: n && n.order || 0,
            index: t,
            _dataset: n,
            _parsed: [],
            _sorted: !1
        },
        r.push(i)),
        i
    }
    getContext() {
        return this.$context || (this.$context = Se(null, {
            chart: this,
            type: "chart"
        }))
    }
    getVisibleDatasetCount() {
        return this.getSortedVisibleDatasetMetas().length
    }
    isDatasetVisible(t) {
        const n = this.data.datasets[t];
        if (!n)
            return !1;
        const r = this.getDatasetMeta(t);
        return typeof r.hidden == "boolean" ? !r.hidden : !n.hidden
    }
    setDatasetVisibility(t, n) {
        const r = this.getDatasetMeta(t);
        r.hidden = !n
    }
    toggleDataVisibility(t) {
        this._hiddenIndices[t] = !this._hiddenIndices[t]
    }
    getDataVisibility(t) {
        return !this._hiddenIndices[t]
    }
    _updateVisibility(t, n, r) {
        const i = r ? "show" : "hide"
          , a = this.getDatasetMeta(t)
          , o = a.controller._resolveAnimations(void 0, i);
        Mr(n) ? (a.data[n].hidden = !r,
        this.update()) : (this.setDatasetVisibility(t, r),
        o.update(a, {
            visible: r
        }),
        this.update(s => s.datasetIndex === t ? i : void 0))
    }
    hide(t, n) {
        this._updateVisibility(t, n, !1)
    }
    show(t, n) {
        this._updateVisibility(t, n, !0)
    }
    _destroyDatasetMeta(t) {
        const n = this._metasets[t];
        n && n.controller && n.controller._destroy(),
        delete this._metasets[t]
    }
    _stop() {
        let t, n;
        for (this.stop(),
        qt.remove(this),
        t = 0,
        n = this.data.datasets.length; t < n; ++t)
            this._destroyDatasetMeta(t)
    }
    destroy() {
        this.notifyPlugins("beforeDestroy");
        const {canvas: t, ctx: n} = this;
        this._stop(),
        this.config.clearCache(),
        t && (this.unbindEvents(),
        Ll(t, n),
        this.platform.releaseContext(n),
        this.canvas = null,
        this.ctx = null),
        delete Ri[this.id],
        this.notifyPlugins("afterDestroy")
    }
    toBase64Image(...t) {
        return this.canvas.toDataURL(...t)
    }
    bindEvents() {
        this.bindUserEvents(),
        this.options.responsive ? this.bindResponsiveEvents() : this.attached = !0
    }
    bindUserEvents() {
        const t = this._listeners
          , n = this.platform
          , r = (a, o) => {
            n.addEventListener(this, a, o),
            t[a] = o
        }
          , i = (a, o, s) => {
            a.offsetX = o,
            a.offsetY = s,
            this._eventHandler(a)
        }
        ;
        tt(this.options.events, a => r(a, i))
    }
    bindResponsiveEvents() {
        this._responsiveListeners || (this._responsiveListeners = {});
        const t = this._responsiveListeners
          , n = this.platform
          , r = (l, c) => {
            n.addEventListener(this, l, c),
            t[l] = c
        }
          , i = (l, c) => {
            t[l] && (n.removeEventListener(this, l, c),
            delete t[l])
        }
          , a = (l, c) => {
            this.canvas && this.resize(l, c)
        }
        ;
        let o;
        const s = () => {
            i("attach", s),
            this.attached = !0,
            this.resize(),
            r("resize", a),
            r("detach", o)
        }
        ;
        o = () => {
            this.attached = !1,
            i("resize", a),
            this._stop(),
            this._resize(0, 0),
            r("attach", s)
        }
        ,
        n.isAttached(this.canvas) ? s() : o()
    }
    unbindEvents() {
        tt(this._listeners, (t, n) => {
            this.platform.removeEventListener(this, n, t)
        }
        ),
        this._listeners = {},
        tt(this._responsiveListeners, (t, n) => {
            this.platform.removeEventListener(this, n, t)
        }
        ),
        this._responsiveListeners = void 0
    }
    updateHoverStyle(t, n, r) {
        const i = r ? "set" : "remove";
        let a, o, s, l;
        for (n === "dataset" && (a = this.getDatasetMeta(t[0].datasetIndex),
        a.controller["_" + i + "DatasetHoverStyle"]()),
        s = 0,
        l = t.length; s < l; ++s) {
            o = t[s];
            const c = o && this.getDatasetMeta(o.datasetIndex).controller;
            c && c[i + "HoverStyle"](o.element, o.datasetIndex, o.index)
        }
    }
    getActiveElements() {
        return this._active || []
    }
    setActiveElements(t) {
        const n = this._active || []
          , r = t.map( ({datasetIndex: a, index: o}) => {
            const s = this.getDatasetMeta(a);
            if (!s)
                throw new Error("No dataset found at index " + a);
            return {
                datasetIndex: a,
                element: s.data[o],
                index: o
            }
        }
        );
        !zi(r, n) && (this._active = r,
        this._lastEvent = null,
        this._updateHoverStyles(r, n))
    }
    notifyPlugins(t, n, r) {
        return this._plugins.notify(this, t, n, r)
    }
    isPluginEnabled(t) {
        return this._plugins._cache.filter(n => n.plugin.id === t).length === 1
    }
    _updateHoverStyles(t, n, r) {
        const i = this.options.hover
          , a = (l, c) => l.filter(u => !c.some(f => u.datasetIndex === f.datasetIndex && u.index === f.index))
          , o = a(n, t)
          , s = r ? t : a(t, n);
        o.length && this.updateHoverStyle(o, i.mode, !1),
        s.length && i.mode && this.updateHoverStyle(s, i.mode, !0)
    }
    _eventHandler(t, n) {
        const r = {
            event: t,
            replay: n,
            cancelable: !0,
            inChartArea: this.isPointInArea(t)
        }
          , i = o => (o.options.events || this.options.events).includes(t.native.type);
        if (this.notifyPlugins("beforeEvent", r, i) === !1)
            return;
        const a = this._handleEvent(t, n, r.inChartArea);
        return r.cancelable = !1,
        this.notifyPlugins("afterEvent", r, i),
        (a || r.changed) && this.render(),
        this
    }
    _handleEvent(t, n, r) {
        const {_active: i=[], options: a} = this
          , o = n
          , s = this._getActiveElements(t, i, r, o)
          , l = cm(t)
          , c = Gv(t, this._lastEvent, r, l);
        r && (this._lastEvent = null,
        rt(a.onHover, [t, s, this], this),
        l && rt(a.onClick, [t, s, this], this));
        const u = !zi(s, i);
        return (u || n) && (this._active = s,
        this._updateHoverStyles(s, i, n)),
        this._lastEvent = c,
        u
    }
    _getActiveElements(t, n, r, i) {
        if (t.type === "mouseout")
            return [];
        if (!r)
            return n;
        const a = this.options.hover;
        return this.getElementsAtEventForMode(t, a.mode, a, i)
    }
}
function yc() {
    return tt(Jh.instances, e => e._plugins.invalidate())
}
function Yv(e, t, n) {
    const {startAngle: r, pixelMargin: i, x: a, y: o, outerRadius: s, innerRadius: l} = t;
    let c = i / s;
    e.beginPath(),
    e.arc(a, o, s, r - c, n + c),
    l > i ? (c = i / l,
    e.arc(a, o, l, n + c, r - c, !0)) : e.arc(a, o, i, n + pt, r - pt),
    e.closePath(),
    e.clip()
}
function qv(e) {
    return Gs(e, ["outerStart", "outerEnd", "innerStart", "innerEnd"])
}
function Zv(e, t, n, r) {
    const i = qv(e.options.borderRadius)
      , a = (n - t) / 2
      , o = Math.min(a, r * t / 2)
      , s = l => {
        const c = (n - Math.min(a, l)) * r / 2;
        return Ot(l, 0, Math.min(a, c))
    }
    ;
    return {
        outerStart: s(i.outerStart),
        outerEnd: s(i.outerEnd),
        innerStart: Ot(i.innerStart, 0, o),
        innerEnd: Ot(i.innerEnd, 0, o)
    }
}
function sn(e, t, n, r) {
    return {
        x: n + e * Math.cos(t),
        y: r + e * Math.sin(t)
    }
}
function Xi(e, t, n, r, i, a) {
    const {x: o, y: s, startAngle: l, pixelMargin: c, innerRadius: u} = t
      , f = Math.max(t.outerRadius + r + n - c, 0)
      , h = u > 0 ? u + r + n + c : 0;
    let d = 0;
    const p = i - l;
    if (r) {
        const T = u > 0 ? u - r : 0
          , j = f > 0 ? f - r : 0
          , $ = (T + j) / 2
          , R = $ !== 0 ? p * $ / ($ + r) : p;
        d = (p - R) / 2
    }
    const g = Math.max(.001, p * f - n / lt) / f
      , m = (p - g) / 2
      , v = l + m + d
      , b = i - m - d
      , {outerStart: x, outerEnd: w, innerStart: y, innerEnd: O} = Zv(t, h, f, b - v)
      , _ = f - x
      , P = f - w
      , S = v + x / _
      , k = b - w / P
      , E = h + y
      , M = h + O
      , C = v + y / E
      , I = b - O / M;
    if (e.beginPath(),
    a) {
        const T = (S + k) / 2;
        if (e.arc(o, s, f, S, T),
        e.arc(o, s, f, T, k),
        w > 0) {
            const B = sn(P, k, o, s);
            e.arc(B.x, B.y, w, k, b + pt)
        }
        const j = sn(M, b, o, s);
        if (e.lineTo(j.x, j.y),
        O > 0) {
            const B = sn(M, I, o, s);
            e.arc(B.x, B.y, O, b + pt, I + Math.PI)
        }
        const $ = (b - O / h + (v + y / h)) / 2;
        if (e.arc(o, s, h, b - O / h, $, !0),
        e.arc(o, s, h, $, v + y / h, !0),
        y > 0) {
            const B = sn(E, C, o, s);
            e.arc(B.x, B.y, y, C + Math.PI, v - pt)
        }
        const R = sn(_, v, o, s);
        if (e.lineTo(R.x, R.y),
        x > 0) {
            const B = sn(_, S, o, s);
            e.arc(B.x, B.y, x, v - pt, S)
        }
    } else {
        e.moveTo(o, s);
        const T = Math.cos(S) * f + o
          , j = Math.sin(S) * f + s;
        e.lineTo(T, j);
        const $ = Math.cos(k) * f + o
          , R = Math.sin(k) * f + s;
        e.lineTo($, R)
    }
    e.closePath()
}
function Jv(e, t, n, r, i) {
    const {fullCircles: a, startAngle: o, circumference: s} = t;
    let l = t.endAngle;
    if (a) {
        Xi(e, t, n, r, l, i);
        for (let c = 0; c < a; ++c)
            e.fill();
        isNaN(s) || (l = o + (s % ot || ot))
    }
    return Xi(e, t, n, r, l, i),
    e.fill(),
    l
}
function Qv(e, t, n, r, i) {
    const {fullCircles: a, startAngle: o, circumference: s, options: l} = t
      , {borderWidth: c, borderJoinStyle: u, borderDash: f, borderDashOffset: h} = l
      , d = l.borderAlign === "inner";
    if (!c)
        return;
    e.setLineDash(f || []),
    e.lineDashOffset = h,
    d ? (e.lineWidth = c * 2,
    e.lineJoin = u || "round") : (e.lineWidth = c,
    e.lineJoin = u || "bevel");
    let p = t.endAngle;
    if (a) {
        Xi(e, t, n, r, p, i);
        for (let g = 0; g < a; ++g)
            e.stroke();
        isNaN(s) || (p = o + (s % ot || ot))
    }
    d && Yv(e, t, p),
    a || (Xi(e, t, n, r, p, i),
    e.stroke())
}
class Qh extends te {
    static id = "arc";
    static defaults = {
        borderAlign: "center",
        borderColor: "#fff",
        borderDash: [],
        borderDashOffset: 0,
        borderJoinStyle: void 0,
        borderRadius: 0,
        borderWidth: 2,
        offset: 0,
        spacing: 0,
        angle: void 0,
        circular: !0
    };
    static defaultRoutes = {
        backgroundColor: "backgroundColor"
    };
    static descriptors = {
        _scriptable: !0,
        _indexable: t => t !== "borderDash"
    };
    circumference;
    endAngle;
    fullCircles;
    innerRadius;
    outerRadius;
    pixelMargin;
    startAngle;
    constructor(t) {
        super(),
        this.options = void 0,
        this.circumference = void 0,
        this.startAngle = void 0,
        this.endAngle = void 0,
        this.innerRadius = void 0,
        this.outerRadius = void 0,
        this.pixelMargin = 0,
        this.fullCircles = 0,
        t && Object.assign(this, t)
    }
    inRange(t, n, r) {
        const i = this.getProps(["x", "y"], r)
          , {angle: a, distance: o} = lh(i, {
            x: t,
            y: n
        })
          , {startAngle: s, endAngle: l, innerRadius: c, outerRadius: u, circumference: f} = this.getProps(["startAngle", "endAngle", "innerRadius", "outerRadius", "circumference"], r)
          , h = (this.options.spacing + this.options.borderWidth) / 2
          , d = Y(f, l - s)
          , p = Tr(a, s, l) && s !== l
          , g = d >= ot || p
          , m = oe(o, c + h, u + h);
        return g && m
    }
    getCenterPoint(t) {
        const {x: n, y: r, startAngle: i, endAngle: a, innerRadius: o, outerRadius: s} = this.getProps(["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius"], t)
          , {offset: l, spacing: c} = this.options
          , u = (i + a) / 2
          , f = (o + s + c + l) / 2;
        return {
            x: n + Math.cos(u) * f,
            y: r + Math.sin(u) * f
        }
    }
    tooltipPosition(t) {
        return this.getCenterPoint(t)
    }
    draw(t) {
        const {options: n, circumference: r} = this
          , i = (n.offset || 0) / 4
          , a = (n.spacing || 0) / 2
          , o = n.circular;
        if (this.pixelMargin = n.borderAlign === "inner" ? .33 : 0,
        this.fullCircles = r > ot ? Math.floor(r / ot) : 0,
        r === 0 || this.innerRadius < 0 || this.outerRadius < 0)
            return;
        t.save();
        const s = (this.startAngle + this.endAngle) / 2;
        t.translate(Math.cos(s) * i, Math.sin(s) * i);
        const l = 1 - Math.sin(Math.min(lt, r || 0))
          , c = i * l;
        t.fillStyle = n.backgroundColor,
        t.strokeStyle = n.borderColor,
        Jv(t, this, c, a, o),
        Qv(t, this, c, a, o),
        t.restore()
    }
}
function td(e, t, n=t) {
    e.lineCap = Y(n.borderCapStyle, t.borderCapStyle),
    e.setLineDash(Y(n.borderDash, t.borderDash)),
    e.lineDashOffset = Y(n.borderDashOffset, t.borderDashOffset),
    e.lineJoin = Y(n.borderJoinStyle, t.borderJoinStyle),
    e.lineWidth = Y(n.borderWidth, t.borderWidth),
    e.strokeStyle = Y(n.borderColor, t.borderColor)
}
function tb(e, t, n) {
    e.lineTo(n.x, n.y)
}
function eb(e) {
    return e.stepped ? jm : e.tension || e.cubicInterpolationMode === "monotone" ? Cm : tb
}
function ed(e, t, n={}) {
    const r = e.length
      , {start: i=0, end: a=r - 1} = n
      , {start: o, end: s} = t
      , l = Math.max(i, o)
      , c = Math.min(a, s)
      , u = i < o && a < o || i > s && a > s;
    return {
        count: r,
        start: l,
        loop: t.loop,
        ilen: c < l && !u ? r + c - l : c - l
    }
}
function nb(e, t, n, r) {
    const {points: i, options: a} = t
      , {count: o, start: s, loop: l, ilen: c} = ed(i, n, r)
      , u = eb(a);
    let {move: f=!0, reverse: h} = r || {}, d, p, g;
    for (d = 0; d <= c; ++d)
        p = i[(s + (h ? c - d : d)) % o],
        !p.skip && (f ? (e.moveTo(p.x, p.y),
        f = !1) : u(e, g, p, h, a.stepped),
        g = p);
    return l && (p = i[(s + (h ? c : 0)) % o],
    u(e, g, p, h, a.stepped)),
    !!l
}
function rb(e, t, n, r) {
    const i = t.points
      , {count: a, start: o, ilen: s} = ed(i, n, r)
      , {move: l=!0, reverse: c} = r || {};
    let u = 0, f = 0, h, d, p, g, m, v;
    const b = w => (o + (c ? s - w : w)) % a
      , x = () => {
        g !== m && (e.lineTo(u, m),
        e.lineTo(u, g),
        e.lineTo(u, v))
    }
    ;
    for (l && (d = i[b(0)],
    e.moveTo(d.x, d.y)),
    h = 0; h <= s; ++h) {
        if (d = i[b(h)],
        d.skip)
            continue;
        const w = d.x
          , y = d.y
          , O = w | 0;
        O === p ? (y < g ? g = y : y > m && (m = y),
        u = (f * u + w) / ++f) : (x(),
        e.lineTo(w, y),
        p = O,
        f = 0,
        g = m = y),
        v = y
    }
    x()
}
function Do(e) {
    const t = e.options
      , n = t.borderDash && t.borderDash.length;
    return !e._decimated && !e._loop && !t.tension && t.cubicInterpolationMode !== "monotone" && !t.stepped && !n ? rb : nb
}
function ib(e) {
    return e.stepped ? uy : e.tension || e.cubicInterpolationMode === "monotone" ? fy : We
}
function ab(e, t, n, r) {
    let i = t._path;
    i || (i = t._path = new Path2D,
    t.path(i, n, r) && i.closePath()),
    td(e, t.options),
    e.stroke(i)
}
function ob(e, t, n, r) {
    const {segments: i, options: a} = t
      , o = Do(t);
    for (const s of i)
        td(e, a, s.style),
        e.beginPath(),
        o(e, t, s, {
            start: n,
            end: n + r - 1
        }) && e.closePath(),
        e.stroke()
}
const sb = typeof Path2D == "function";
function lb(e, t, n, r) {
    sb && !t.options.segment ? ab(e, t, n, r) : ob(e, t, n, r)
}
class ui extends te {
    static id = "line";
    static defaults = {
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0,
        borderJoinStyle: "miter",
        borderWidth: 3,
        capBezierPoints: !0,
        cubicInterpolationMode: "default",
        fill: !1,
        spanGaps: !1,
        stepped: !1,
        tension: 0
    };
    static defaultRoutes = {
        backgroundColor: "backgroundColor",
        borderColor: "borderColor"
    };
    static descriptors = {
        _scriptable: !0,
        _indexable: t => t !== "borderDash" && t !== "fill"
    };
    constructor(t) {
        super(),
        this.animated = !0,
        this.options = void 0,
        this._chart = void 0,
        this._loop = void 0,
        this._fullLoop = void 0,
        this._path = void 0,
        this._points = void 0,
        this._segments = void 0,
        this._decimated = !1,
        this._pointsUpdated = !1,
        this._datasetIndex = void 0,
        t && Object.assign(this, t)
    }
    updateControlPoints(t, n) {
        const r = this.options;
        if ((r.tension || r.cubicInterpolationMode === "monotone") && !r.stepped && !this._pointsUpdated) {
            const i = r.spanGaps ? this._loop : this._fullLoop;
            ny(this._points, r, t, i, n),
            this._pointsUpdated = !0
        }
    }
    set points(t) {
        this._points = t,
        delete this._segments,
        delete this._path,
        this._pointsUpdated = !1
    }
    get points() {
        return this._points
    }
    get segments() {
        return this._segments || (this._segments = yy(this, this.options.segment))
    }
    first() {
        const t = this.segments
          , n = this.points;
        return t.length && n[t[0].start]
    }
    last() {
        const t = this.segments
          , n = this.points
          , r = t.length;
        return r && n[t[r - 1].end]
    }
    interpolate(t, n) {
        const r = this.options
          , i = t[n]
          , a = this.points
          , o = Eh(this, {
            property: n,
            start: i,
            end: i
        });
        if (!o.length)
            return;
        const s = []
          , l = ib(r);
        let c, u;
        for (c = 0,
        u = o.length; c < u; ++c) {
            const {start: f, end: h} = o[c]
              , d = a[f]
              , p = a[h];
            if (d === p) {
                s.push(d);
                continue
            }
            const g = Math.abs((i - d[n]) / (p[n] - d[n]))
              , m = l(d, p, g, r.stepped);
            m[n] = t[n],
            s.push(m)
        }
        return s.length === 1 ? s[0] : s
    }
    pathSegment(t, n, r) {
        return Do(this)(t, this, n, r)
    }
    path(t, n, r) {
        const i = this.segments
          , a = Do(this);
        let o = this._loop;
        n = n || 0,
        r = r || this.points.length - n;
        for (const s of i)
            o &= a(t, this, s, {
                start: n,
                end: n + r - 1
            });
        return !!o
    }
    draw(t, n, r, i) {
        const a = this.options || {};
        (this.points || []).length && a.borderWidth && (t.save(),
        lb(t, this, r, i),
        t.restore()),
        this.animated && (this._pointsUpdated = !1,
        this._path = void 0)
    }
}
function vc(e, t, n, r) {
    const i = e.options
      , {[n]: a} = e.getProps([n], r);
    return Math.abs(t - a) < i.radius + i.hitRadius
}
class nd extends te {
    static id = "point";
    parsed;
    skip;
    stop;
    static defaults = {
        borderWidth: 1,
        hitRadius: 1,
        hoverBorderWidth: 1,
        hoverRadius: 4,
        pointStyle: "circle",
        radius: 3,
        rotation: 0
    };
    static defaultRoutes = {
        backgroundColor: "backgroundColor",
        borderColor: "borderColor"
    };
    constructor(t) {
        super(),
        this.options = void 0,
        this.parsed = void 0,
        this.skip = void 0,
        this.stop = void 0,
        t && Object.assign(this, t)
    }
    inRange(t, n, r) {
        const i = this.options
          , {x: a, y: o} = this.getProps(["x", "y"], r);
        return Math.pow(t - a, 2) + Math.pow(n - o, 2) < Math.pow(i.hitRadius + i.radius, 2)
    }
    inXRange(t, n) {
        return vc(this, t, "x", n)
    }
    inYRange(t, n) {
        return vc(this, t, "y", n)
    }
    getCenterPoint(t) {
        const {x: n, y: r} = this.getProps(["x", "y"], t);
        return {
            x: n,
            y: r
        }
    }
    size(t) {
        t = t || this.options || {};
        let n = t.radius || 0;
        n = Math.max(n, n && t.hoverRadius || 0);
        const r = n && t.borderWidth || 0;
        return (n + r) * 2
    }
    draw(t, n) {
        const r = this.options;
        this.skip || r.radius < .1 || !le(this, n, this.size(r) / 2) || (t.strokeStyle = r.borderColor,
        t.lineWidth = r.borderWidth,
        t.fillStyle = r.backgroundColor,
        To(t, r, this.x, this.y))
    }
    getRange() {
        const t = this.options || {};
        return t.radius + t.hitRadius
    }
}
function rd(e, t) {
    const {x: n, y: r, base: i, width: a, height: o} = e.getProps(["x", "y", "base", "width", "height"], t);
    let s, l, c, u, f;
    return e.horizontal ? (f = o / 2,
    s = Math.min(n, i),
    l = Math.max(n, i),
    c = r - f,
    u = r + f) : (f = a / 2,
    s = n - f,
    l = n + f,
    c = Math.min(r, i),
    u = Math.max(r, i)),
    {
        left: s,
        top: c,
        right: l,
        bottom: u
    }
}
function ve(e, t, n, r) {
    return e ? 0 : Ot(t, n, r)
}
function cb(e, t, n) {
    const r = e.options.borderWidth
      , i = e.borderSkipped
      , a = yh(r);
    return {
        t: ve(i.top, a.top, 0, n),
        r: ve(i.right, a.right, 0, t),
        b: ve(i.bottom, a.bottom, 0, n),
        l: ve(i.left, a.left, 0, t)
    }
}
function ub(e, t, n) {
    const {enableBorderRadius: r} = e.getProps(["enableBorderRadius"])
      , i = e.options.borderRadius
      , a = Ge(i)
      , o = Math.min(t, n)
      , s = e.borderSkipped
      , l = r || Z(i);
    return {
        topLeft: ve(!l || s.top || s.left, a.topLeft, 0, o),
        topRight: ve(!l || s.top || s.right, a.topRight, 0, o),
        bottomLeft: ve(!l || s.bottom || s.left, a.bottomLeft, 0, o),
        bottomRight: ve(!l || s.bottom || s.right, a.bottomRight, 0, o)
    }
}
function fb(e) {
    const t = rd(e)
      , n = t.right - t.left
      , r = t.bottom - t.top
      , i = cb(e, n / 2, r / 2)
      , a = ub(e, n / 2, r / 2);
    return {
        outer: {
            x: t.left,
            y: t.top,
            w: n,
            h: r,
            radius: a
        },
        inner: {
            x: t.left + i.l,
            y: t.top + i.t,
            w: n - i.l - i.r,
            h: r - i.t - i.b,
            radius: {
                topLeft: Math.max(0, a.topLeft - Math.max(i.t, i.l)),
                topRight: Math.max(0, a.topRight - Math.max(i.t, i.r)),
                bottomLeft: Math.max(0, a.bottomLeft - Math.max(i.b, i.l)),
                bottomRight: Math.max(0, a.bottomRight - Math.max(i.b, i.r))
            }
        }
    }
}
function go(e, t, n, r) {
    const i = t === null
      , a = n === null
      , s = e && !(i && a) && rd(e, r);
    return s && (i || oe(t, s.left, s.right)) && (a || oe(n, s.top, s.bottom))
}
function hb(e) {
    return e.topLeft || e.topRight || e.bottomLeft || e.bottomRight
}
function db(e, t) {
    e.rect(t.x, t.y, t.w, t.h)
}
function mo(e, t, n={}) {
    const r = e.x !== n.x ? -t : 0
      , i = e.y !== n.y ? -t : 0
      , a = (e.x + e.w !== n.x + n.w ? t : 0) - r
      , o = (e.y + e.h !== n.y + n.h ? t : 0) - i;
    return {
        x: e.x + r,
        y: e.y + i,
        w: e.w + a,
        h: e.h + o,
        radius: e.radius
    }
}
class id extends te {
    static id = "bar";
    static defaults = {
        borderSkipped: "start",
        borderWidth: 0,
        borderRadius: 0,
        inflateAmount: "auto",
        pointStyle: void 0
    };
    static defaultRoutes = {
        backgroundColor: "backgroundColor",
        borderColor: "borderColor"
    };
    constructor(t) {
        super(),
        this.options = void 0,
        this.horizontal = void 0,
        this.base = void 0,
        this.width = void 0,
        this.height = void 0,
        this.inflateAmount = void 0,
        t && Object.assign(this, t)
    }
    draw(t) {
        const {inflateAmount: n, options: {borderColor: r, backgroundColor: i}} = this
          , {inner: a, outer: o} = fb(this)
          , s = hb(o.radius) ? jr : db;
        t.save(),
        (o.w !== a.w || o.h !== a.h) && (t.beginPath(),
        s(t, mo(o, n, a)),
        t.clip(),
        s(t, mo(a, -n, o)),
        t.fillStyle = r,
        t.fill("evenodd")),
        t.beginPath(),
        s(t, mo(a, n)),
        t.fillStyle = i,
        t.fill(),
        t.restore()
    }
    inRange(t, n, r) {
        return go(this, t, n, r)
    }
    inXRange(t, n) {
        return go(this, t, null, n)
    }
    inYRange(t, n) {
        return go(this, null, t, n)
    }
    getCenterPoint(t) {
        const {x: n, y: r, base: i, horizontal: a} = this.getProps(["x", "y", "base", "horizontal"], t);
        return {
            x: a ? (n + i) / 2 : n,
            y: a ? r : (r + i) / 2
        }
    }
    getRange(t) {
        return t === "x" ? this.width / 2 : this.height / 2
    }
}
var ad = Object.freeze({
    __proto__: null,
    ArcElement: Qh,
    BarElement: id,
    LineElement: ui,
    PointElement: nd
});
const Io = ["rgb(54, 162, 235)", "rgb(255, 99, 132)", "rgb(255, 159, 64)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(153, 102, 255)", "rgb(201, 203, 207)"]
  , bc = Io.map(e => e.replace("rgb(", "rgba(").replace(")", ", 0.5)"));
function od(e) {
    return Io[e % Io.length]
}
function sd(e) {
    return bc[e % bc.length]
}
function pb(e, t) {
    return e.borderColor = od(t),
    e.backgroundColor = sd(t),
    ++t
}
function gb(e, t) {
    return e.backgroundColor = e.data.map( () => od(t++)),
    t
}
function mb(e, t) {
    return e.backgroundColor = e.data.map( () => sd(t++)),
    t
}
function yb(e) {
    let t = 0;
    return (n, r) => {
        const i = e.getDatasetMeta(r).controller;
        i instanceof $a ? t = gb(n, t) : i instanceof tl ? t = mb(n, t) : i && (t = pb(n, t))
    }
}
function xc(e) {
    let t;
    for (t in e)
        if (e[t].borderColor || e[t].backgroundColor)
            return !0;
    return !1
}
function vb(e) {
    return e && (e.borderColor || e.backgroundColor)
}
function bb() {
    return st.borderColor !== "rgba(0,0,0,0.1)" || st.backgroundColor !== "rgba(0,0,0,0.1)"
}
var ld = {
    id: "colors",
    defaults: {
        enabled: !0,
        forceOverride: !1
    },
    beforeLayout(e, t, n) {
        if (!n.enabled)
            return;
        const {data: {datasets: r}, options: i} = e.config
          , {elements: a} = i
          , o = xc(r) || vb(i) || a && xc(a) || bb();
        if (!n.forceOverride && o)
            return;
        const s = yb(e);
        r.forEach(s)
    }
};
function xb(e, t, n, r, i) {
    const a = i.samples || r;
    if (a >= n)
        return e.slice(t, t + n);
    const o = []
      , s = (n - 2) / (a - 2);
    let l = 0;
    const c = t + n - 1;
    let u = t, f, h, d, p, g;
    for (o[l++] = e[u],
    f = 0; f < a - 2; f++) {
        let m = 0, v = 0, b;
        const x = Math.floor((f + 1) * s) + 1 + t
          , w = Math.min(Math.floor((f + 2) * s) + 1, n) + t
          , y = w - x;
        for (b = x; b < w; b++)
            m += e[b].x,
            v += e[b].y;
        m /= y,
        v /= y;
        const O = Math.floor(f * s) + 1 + t
          , _ = Math.min(Math.floor((f + 1) * s) + 1, n) + t
          , {x: P, y: S} = e[u];
        for (d = p = -1,
        b = O; b < _; b++)
            p = .5 * Math.abs((P - m) * (e[b].y - S) - (P - e[b].x) * (v - S)),
            p > d && (d = p,
            h = e[b],
            g = b);
        o[l++] = h,
        u = g
    }
    return o[l++] = e[c],
    o
}
function Ob(e, t, n, r) {
    let i = 0, a = 0, o, s, l, c, u, f, h, d, p, g;
    const m = []
      , v = t + n - 1
      , b = e[t].x
      , w = e[v].x - b;
    for (o = t; o < t + n; ++o) {
        s = e[o],
        l = (s.x - b) / w * r,
        c = s.y;
        const y = l | 0;
        if (y === u)
            c < p ? (p = c,
            f = o) : c > g && (g = c,
            h = o),
            i = (a * i + s.x) / ++a;
        else {
            const O = o - 1;
            if (!J(f) && !J(h)) {
                const _ = Math.min(f, h)
                  , P = Math.max(f, h);
                _ !== d && _ !== O && m.push({
                    ...e[_],
                    x: i
                }),
                P !== d && P !== O && m.push({
                    ...e[P],
                    x: i
                })
            }
            o > 0 && O !== d && m.push(e[O]),
            m.push(s),
            u = y,
            a = 0,
            p = g = c,
            f = h = d = o
        }
    }
    return m
}
function cd(e) {
    if (e._decimated) {
        const t = e._data;
        delete e._decimated,
        delete e._data,
        Object.defineProperty(e, "data", {
            configurable: !0,
            enumerable: !0,
            writable: !0,
            value: t
        })
    }
}
function Oc(e) {
    e.data.datasets.forEach(t => {
        cd(t)
    }
    )
}
function wb(e, t) {
    const n = t.length;
    let r = 0, i;
    const {iScale: a} = e
      , {min: o, max: s, minDefined: l, maxDefined: c} = a.getUserBounds();
    return l && (r = Ot(se(t, a.axis, o).lo, 0, n - 1)),
    c ? i = Ot(se(t, a.axis, s).hi + 1, r, n) - r : i = n - r,
    {
        start: r,
        count: i
    }
}
var ud = {
    id: "decimation",
    defaults: {
        algorithm: "min-max",
        enabled: !1
    },
    beforeElementsUpdate: (e, t, n) => {
        if (!n.enabled) {
            Oc(e);
            return
        }
        const r = e.width;
        e.data.datasets.forEach( (i, a) => {
            const {_data: o, indexAxis: s} = i
              , l = e.getDatasetMeta(a)
              , c = o || i.data;
            if (pr([s, e.options.indexAxis]) === "y" || !l.controller.supportsDecimation)
                return;
            const u = e.scales[l.xAxisID];
            if (u.type !== "linear" && u.type !== "time" || e.options.parsing)
                return;
            let {start: f, count: h} = wb(l, c);
            const d = n.threshold || 4 * r;
            if (h <= d) {
                cd(i);
                return
            }
            J(o) && (i._data = c,
            delete i.data,
            Object.defineProperty(i, "data", {
                configurable: !0,
                enumerable: !0,
                get: function() {
                    return this._decimated
                },
                set: function(g) {
                    this._data = g
                }
            }));
            let p;
            switch (n.algorithm) {
            case "lttb":
                p = xb(c, f, h, r, n);
                break;
            case "min-max":
                p = Ob(c, f, h, r);
                break;
            default:
                throw new Error(`Unsupported decimation algorithm '${n.algorithm}'`)
            }
            i._decimated = p
        }
        )
    }
    ,
    destroy(e) {
        Oc(e)
    }
};
function _b(e, t, n) {
    const r = e.segments
      , i = e.points
      , a = t.points
      , o = [];
    for (const s of r) {
        let {start: l, end: c} = s;
        c = rl(l, c, i);
        const u = $o(n, i[l], i[c], s.loop);
        if (!t.segments) {
            o.push({
                source: s,
                target: u,
                start: i[l],
                end: i[c]
            });
            continue
        }
        const f = Eh(t, u);
        for (const h of f) {
            const d = $o(n, a[h.start], a[h.end], h.loop)
              , p = kh(s, i, d);
            for (const g of p)
                o.push({
                    source: g,
                    target: h,
                    start: {
                        [n]: wc(u, d, "start", Math.max)
                    },
                    end: {
                        [n]: wc(u, d, "end", Math.min)
                    }
                })
        }
    }
    return o
}
function $o(e, t, n, r) {
    if (r)
        return;
    let i = t[e]
      , a = n[e];
    return e === "angle" && (i = Rt(i),
    a = Rt(a)),
    {
        property: e,
        start: i,
        end: a
    }
}
function Pb(e, t) {
    const {x: n=null, y: r=null} = e || {}
      , i = t.points
      , a = [];
    return t.segments.forEach( ({start: o, end: s}) => {
        s = rl(o, s, i);
        const l = i[o]
          , c = i[s];
        r !== null ? (a.push({
            x: l.x,
            y: r
        }),
        a.push({
            x: c.x,
            y: r
        })) : n !== null && (a.push({
            x: n,
            y: l.y
        }),
        a.push({
            x: n,
            y: c.y
        }))
    }
    ),
    a
}
function rl(e, t, n) {
    for (; t > e; t--) {
        const r = n[t];
        if (!isNaN(r.x) && !isNaN(r.y))
            break
    }
    return t
}
function wc(e, t, n, r) {
    return e && t ? r(e[n], t[n]) : e ? e[n] : t ? t[n] : 0
}
function fd(e, t) {
    let n = []
      , r = !1;
    return ut(e) ? (r = !0,
    n = e) : n = Pb(e, t),
    n.length ? new ui({
        points: n,
        options: {
            tension: 0
        },
        _loop: r,
        _fullLoop: r
    }) : null
}
function _c(e) {
    return e && e.fill !== !1
}
function Ab(e, t, n) {
    let i = e[t].fill;
    const a = [t];
    let o;
    if (!n)
        return i;
    for (; i !== !1 && a.indexOf(i) === -1; ) {
        if (!dt(i))
            return i;
        if (o = e[i],
        !o)
            return !1;
        if (o.visible)
            return i;
        a.push(i),
        i = o.fill
    }
    return !1
}
function Sb(e, t, n) {
    const r = Tb(e);
    if (Z(r))
        return isNaN(r.value) ? !1 : r;
    let i = parseFloat(r);
    return dt(i) && Math.floor(i) === i ? kb(r[0], t, i, n) : ["origin", "start", "end", "stack", "shape"].indexOf(r) >= 0 && r
}
function kb(e, t, n, r) {
    return (e === "-" || e === "+") && (n = t + n),
    n === t || n < 0 || n >= r ? !1 : n
}
function Eb(e, t) {
    let n = null;
    return e === "start" ? n = t.bottom : e === "end" ? n = t.top : Z(e) ? n = t.getPixelForValue(e.value) : t.getBasePixel && (n = t.getBasePixel()),
    n
}
function Mb(e, t, n) {
    let r;
    return e === "start" ? r = n : e === "end" ? r = t.options.reverse ? t.min : t.max : Z(e) ? r = e.value : r = t.getBaseValue(),
    r
}
function Tb(e) {
    const t = e.options
      , n = t.fill;
    let r = Y(n && n.target, n);
    return r === void 0 && (r = !!t.backgroundColor),
    r === !1 || r === null ? !1 : r === !0 ? "origin" : r
}
function jb(e) {
    const {scale: t, index: n, line: r} = e
      , i = []
      , a = r.segments
      , o = r.points
      , s = Cb(t, n);
    s.push(fd({
        x: null,
        y: t.bottom
    }, r));
    for (let l = 0; l < a.length; l++) {
        const c = a[l];
        for (let u = c.start; u <= c.end; u++)
            Db(i, o[u], s)
    }
    return new ui({
        points: i,
        options: {}
    })
}
function Cb(e, t) {
    const n = []
      , r = e.getMatchingVisibleMetas("line");
    for (let i = 0; i < r.length; i++) {
        const a = r[i];
        if (a.index === t)
            break;
        a.hidden || n.unshift(a.dataset)
    }
    return n
}
function Db(e, t, n) {
    const r = [];
    for (let i = 0; i < n.length; i++) {
        const a = n[i]
          , {first: o, last: s, point: l} = Ib(a, t, "x");
        if (!(!l || o && s)) {
            if (o)
                r.unshift(l);
            else if (e.push(l),
            !s)
                break
        }
    }
    e.push(...r)
}
function Ib(e, t, n) {
    const r = e.interpolate(t, n);
    if (!r)
        return {};
    const i = r[n]
      , a = e.segments
      , o = e.points;
    let s = !1
      , l = !1;
    for (let c = 0; c < a.length; c++) {
        const u = a[c]
          , f = o[u.start][n]
          , h = o[u.end][n];
        if (oe(i, f, h)) {
            s = i === f,
            l = i === h;
            break
        }
    }
    return {
        first: s,
        last: l,
        point: r
    }
}
class hd {
    constructor(t) {
        this.x = t.x,
        this.y = t.y,
        this.radius = t.radius
    }
    pathSegment(t, n, r) {
        const {x: i, y: a, radius: o} = this;
        return n = n || {
            start: 0,
            end: ot
        },
        t.arc(i, a, o, n.end, n.start, !0),
        !r.bounds
    }
    interpolate(t) {
        const {x: n, y: r, radius: i} = this
          , a = t.angle;
        return {
            x: n + Math.cos(a) * i,
            y: r + Math.sin(a) * i,
            angle: a
        }
    }
}
function $b(e) {
    const {chart: t, fill: n, line: r} = e;
    if (dt(n))
        return Lb(t, n);
    if (n === "stack")
        return jb(e);
    if (n === "shape")
        return !0;
    const i = Rb(e);
    return i instanceof hd ? i : fd(i, r)
}
function Lb(e, t) {
    const n = e.getDatasetMeta(t);
    return n && e.isDatasetVisible(t) ? n.dataset : null
}
function Rb(e) {
    return (e.scale || {}).getPointPositionForValue ? Nb(e) : Bb(e)
}
function Bb(e) {
    const {scale: t={}, fill: n} = e
      , r = Eb(n, t);
    if (dt(r)) {
        const i = t.isHorizontal();
        return {
            x: i ? r : null,
            y: i ? null : r
        }
    }
    return null
}
function Nb(e) {
    const {scale: t, fill: n} = e
      , r = t.options
      , i = t.getLabels().length
      , a = r.reverse ? t.max : t.min
      , o = Mb(n, t, a)
      , s = [];
    if (r.grid.circular) {
        const l = t.getPointPositionForValue(0, a);
        return new hd({
            x: l.x,
            y: l.y,
            radius: t.getDistanceFromCenterForValue(o)
        })
    }
    for (let l = 0; l < i; ++l)
        s.push(t.getPointPositionForValue(l, o));
    return s
}
function yo(e, t, n) {
    const r = $b(t)
      , {line: i, scale: a, axis: o} = t
      , s = i.options
      , l = s.fill
      , c = s.backgroundColor
      , {above: u=c, below: f=c} = l || {};
    r && i.points.length && (Ca(e, n),
    zb(e, {
        line: i,
        target: r,
        above: u,
        below: f,
        area: n,
        scale: a,
        axis: o
    }),
    Da(e))
}
function zb(e, t) {
    const {line: n, target: r, above: i, below: a, area: o, scale: s} = t
      , l = n._loop ? "angle" : t.axis;
    e.save(),
    l === "x" && a !== i && (Pc(e, r, o.top),
    Ac(e, {
        line: n,
        target: r,
        color: i,
        scale: s,
        property: l
    }),
    e.restore(),
    e.save(),
    Pc(e, r, o.bottom)),
    Ac(e, {
        line: n,
        target: r,
        color: a,
        scale: s,
        property: l
    }),
    e.restore()
}
function Pc(e, t, n) {
    const {segments: r, points: i} = t;
    let a = !0
      , o = !1;
    e.beginPath();
    for (const s of r) {
        const {start: l, end: c} = s
          , u = i[l]
          , f = i[rl(l, c, i)];
        a ? (e.moveTo(u.x, u.y),
        a = !1) : (e.lineTo(u.x, n),
        e.lineTo(u.x, u.y)),
        o = !!t.pathSegment(e, s, {
            move: o
        }),
        o ? e.closePath() : e.lineTo(f.x, n)
    }
    e.lineTo(t.first().x, n),
    e.closePath(),
    e.clip()
}
function Ac(e, t) {
    const {line: n, target: r, property: i, color: a, scale: o} = t
      , s = _b(n, r, i);
    for (const {source: l, target: c, start: u, end: f} of s) {
        const {style: {backgroundColor: h=a}={}} = l
          , d = r !== !0;
        e.save(),
        e.fillStyle = h,
        Fb(e, o, d && $o(i, u, f)),
        e.beginPath();
        const p = !!n.pathSegment(e, l);
        let g;
        if (d) {
            p ? e.closePath() : Sc(e, r, f, i);
            const m = !!r.pathSegment(e, c, {
                move: p,
                reverse: !0
            });
            g = p && m,
            g || Sc(e, r, u, i)
        }
        e.closePath(),
        e.fill(g ? "evenodd" : "nonzero"),
        e.restore()
    }
}
function Fb(e, t, n) {
    const {top: r, bottom: i} = t.chart.chartArea
      , {property: a, start: o, end: s} = n || {};
    a === "x" && (e.beginPath(),
    e.rect(o, r, s - o, i - r),
    e.clip())
}
function Sc(e, t, n, r) {
    const i = t.interpolate(n, r);
    i && e.lineTo(i.x, i.y)
}
var dd = {
    id: "filler",
    afterDatasetsUpdate(e, t, n) {
        const r = (e.data.datasets || []).length
          , i = [];
        let a, o, s, l;
        for (o = 0; o < r; ++o)
            a = e.getDatasetMeta(o),
            s = a.dataset,
            l = null,
            s && s.options && s instanceof ui && (l = {
                visible: e.isDatasetVisible(o),
                index: o,
                fill: Sb(s, o, r),
                chart: e,
                axis: a.controller.options.indexAxis,
                scale: a.vScale,
                line: s
            }),
            a.$filler = l,
            i.push(l);
        for (o = 0; o < r; ++o)
            l = i[o],
            !(!l || l.fill === !1) && (l.fill = Ab(i, o, n.propagate))
    },
    beforeDraw(e, t, n) {
        const r = n.drawTime === "beforeDraw"
          , i = e.getSortedVisibleDatasetMetas()
          , a = e.chartArea;
        for (let o = i.length - 1; o >= 0; --o) {
            const s = i[o].$filler;
            s && (s.line.updateControlPoints(a, s.axis),
            r && s.fill && yo(e.ctx, s, a))
        }
    },
    beforeDatasetsDraw(e, t, n) {
        if (n.drawTime !== "beforeDatasetsDraw")
            return;
        const r = e.getSortedVisibleDatasetMetas();
        for (let i = r.length - 1; i >= 0; --i) {
            const a = r[i].$filler;
            _c(a) && yo(e.ctx, a, e.chartArea)
        }
    },
    beforeDatasetDraw(e, t, n) {
        const r = t.meta.$filler;
        !_c(r) || n.drawTime !== "beforeDatasetDraw" || yo(e.ctx, r, e.chartArea)
    },
    defaults: {
        propagate: !0,
        drawTime: "beforeDatasetDraw"
    }
};
const kc = (e, t) => {
    let {boxHeight: n=t, boxWidth: r=t} = e;
    return e.usePointStyle && (n = Math.min(n, t),
    r = e.pointStyleWidth || Math.min(r, t)),
    {
        boxWidth: r,
        boxHeight: n,
        itemHeight: Math.max(t, n)
    }
}
  , Wb = (e, t) => e !== null && t !== null && e.datasetIndex === t.datasetIndex && e.index === t.index;
let Ec = class extends te {
    constructor(t) {
        super(),
        this._added = !1,
        this.legendHitBoxes = [],
        this._hoveredItem = null,
        this.doughnutMode = !1,
        this.chart = t.chart,
        this.options = t.options,
        this.ctx = t.ctx,
        this.legendItems = void 0,
        this.columnSizes = void 0,
        this.lineWidths = void 0,
        this.maxHeight = void 0,
        this.maxWidth = void 0,
        this.top = void 0,
        this.bottom = void 0,
        this.left = void 0,
        this.right = void 0,
        this.height = void 0,
        this.width = void 0,
        this._margins = void 0,
        this.position = void 0,
        this.weight = void 0,
        this.fullSize = void 0
    }
    update(t, n, r) {
        this.maxWidth = t,
        this.maxHeight = n,
        this._margins = r,
        this.setDimensions(),
        this.buildLabels(),
        this.fit()
    }
    setDimensions() {
        this.isHorizontal() ? (this.width = this.maxWidth,
        this.left = this._margins.left,
        this.right = this.width) : (this.height = this.maxHeight,
        this.top = this._margins.top,
        this.bottom = this.height)
    }
    buildLabels() {
        const t = this.options.labels || {};
        let n = rt(t.generateLabels, [this.chart], this) || [];
        t.filter && (n = n.filter(r => t.filter(r, this.chart.data))),
        t.sort && (n = n.sort( (r, i) => t.sort(r, i, this.chart.data))),
        this.options.reverse && n.reverse(),
        this.legendItems = n
    }
    fit() {
        const {options: t, ctx: n} = this;
        if (!t.display) {
            this.width = this.height = 0;
            return
        }
        const r = t.labels
          , i = vt(r.font)
          , a = i.size
          , o = this._computeTitleHeight()
          , {boxWidth: s, itemHeight: l} = kc(r, a);
        let c, u;
        n.font = i.string,
        this.isHorizontal() ? (c = this.maxWidth,
        u = this._fitRows(o, a, s, l) + 10) : (u = this.maxHeight,
        c = this._fitCols(o, i, s, l) + 10),
        this.width = Math.min(c, t.maxWidth || this.maxWidth),
        this.height = Math.min(u, t.maxHeight || this.maxHeight)
    }
    _fitRows(t, n, r, i) {
        const {ctx: a, maxWidth: o, options: {labels: {padding: s}}} = this
          , l = this.legendHitBoxes = []
          , c = this.lineWidths = [0]
          , u = i + s;
        let f = t;
        a.textAlign = "left",
        a.textBaseline = "middle";
        let h = -1
          , d = -u;
        return this.legendItems.forEach( (p, g) => {
            const m = r + n / 2 + a.measureText(p.text).width;
            (g === 0 || c[c.length - 1] + m + 2 * s > o) && (f += u,
            c[c.length - (g > 0 ? 0 : 1)] = 0,
            d += u,
            h++),
            l[g] = {
                left: 0,
                top: d,
                row: h,
                width: m,
                height: i
            },
            c[c.length - 1] += m + s
        }
        ),
        f
    }
    _fitCols(t, n, r, i) {
        const {ctx: a, maxHeight: o, options: {labels: {padding: s}}} = this
          , l = this.legendHitBoxes = []
          , c = this.columnSizes = []
          , u = o - t;
        let f = s
          , h = 0
          , d = 0
          , p = 0
          , g = 0;
        return this.legendItems.forEach( (m, v) => {
            const {itemWidth: b, itemHeight: x} = Vb(r, n, a, m, i);
            v > 0 && d + x + 2 * s > u && (f += h + s,
            c.push({
                width: h,
                height: d
            }),
            p += h + s,
            g++,
            h = d = 0),
            l[v] = {
                left: p,
                top: d,
                col: g,
                width: b,
                height: x
            },
            h = Math.max(h, b),
            d += x + s
        }
        ),
        f += h,
        c.push({
            width: h,
            height: d
        }),
        f
    }
    adjustHitBoxes() {
        if (!this.options.display)
            return;
        const t = this._computeTitleHeight()
          , {legendHitBoxes: n, options: {align: r, labels: {padding: i}, rtl: a}} = this
          , o = mn(a, this.left, this.width);
        if (this.isHorizontal()) {
            let s = 0
              , l = _t(r, this.left + i, this.right - this.lineWidths[s]);
            for (const c of n)
                s !== c.row && (s = c.row,
                l = _t(r, this.left + i, this.right - this.lineWidths[s])),
                c.top += this.top + t + i,
                c.left = o.leftForLtr(o.x(l), c.width),
                l += c.width + i
        } else {
            let s = 0
              , l = _t(r, this.top + t + i, this.bottom - this.columnSizes[s].height);
            for (const c of n)
                c.col !== s && (s = c.col,
                l = _t(r, this.top + t + i, this.bottom - this.columnSizes[s].height)),
                c.top = l,
                c.left += this.left + i,
                c.left = o.leftForLtr(o.x(c.left), c.width),
                l += c.height + i
        }
    }
    isHorizontal() {
        return this.options.position === "top" || this.options.position === "bottom"
    }
    draw() {
        if (this.options.display) {
            const t = this.ctx;
            Ca(t, this),
            this._draw(),
            Da(t)
        }
    }
    _draw() {
        const {options: t, columnSizes: n, lineWidths: r, ctx: i} = this
          , {align: a, labels: o} = t
          , s = st.color
          , l = mn(t.rtl, this.left, this.width)
          , c = vt(o.font)
          , {padding: u} = o
          , f = c.size
          , h = f / 2;
        let d;
        this.drawTitle(),
        i.textAlign = l.textAlign("left"),
        i.textBaseline = "middle",
        i.lineWidth = .5,
        i.font = c.string;
        const {boxWidth: p, boxHeight: g, itemHeight: m} = kc(o, f)
          , v = function(O, _, P) {
            if (isNaN(p) || p <= 0 || isNaN(g) || g < 0)
                return;
            i.save();
            const S = Y(P.lineWidth, 1);
            if (i.fillStyle = Y(P.fillStyle, s),
            i.lineCap = Y(P.lineCap, "butt"),
            i.lineDashOffset = Y(P.lineDashOffset, 0),
            i.lineJoin = Y(P.lineJoin, "miter"),
            i.lineWidth = S,
            i.strokeStyle = Y(P.strokeStyle, s),
            i.setLineDash(Y(P.lineDash, [])),
            o.usePointStyle) {
                const k = {
                    radius: g * Math.SQRT2 / 2,
                    pointStyle: P.pointStyle,
                    rotation: P.rotation,
                    borderWidth: S
                }
                  , E = l.xPlus(O, p / 2)
                  , M = _ + h;
                mh(i, k, E, M, o.pointStyleWidth && p)
            } else {
                const k = _ + Math.max((f - g) / 2, 0)
                  , E = l.leftForLtr(O, p)
                  , M = Ge(P.borderRadius);
                i.beginPath(),
                Object.values(M).some(C => C !== 0) ? jr(i, {
                    x: E,
                    y: k,
                    w: p,
                    h: g,
                    radius: M
                }) : i.rect(E, k, p, g),
                i.fill(),
                S !== 0 && i.stroke()
            }
            i.restore()
        }
          , b = function(O, _, P) {
            Je(i, P.text, O, _ + m / 2, c, {
                strikethrough: P.hidden,
                textAlign: l.textAlign(P.textAlign)
            })
        }
          , x = this.isHorizontal()
          , w = this._computeTitleHeight();
        x ? d = {
            x: _t(a, this.left + u, this.right - r[0]),
            y: this.top + u + w,
            line: 0
        } : d = {
            x: this.left + u,
            y: _t(a, this.top + w + u, this.bottom - n[0].height),
            line: 0
        },
        Ph(this.ctx, t.textDirection);
        const y = m + u;
        this.legendItems.forEach( (O, _) => {
            i.strokeStyle = O.fontColor,
            i.fillStyle = O.fontColor;
            const P = i.measureText(O.text).width
              , S = l.textAlign(O.textAlign || (O.textAlign = o.textAlign))
              , k = p + h + P;
            let E = d.x
              , M = d.y;
            l.setWidth(this.width),
            x ? _ > 0 && E + k + u > this.right && (M = d.y += y,
            d.line++,
            E = d.x = _t(a, this.left + u, this.right - r[d.line])) : _ > 0 && M + y > this.bottom && (E = d.x = E + n[d.line].width + u,
            d.line++,
            M = d.y = _t(a, this.top + w + u, this.bottom - n[d.line].height));
            const C = l.x(E);
            if (v(C, M, O),
            E = xm(S, E + p + h, x ? E + k : this.right, t.rtl),
            b(l.x(E), M, O),
            x)
                d.x += k + u;
            else if (typeof O.text != "string") {
                const I = c.lineHeight;
                d.y += pd(O, I) + u
            } else
                d.y += y
        }
        ),
        Ah(this.ctx, t.textDirection)
    }
    drawTitle() {
        const t = this.options
          , n = t.title
          , r = vt(n.font)
          , i = St(n.padding);
        if (!n.display)
            return;
        const a = mn(t.rtl, this.left, this.width)
          , o = this.ctx
          , s = n.position
          , l = r.size / 2
          , c = i.top + l;
        let u, f = this.left, h = this.width;
        if (this.isHorizontal())
            h = Math.max(...this.lineWidths),
            u = this.top + c,
            f = _t(t.align, f, this.right - h);
        else {
            const p = this.columnSizes.reduce( (g, m) => Math.max(g, m.height), 0);
            u = c + _t(t.align, this.top, this.bottom - p - t.labels.padding - this._computeTitleHeight())
        }
        const d = _t(s, f, f + h);
        o.textAlign = a.textAlign(Ks(s)),
        o.textBaseline = "middle",
        o.strokeStyle = n.color,
        o.fillStyle = n.color,
        o.font = r.string,
        Je(o, n.text, d, u, r)
    }
    _computeTitleHeight() {
        const t = this.options.title
          , n = vt(t.font)
          , r = St(t.padding);
        return t.display ? n.lineHeight + r.height : 0
    }
    _getLegendItemAt(t, n) {
        let r, i, a;
        if (oe(t, this.left, this.right) && oe(n, this.top, this.bottom)) {
            for (a = this.legendHitBoxes,
            r = 0; r < a.length; ++r)
                if (i = a[r],
                oe(t, i.left, i.left + i.width) && oe(n, i.top, i.top + i.height))
                    return this.legendItems[r]
        }
        return null
    }
    handleEvent(t) {
        const n = this.options;
        if (!Xb(t.type, n))
            return;
        const r = this._getLegendItemAt(t.x, t.y);
        if (t.type === "mousemove" || t.type === "mouseout") {
            const i = this._hoveredItem
              , a = Wb(i, r);
            i && !a && rt(n.onLeave, [t, i, this], this),
            this._hoveredItem = r,
            r && !a && rt(n.onHover, [t, r, this], this)
        } else
            r && rt(n.onClick, [t, r, this], this)
    }
}
;
function Vb(e, t, n, r, i) {
    const a = Hb(r, e, t, n)
      , o = Kb(i, r, t.lineHeight);
    return {
        itemWidth: a,
        itemHeight: o
    }
}
function Hb(e, t, n, r) {
    let i = e.text;
    return i && typeof i != "string" && (i = i.reduce( (a, o) => a.length > o.length ? a : o)),
    t + n.size / 2 + r.measureText(i).width
}
function Kb(e, t, n) {
    let r = e;
    return typeof t.text != "string" && (r = pd(t, n)),
    r
}
function pd(e, t) {
    const n = e.text ? e.text.length : 0;
    return t * n
}
function Xb(e, t) {
    return !!((e === "mousemove" || e === "mouseout") && (t.onHover || t.onLeave) || t.onClick && (e === "click" || e === "mouseup"))
}
var gd = {
    id: "legend",
    _element: Ec,
    start(e, t, n) {
        const r = e.legend = new Ec({
            ctx: e.ctx,
            options: n,
            chart: e
        });
        wt.configure(e, r, n),
        wt.addBox(e, r)
    },
    stop(e) {
        wt.removeBox(e, e.legend),
        delete e.legend
    },
    beforeUpdate(e, t, n) {
        const r = e.legend;
        wt.configure(e, r, n),
        r.options = n
    },
    afterUpdate(e) {
        const t = e.legend;
        t.buildLabels(),
        t.adjustHitBoxes()
    },
    afterEvent(e, t) {
        t.replay || e.legend.handleEvent(t.event)
    },
    defaults: {
        display: !0,
        position: "top",
        align: "center",
        fullSize: !0,
        reverse: !1,
        weight: 1e3,
        onClick(e, t, n) {
            const r = t.datasetIndex
              , i = n.chart;
            i.isDatasetVisible(r) ? (i.hide(r),
            t.hidden = !0) : (i.show(r),
            t.hidden = !1)
        },
        onHover: null,
        onLeave: null,
        labels: {
            color: e => e.chart.options.color,
            boxWidth: 40,
            padding: 10,
            generateLabels(e) {
                const t = e.data.datasets
                  , {labels: {usePointStyle: n, pointStyle: r, textAlign: i, color: a, useBorderRadius: o, borderRadius: s}} = e.legend.options;
                return e._getSortedDatasetMetas().map(l => {
                    const c = l.controller.getStyle(n ? 0 : void 0)
                      , u = St(c.borderWidth);
                    return {
                        text: t[l.index].label,
                        fillStyle: c.backgroundColor,
                        fontColor: a,
                        hidden: !l.visible,
                        lineCap: c.borderCapStyle,
                        lineDash: c.borderDash,
                        lineDashOffset: c.borderDashOffset,
                        lineJoin: c.borderJoinStyle,
                        lineWidth: (u.width + u.height) / 4,
                        strokeStyle: c.borderColor,
                        pointStyle: r || c.pointStyle,
                        rotation: c.rotation,
                        textAlign: i || c.textAlign,
                        borderRadius: o && (s || c.borderRadius),
                        datasetIndex: l.index
                    }
                }
                , this)
            }
        },
        title: {
            color: e => e.chart.options.color,
            display: !1,
            position: "center",
            text: ""
        }
    },
    descriptors: {
        _scriptable: e => !e.startsWith("on"),
        labels: {
            _scriptable: e => !["generateLabels", "filter", "sort"].includes(e)
        }
    }
};
class il extends te {
    constructor(t) {
        super(),
        this.chart = t.chart,
        this.options = t.options,
        this.ctx = t.ctx,
        this._padding = void 0,
        this.top = void 0,
        this.bottom = void 0,
        this.left = void 0,
        this.right = void 0,
        this.width = void 0,
        this.height = void 0,
        this.position = void 0,
        this.weight = void 0,
        this.fullSize = void 0
    }
    update(t, n) {
        const r = this.options;
        if (this.left = 0,
        this.top = 0,
        !r.display) {
            this.width = this.height = this.right = this.bottom = 0;
            return
        }
        this.width = this.right = t,
        this.height = this.bottom = n;
        const i = ut(r.text) ? r.text.length : 1;
        this._padding = St(r.padding);
        const a = i * vt(r.font).lineHeight + this._padding.height;
        this.isHorizontal() ? this.height = a : this.width = a
    }
    isHorizontal() {
        const t = this.options.position;
        return t === "top" || t === "bottom"
    }
    _drawArgs(t) {
        const {top: n, left: r, bottom: i, right: a, options: o} = this
          , s = o.align;
        let l = 0, c, u, f;
        return this.isHorizontal() ? (u = _t(s, r, a),
        f = n + t,
        c = a - r) : (o.position === "left" ? (u = r + t,
        f = _t(s, i, n),
        l = lt * -.5) : (u = a - t,
        f = _t(s, n, i),
        l = lt * .5),
        c = i - n),
        {
            titleX: u,
            titleY: f,
            maxWidth: c,
            rotation: l
        }
    }
    draw() {
        const t = this.ctx
          , n = this.options;
        if (!n.display)
            return;
        const r = vt(n.font)
          , a = r.lineHeight / 2 + this._padding.top
          , {titleX: o, titleY: s, maxWidth: l, rotation: c} = this._drawArgs(a);
        Je(t, n.text, 0, 0, r, {
            color: n.color,
            maxWidth: l,
            rotation: c,
            textAlign: Ks(n.align),
            textBaseline: "middle",
            translation: [o, s]
        })
    }
}
function Gb(e, t) {
    const n = new il({
        ctx: e.ctx,
        options: t,
        chart: e
    });
    wt.configure(e, n, t),
    wt.addBox(e, n),
    e.titleBlock = n
}
var md = {
    id: "title",
    _element: il,
    start(e, t, n) {
        Gb(e, n)
    },
    stop(e) {
        const t = e.titleBlock;
        wt.removeBox(e, t),
        delete e.titleBlock
    },
    beforeUpdate(e, t, n) {
        const r = e.titleBlock;
        wt.configure(e, r, n),
        r.options = n
    },
    defaults: {
        align: "center",
        display: !1,
        font: {
            weight: "bold"
        },
        fullSize: !0,
        padding: 10,
        position: "top",
        text: "",
        weight: 2e3
    },
    defaultRoutes: {
        color: "color"
    },
    descriptors: {
        _scriptable: !0,
        _indexable: !1
    }
};
const Pi = new WeakMap;
var yd = {
    id: "subtitle",
    start(e, t, n) {
        const r = new il({
            ctx: e.ctx,
            options: n,
            chart: e
        });
        wt.configure(e, r, n),
        wt.addBox(e, r),
        Pi.set(e, r)
    },
    stop(e) {
        wt.removeBox(e, Pi.get(e)),
        Pi.delete(e)
    },
    beforeUpdate(e, t, n) {
        const r = Pi.get(e);
        wt.configure(e, r, n),
        r.options = n
    },
    defaults: {
        align: "center",
        display: !1,
        font: {
            weight: "normal"
        },
        fullSize: !0,
        padding: 0,
        position: "top",
        text: "",
        weight: 1500
    },
    defaultRoutes: {
        color: "color"
    },
    descriptors: {
        _scriptable: !0,
        _indexable: !1
    }
};
const mr = {
    average(e) {
        if (!e.length)
            return !1;
        let t, n, r = new Set, i = 0, a = 0;
        for (t = 0,
        n = e.length; t < n; ++t) {
            const s = e[t].element;
            if (s && s.hasValue()) {
                const l = s.tooltipPosition();
                r.add(l.x),
                i += l.y,
                ++a
            }
        }
        return a === 0 || r.size === 0 ? !1 : {
            x: [...r].reduce( (s, l) => s + l) / r.size,
            y: i / a
        }
    },
    nearest(e, t) {
        if (!e.length)
            return !1;
        let n = t.x, r = t.y, i = Number.POSITIVE_INFINITY, a, o, s;
        for (a = 0,
        o = e.length; a < o; ++a) {
            const l = e[a].element;
            if (l && l.hasValue()) {
                const c = l.getCenterPoint()
                  , u = Eo(t, c);
                u < i && (i = u,
                s = l)
            }
        }
        if (s) {
            const l = s.tooltipPosition();
            n = l.x,
            r = l.y
        }
        return {
            x: n,
            y: r
        }
    }
};
function Yt(e, t) {
    return t && (ut(t) ? Array.prototype.push.apply(e, t) : e.push(t)),
    e
}
function re(e) {
    return (typeof e == "string" || e instanceof String) && e.indexOf(`
`) > -1 ? e.split(`
`) : e
}
function Ub(e, t) {
    const {element: n, datasetIndex: r, index: i} = t
      , a = e.getDatasetMeta(r).controller
      , {label: o, value: s} = a.getLabelAndValue(i);
    return {
        chart: e,
        label: o,
        parsed: a.getParsed(i),
        raw: e.data.datasets[r].data[i],
        formattedValue: s,
        dataset: a.getDataset(),
        dataIndex: i,
        datasetIndex: r,
        element: n
    }
}
function Mc(e, t) {
    const n = e.chart.ctx
      , {body: r, footer: i, title: a} = e
      , {boxWidth: o, boxHeight: s} = t
      , l = vt(t.bodyFont)
      , c = vt(t.titleFont)
      , u = vt(t.footerFont)
      , f = a.length
      , h = i.length
      , d = r.length
      , p = St(t.padding);
    let g = p.height
      , m = 0
      , v = r.reduce( (w, y) => w + y.before.length + y.lines.length + y.after.length, 0);
    if (v += e.beforeBody.length + e.afterBody.length,
    f && (g += f * c.lineHeight + (f - 1) * t.titleSpacing + t.titleMarginBottom),
    v) {
        const w = t.displayColors ? Math.max(s, l.lineHeight) : l.lineHeight;
        g += d * w + (v - d) * l.lineHeight + (v - 1) * t.bodySpacing
    }
    h && (g += t.footerMarginTop + h * u.lineHeight + (h - 1) * t.footerSpacing);
    let b = 0;
    const x = function(w) {
        m = Math.max(m, n.measureText(w).width + b)
    };
    return n.save(),
    n.font = c.string,
    tt(e.title, x),
    n.font = l.string,
    tt(e.beforeBody.concat(e.afterBody), x),
    b = t.displayColors ? o + 2 + t.boxPadding : 0,
    tt(r, w => {
        tt(w.before, x),
        tt(w.lines, x),
        tt(w.after, x)
    }
    ),
    b = 0,
    n.font = u.string,
    tt(e.footer, x),
    n.restore(),
    m += p.width,
    {
        width: m,
        height: g
    }
}
function Yb(e, t) {
    const {y: n, height: r} = t;
    return n < r / 2 ? "top" : n > e.height - r / 2 ? "bottom" : "center"
}
function qb(e, t, n, r) {
    const {x: i, width: a} = r
      , o = n.caretSize + n.caretPadding;
    if (e === "left" && i + a + o > t.width || e === "right" && i - a - o < 0)
        return !0
}
function Zb(e, t, n, r) {
    const {x: i, width: a} = n
      , {width: o, chartArea: {left: s, right: l}} = e;
    let c = "center";
    return r === "center" ? c = i <= (s + l) / 2 ? "left" : "right" : i <= a / 2 ? c = "left" : i >= o - a / 2 && (c = "right"),
    qb(c, e, t, n) && (c = "center"),
    c
}
function Tc(e, t, n) {
    const r = n.yAlign || t.yAlign || Yb(e, n);
    return {
        xAlign: n.xAlign || t.xAlign || Zb(e, t, n, r),
        yAlign: r
    }
}
function Jb(e, t) {
    let {x: n, width: r} = e;
    return t === "right" ? n -= r : t === "center" && (n -= r / 2),
    n
}
function Qb(e, t, n) {
    let {y: r, height: i} = e;
    return t === "top" ? r += n : t === "bottom" ? r -= i + n : r -= i / 2,
    r
}
function jc(e, t, n, r) {
    const {caretSize: i, caretPadding: a, cornerRadius: o} = e
      , {xAlign: s, yAlign: l} = n
      , c = i + a
      , {topLeft: u, topRight: f, bottomLeft: h, bottomRight: d} = Ge(o);
    let p = Jb(t, s);
    const g = Qb(t, l, c);
    return l === "center" ? s === "left" ? p += c : s === "right" && (p -= c) : s === "left" ? p -= Math.max(u, h) + i : s === "right" && (p += Math.max(f, d) + i),
    {
        x: Ot(p, 0, r.width - t.width),
        y: Ot(g, 0, r.height - t.height)
    }
}
function Ai(e, t, n) {
    const r = St(n.padding);
    return t === "center" ? e.x + e.width / 2 : t === "right" ? e.x + e.width - r.right : e.x + r.left
}
function Cc(e) {
    return Yt([], re(e))
}
function tx(e, t, n) {
    return Se(e, {
        tooltip: t,
        tooltipItems: n,
        type: "tooltip"
    })
}
function Dc(e, t) {
    const n = t && t.dataset && t.dataset.tooltip && t.dataset.tooltip.callbacks;
    return n ? e.override(n) : e
}
const vd = {
    beforeTitle: ee,
    title(e) {
        if (e.length > 0) {
            const t = e[0]
              , n = t.chart.data.labels
              , r = n ? n.length : 0;
            if (this && this.options && this.options.mode === "dataset")
                return t.dataset.label || "";
            if (t.label)
                return t.label;
            if (r > 0 && t.dataIndex < r)
                return n[t.dataIndex]
        }
        return ""
    },
    afterTitle: ee,
    beforeBody: ee,
    beforeLabel: ee,
    label(e) {
        if (this && this.options && this.options.mode === "dataset")
            return e.label + ": " + e.formattedValue || e.formattedValue;
        let t = e.dataset.label || "";
        t && (t += ": ");
        const n = e.formattedValue;
        return J(n) || (t += n),
        t
    },
    labelColor(e) {
        const n = e.chart.getDatasetMeta(e.datasetIndex).controller.getStyle(e.dataIndex);
        return {
            borderColor: n.borderColor,
            backgroundColor: n.backgroundColor,
            borderWidth: n.borderWidth,
            borderDash: n.borderDash,
            borderDashOffset: n.borderDashOffset,
            borderRadius: 0
        }
    },
    labelTextColor() {
        return this.options.bodyColor
    },
    labelPointStyle(e) {
        const n = e.chart.getDatasetMeta(e.datasetIndex).controller.getStyle(e.dataIndex);
        return {
            pointStyle: n.pointStyle,
            rotation: n.rotation
        }
    },
    afterLabel: ee,
    afterBody: ee,
    beforeFooter: ee,
    footer: ee,
    afterFooter: ee
};
function jt(e, t, n, r) {
    const i = e[t].call(n, r);
    return typeof i > "u" ? vd[t].call(n, r) : i
}
let Ic = class extends te {
    static positioners = mr;
    constructor(t) {
        super(),
        this.opacity = 0,
        this._active = [],
        this._eventPosition = void 0,
        this._size = void 0,
        this._cachedAnimations = void 0,
        this._tooltipItems = [],
        this.$animations = void 0,
        this.$context = void 0,
        this.chart = t.chart,
        this.options = t.options,
        this.dataPoints = void 0,
        this.title = void 0,
        this.beforeBody = void 0,
        this.body = void 0,
        this.afterBody = void 0,
        this.footer = void 0,
        this.xAlign = void 0,
        this.yAlign = void 0,
        this.x = void 0,
        this.y = void 0,
        this.height = void 0,
        this.width = void 0,
        this.caretX = void 0,
        this.caretY = void 0,
        this.labelColors = void 0,
        this.labelPointStyles = void 0,
        this.labelTextColors = void 0
    }
    initialize(t) {
        this.options = t,
        this._cachedAnimations = void 0,
        this.$context = void 0
    }
    _resolveAnimations() {
        const t = this._cachedAnimations;
        if (t)
            return t;
        const n = this.chart
          , r = this.options.setContext(this.getContext())
          , i = r.enabled && n.options.animation && r.animations
          , a = new Qs(this.chart,i);
        return i._cacheable && (this._cachedAnimations = Object.freeze(a)),
        a
    }
    getContext() {
        return this.$context || (this.$context = tx(this.chart.getContext(), this, this._tooltipItems))
    }
    getTitle(t, n) {
        const {callbacks: r} = n
          , i = jt(r, "beforeTitle", this, t)
          , a = jt(r, "title", this, t)
          , o = jt(r, "afterTitle", this, t);
        let s = [];
        return s = Yt(s, re(i)),
        s = Yt(s, re(a)),
        s = Yt(s, re(o)),
        s
    }
    getBeforeBody(t, n) {
        return Cc(jt(n.callbacks, "beforeBody", this, t))
    }
    getBody(t, n) {
        const {callbacks: r} = n
          , i = [];
        return tt(t, a => {
            const o = {
                before: [],
                lines: [],
                after: []
            }
              , s = Dc(r, a);
            Yt(o.before, re(jt(s, "beforeLabel", this, a))),
            Yt(o.lines, jt(s, "label", this, a)),
            Yt(o.after, re(jt(s, "afterLabel", this, a))),
            i.push(o)
        }
        ),
        i
    }
    getAfterBody(t, n) {
        return Cc(jt(n.callbacks, "afterBody", this, t))
    }
    getFooter(t, n) {
        const {callbacks: r} = n
          , i = jt(r, "beforeFooter", this, t)
          , a = jt(r, "footer", this, t)
          , o = jt(r, "afterFooter", this, t);
        let s = [];
        return s = Yt(s, re(i)),
        s = Yt(s, re(a)),
        s = Yt(s, re(o)),
        s
    }
    _createItems(t) {
        const n = this._active
          , r = this.chart.data
          , i = []
          , a = []
          , o = [];
        let s = [], l, c;
        for (l = 0,
        c = n.length; l < c; ++l)
            s.push(Ub(this.chart, n[l]));
        return t.filter && (s = s.filter( (u, f, h) => t.filter(u, f, h, r))),
        t.itemSort && (s = s.sort( (u, f) => t.itemSort(u, f, r))),
        tt(s, u => {
            const f = Dc(t.callbacks, u);
            i.push(jt(f, "labelColor", this, u)),
            a.push(jt(f, "labelPointStyle", this, u)),
            o.push(jt(f, "labelTextColor", this, u))
        }
        ),
        this.labelColors = i,
        this.labelPointStyles = a,
        this.labelTextColors = o,
        this.dataPoints = s,
        s
    }
    update(t, n) {
        const r = this.options.setContext(this.getContext())
          , i = this._active;
        let a, o = [];
        if (!i.length)
            this.opacity !== 0 && (a = {
                opacity: 0
            });
        else {
            const s = mr[r.position].call(this, i, this._eventPosition);
            o = this._createItems(r),
            this.title = this.getTitle(o, r),
            this.beforeBody = this.getBeforeBody(o, r),
            this.body = this.getBody(o, r),
            this.afterBody = this.getAfterBody(o, r),
            this.footer = this.getFooter(o, r);
            const l = this._size = Mc(this, r)
              , c = Object.assign({}, s, l)
              , u = Tc(this.chart, r, c)
              , f = jc(r, c, u, this.chart);
            this.xAlign = u.xAlign,
            this.yAlign = u.yAlign,
            a = {
                opacity: 1,
                x: f.x,
                y: f.y,
                width: l.width,
                height: l.height,
                caretX: s.x,
                caretY: s.y
            }
        }
        this._tooltipItems = o,
        this.$context = void 0,
        a && this._resolveAnimations().update(this, a),
        t && r.external && r.external.call(this, {
            chart: this.chart,
            tooltip: this,
            replay: n
        })
    }
    drawCaret(t, n, r, i) {
        const a = this.getCaretPosition(t, r, i);
        n.lineTo(a.x1, a.y1),
        n.lineTo(a.x2, a.y2),
        n.lineTo(a.x3, a.y3)
    }
    getCaretPosition(t, n, r) {
        const {xAlign: i, yAlign: a} = this
          , {caretSize: o, cornerRadius: s} = r
          , {topLeft: l, topRight: c, bottomLeft: u, bottomRight: f} = Ge(s)
          , {x: h, y: d} = t
          , {width: p, height: g} = n;
        let m, v, b, x, w, y;
        return a === "center" ? (w = d + g / 2,
        i === "left" ? (m = h,
        v = m - o,
        x = w + o,
        y = w - o) : (m = h + p,
        v = m + o,
        x = w - o,
        y = w + o),
        b = m) : (i === "left" ? v = h + Math.max(l, u) + o : i === "right" ? v = h + p - Math.max(c, f) - o : v = this.caretX,
        a === "top" ? (x = d,
        w = x - o,
        m = v - o,
        b = v + o) : (x = d + g,
        w = x + o,
        m = v + o,
        b = v - o),
        y = x),
        {
            x1: m,
            x2: v,
            x3: b,
            y1: x,
            y2: w,
            y3: y
        }
    }
    drawTitle(t, n, r) {
        const i = this.title
          , a = i.length;
        let o, s, l;
        if (a) {
            const c = mn(r.rtl, this.x, this.width);
            for (t.x = Ai(this, r.titleAlign, r),
            n.textAlign = c.textAlign(r.titleAlign),
            n.textBaseline = "middle",
            o = vt(r.titleFont),
            s = r.titleSpacing,
            n.fillStyle = r.titleColor,
            n.font = o.string,
            l = 0; l < a; ++l)
                n.fillText(i[l], c.x(t.x), t.y + o.lineHeight / 2),
                t.y += o.lineHeight + s,
                l + 1 === a && (t.y += r.titleMarginBottom - s)
        }
    }
    _drawColorBox(t, n, r, i, a) {
        const o = this.labelColors[r]
          , s = this.labelPointStyles[r]
          , {boxHeight: l, boxWidth: c} = a
          , u = vt(a.bodyFont)
          , f = Ai(this, "left", a)
          , h = i.x(f)
          , d = l < u.lineHeight ? (u.lineHeight - l) / 2 : 0
          , p = n.y + d;
        if (a.usePointStyle) {
            const g = {
                radius: Math.min(c, l) / 2,
                pointStyle: s.pointStyle,
                rotation: s.rotation,
                borderWidth: 1
            }
              , m = i.leftForLtr(h, c) + c / 2
              , v = p + l / 2;
            t.strokeStyle = a.multiKeyBackground,
            t.fillStyle = a.multiKeyBackground,
            To(t, g, m, v),
            t.strokeStyle = o.borderColor,
            t.fillStyle = o.backgroundColor,
            To(t, g, m, v)
        } else {
            t.lineWidth = Z(o.borderWidth) ? Math.max(...Object.values(o.borderWidth)) : o.borderWidth || 1,
            t.strokeStyle = o.borderColor,
            t.setLineDash(o.borderDash || []),
            t.lineDashOffset = o.borderDashOffset || 0;
            const g = i.leftForLtr(h, c)
              , m = i.leftForLtr(i.xPlus(h, 1), c - 2)
              , v = Ge(o.borderRadius);
            Object.values(v).some(b => b !== 0) ? (t.beginPath(),
            t.fillStyle = a.multiKeyBackground,
            jr(t, {
                x: g,
                y: p,
                w: c,
                h: l,
                radius: v
            }),
            t.fill(),
            t.stroke(),
            t.fillStyle = o.backgroundColor,
            t.beginPath(),
            jr(t, {
                x: m,
                y: p + 1,
                w: c - 2,
                h: l - 2,
                radius: v
            }),
            t.fill()) : (t.fillStyle = a.multiKeyBackground,
            t.fillRect(g, p, c, l),
            t.strokeRect(g, p, c, l),
            t.fillStyle = o.backgroundColor,
            t.fillRect(m, p + 1, c - 2, l - 2))
        }
        t.fillStyle = this.labelTextColors[r]
    }
    drawBody(t, n, r) {
        const {body: i} = this
          , {bodySpacing: a, bodyAlign: o, displayColors: s, boxHeight: l, boxWidth: c, boxPadding: u} = r
          , f = vt(r.bodyFont);
        let h = f.lineHeight
          , d = 0;
        const p = mn(r.rtl, this.x, this.width)
          , g = function(P) {
            n.fillText(P, p.x(t.x + d), t.y + h / 2),
            t.y += h + a
        }
          , m = p.textAlign(o);
        let v, b, x, w, y, O, _;
        for (n.textAlign = o,
        n.textBaseline = "middle",
        n.font = f.string,
        t.x = Ai(this, m, r),
        n.fillStyle = r.bodyColor,
        tt(this.beforeBody, g),
        d = s && m !== "right" ? o === "center" ? c / 2 + u : c + 2 + u : 0,
        w = 0,
        O = i.length; w < O; ++w) {
            for (v = i[w],
            b = this.labelTextColors[w],
            n.fillStyle = b,
            tt(v.before, g),
            x = v.lines,
            s && x.length && (this._drawColorBox(n, t, w, p, r),
            h = Math.max(f.lineHeight, l)),
            y = 0,
            _ = x.length; y < _; ++y)
                g(x[y]),
                h = f.lineHeight;
            tt(v.after, g)
        }
        d = 0,
        h = f.lineHeight,
        tt(this.afterBody, g),
        t.y -= a
    }
    drawFooter(t, n, r) {
        const i = this.footer
          , a = i.length;
        let o, s;
        if (a) {
            const l = mn(r.rtl, this.x, this.width);
            for (t.x = Ai(this, r.footerAlign, r),
            t.y += r.footerMarginTop,
            n.textAlign = l.textAlign(r.footerAlign),
            n.textBaseline = "middle",
            o = vt(r.footerFont),
            n.fillStyle = r.footerColor,
            n.font = o.string,
            s = 0; s < a; ++s)
                n.fillText(i[s], l.x(t.x), t.y + o.lineHeight / 2),
                t.y += o.lineHeight + r.footerSpacing
        }
    }
    drawBackground(t, n, r, i) {
        const {xAlign: a, yAlign: o} = this
          , {x: s, y: l} = t
          , {width: c, height: u} = r
          , {topLeft: f, topRight: h, bottomLeft: d, bottomRight: p} = Ge(i.cornerRadius);
        n.fillStyle = i.backgroundColor,
        n.strokeStyle = i.borderColor,
        n.lineWidth = i.borderWidth,
        n.beginPath(),
        n.moveTo(s + f, l),
        o === "top" && this.drawCaret(t, n, r, i),
        n.lineTo(s + c - h, l),
        n.quadraticCurveTo(s + c, l, s + c, l + h),
        o === "center" && a === "right" && this.drawCaret(t, n, r, i),
        n.lineTo(s + c, l + u - p),
        n.quadraticCurveTo(s + c, l + u, s + c - p, l + u),
        o === "bottom" && this.drawCaret(t, n, r, i),
        n.lineTo(s + d, l + u),
        n.quadraticCurveTo(s, l + u, s, l + u - d),
        o === "center" && a === "left" && this.drawCaret(t, n, r, i),
        n.lineTo(s, l + f),
        n.quadraticCurveTo(s, l, s + f, l),
        n.closePath(),
        n.fill(),
        i.borderWidth > 0 && n.stroke()
    }
    _updateAnimationTarget(t) {
        const n = this.chart
          , r = this.$animations
          , i = r && r.x
          , a = r && r.y;
        if (i || a) {
            const o = mr[t.position].call(this, this._active, this._eventPosition);
            if (!o)
                return;
            const s = this._size = Mc(this, t)
              , l = Object.assign({}, o, this._size)
              , c = Tc(n, t, l)
              , u = jc(t, l, c, n);
            (i._to !== u.x || a._to !== u.y) && (this.xAlign = c.xAlign,
            this.yAlign = c.yAlign,
            this.width = s.width,
            this.height = s.height,
            this.caretX = o.x,
            this.caretY = o.y,
            this._resolveAnimations().update(this, u))
        }
    }
    _willRender() {
        return !!this.opacity
    }
    draw(t) {
        const n = this.options.setContext(this.getContext());
        let r = this.opacity;
        if (!r)
            return;
        this._updateAnimationTarget(n);
        const i = {
            width: this.width,
            height: this.height
        }
          , a = {
            x: this.x,
            y: this.y
        };
        r = Math.abs(r) < .001 ? 0 : r;
        const o = St(n.padding)
          , s = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
        n.enabled && s && (t.save(),
        t.globalAlpha = r,
        this.drawBackground(a, t, i, n),
        Ph(t, n.textDirection),
        a.y += o.top,
        this.drawTitle(a, t, n),
        this.drawBody(a, t, n),
        this.drawFooter(a, t, n),
        Ah(t, n.textDirection),
        t.restore())
    }
    getActiveElements() {
        return this._active || []
    }
    setActiveElements(t, n) {
        const r = this._active
          , i = t.map( ({datasetIndex: s, index: l}) => {
            const c = this.chart.getDatasetMeta(s);
            if (!c)
                throw new Error("Cannot find a dataset at index " + s);
            return {
                datasetIndex: s,
                element: c.data[l],
                index: l
            }
        }
        )
          , a = !zi(r, i)
          , o = this._positionChanged(i, n);
        (a || o) && (this._active = i,
        this._eventPosition = n,
        this._ignoreReplayEvents = !0,
        this.update(!0))
    }
    handleEvent(t, n, r=!0) {
        if (n && this._ignoreReplayEvents)
            return !1;
        this._ignoreReplayEvents = !1;
        const i = this.options
          , a = this._active || []
          , o = this._getActiveElements(t, a, n, r)
          , s = this._positionChanged(o, t)
          , l = n || !zi(o, a) || s;
        return l && (this._active = o,
        (i.enabled || i.external) && (this._eventPosition = {
            x: t.x,
            y: t.y
        },
        this.update(!0, n))),
        l
    }
    _getActiveElements(t, n, r, i) {
        const a = this.options;
        if (t.type === "mouseout")
            return [];
        if (!i)
            return n.filter(s => this.chart.data.datasets[s.datasetIndex] && this.chart.getDatasetMeta(s.datasetIndex).controller.getParsed(s.index) !== void 0);
        const o = this.chart.getElementsAtEventForMode(t, a.mode, a, r);
        return a.reverse && o.reverse(),
        o
    }
    _positionChanged(t, n) {
        const {caretX: r, caretY: i, options: a} = this
          , o = mr[a.position].call(this, t, n);
        return o !== !1 && (r !== o.x || i !== o.y)
    }
}
;
var bd = {
    id: "tooltip",
    _element: Ic,
    positioners: mr,
    afterInit(e, t, n) {
        n && (e.tooltip = new Ic({
            chart: e,
            options: n
        }))
    },
    beforeUpdate(e, t, n) {
        e.tooltip && e.tooltip.initialize(n)
    },
    reset(e, t, n) {
        e.tooltip && e.tooltip.initialize(n)
    },
    afterDraw(e) {
        const t = e.tooltip;
        if (t && t._willRender()) {
            const n = {
                tooltip: t
            };
            if (e.notifyPlugins("beforeTooltipDraw", {
                ...n,
                cancelable: !0
            }) === !1)
                return;
            t.draw(e.ctx),
            e.notifyPlugins("afterTooltipDraw", n)
        }
    },
    afterEvent(e, t) {
        if (e.tooltip) {
            const n = t.replay;
            e.tooltip.handleEvent(t.event, n, t.inChartArea) && (t.changed = !0)
        }
    },
    defaults: {
        enabled: !0,
        external: null,
        position: "average",
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        titleFont: {
            weight: "bold"
        },
        titleSpacing: 2,
        titleMarginBottom: 6,
        titleAlign: "left",
        bodyColor: "#fff",
        bodySpacing: 2,
        bodyFont: {},
        bodyAlign: "left",
        footerColor: "#fff",
        footerSpacing: 2,
        footerMarginTop: 6,
        footerFont: {
            weight: "bold"
        },
        footerAlign: "left",
        padding: 6,
        caretPadding: 2,
        caretSize: 5,
        cornerRadius: 6,
        boxHeight: (e, t) => t.bodyFont.size,
        boxWidth: (e, t) => t.bodyFont.size,
        multiKeyBackground: "#fff",
        displayColors: !0,
        boxPadding: 0,
        borderColor: "rgba(0,0,0,0)",
        borderWidth: 0,
        animation: {
            duration: 400,
            easing: "easeOutQuart"
        },
        animations: {
            numbers: {
                type: "number",
                properties: ["x", "y", "width", "height", "caretX", "caretY"]
            },
            opacity: {
                easing: "linear",
                duration: 200
            }
        },
        callbacks: vd
    },
    defaultRoutes: {
        bodyFont: "font",
        footerFont: "font",
        titleFont: "font"
    },
    descriptors: {
        _scriptable: e => e !== "filter" && e !== "itemSort" && e !== "external",
        _indexable: !1,
        callbacks: {
            _scriptable: !1,
            _indexable: !1
        },
        animation: {
            _fallback: !1
        },
        animations: {
            _fallback: "animation"
        }
    },
    additionalOptionScopes: ["interaction"]
}
  , xd = Object.freeze({
    __proto__: null,
    Colors: ld,
    Decimation: ud,
    Filler: dd,
    Legend: gd,
    SubTitle: yd,
    Title: md,
    Tooltip: bd
});
const ex = (e, t, n, r) => (typeof t == "string" ? (n = e.push(t) - 1,
r.unshift({
    index: n,
    label: t
})) : isNaN(t) && (n = null),
n);
function nx(e, t, n, r) {
    const i = e.indexOf(t);
    if (i === -1)
        return ex(e, t, n, r);
    const a = e.lastIndexOf(t);
    return i !== a ? n : i
}
const rx = (e, t) => e === null ? null : Ot(Math.round(e), 0, t);
function $c(e) {
    const t = this.getLabels();
    return e >= 0 && e < t.length ? t[e] : e
}
class Od extends ke {
    static id = "category";
    static defaults = {
        ticks: {
            callback: $c
        }
    };
    constructor(t) {
        super(t),
        this._startValue = void 0,
        this._valueRange = 0,
        this._addedLabels = []
    }
    init(t) {
        const n = this._addedLabels;
        if (n.length) {
            const r = this.getLabels();
            for (const {index: i, label: a} of n)
                r[i] === a && r.splice(i, 1);
            this._addedLabels = []
        }
        super.init(t)
    }
    parse(t, n) {
        if (J(t))
            return null;
        const r = this.getLabels();
        return n = isFinite(n) && r[n] === t ? n : nx(r, t, Y(n, t), this._addedLabels),
        rx(n, r.length - 1)
    }
    determineDataLimits() {
        const {minDefined: t, maxDefined: n} = this.getUserBounds();
        let {min: r, max: i} = this.getMinMax(!0);
        this.options.bounds === "ticks" && (t || (r = 0),
        n || (i = this.getLabels().length - 1)),
        this.min = r,
        this.max = i
    }
    buildTicks() {
        const t = this.min
          , n = this.max
          , r = this.options.offset
          , i = [];
        let a = this.getLabels();
        a = t === 0 && n === a.length - 1 ? a : a.slice(t, n + 1),
        this._valueRange = Math.max(a.length - (r ? 0 : 1), 1),
        this._startValue = this.min - (r ? .5 : 0);
        for (let o = t; o <= n; o++)
            i.push({
                value: o
            });
        return i
    }
    getLabelForValue(t) {
        return $c.call(this, t)
    }
    configure() {
        super.configure(),
        this.isHorizontal() || (this._reversePixels = !this._reversePixels)
    }
    getPixelForValue(t) {
        return typeof t != "number" && (t = this.parse(t)),
        t === null ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange)
    }
    getPixelForTick(t) {
        const n = this.ticks;
        return t < 0 || t > n.length - 1 ? null : this.getPixelForValue(n[t].value)
    }
    getValueForPixel(t) {
        return Math.round(this._startValue + this.getDecimalForPixel(t) * this._valueRange)
    }
    getBasePixel() {
        return this.bottom
    }
}
function ix(e, t) {
    const n = []
      , {bounds: i, step: a, min: o, max: s, precision: l, count: c, maxTicks: u, maxDigits: f, includeBounds: h} = e
      , d = a || 1
      , p = u - 1
      , {min: g, max: m} = t
      , v = !J(o)
      , b = !J(s)
      , x = !J(c)
      , w = (m - g) / (f + 1);
    let y = Ml((m - g) / p / d) * d, O, _, P, S;
    if (y < 1e-14 && !v && !b)
        return [{
            value: g
        }, {
            value: m
        }];
    S = Math.ceil(m / y) - Math.floor(g / y),
    S > p && (y = Ml(S * y / p / d) * d),
    J(l) || (O = Math.pow(10, l),
    y = Math.ceil(y * O) / O),
    i === "ticks" ? (_ = Math.floor(g / y) * y,
    P = Math.ceil(m / y) * y) : (_ = g,
    P = m),
    v && b && a && dm((s - o) / a, y / 1e3) ? (S = Math.round(Math.min((s - o) / y, u)),
    y = (s - o) / S,
    _ = o,
    P = s) : x ? (_ = v ? o : _,
    P = b ? s : P,
    S = c - 1,
    y = (P - _) / S) : (S = (P - _) / y,
    vr(S, Math.round(S), y / 1e3) ? S = Math.round(S) : S = Math.ceil(S));
    const k = Math.max(Tl(y), Tl(_));
    O = Math.pow(10, J(l) ? k : l),
    _ = Math.round(_ * O) / O,
    P = Math.round(P * O) / O;
    let E = 0;
    for (v && (h && _ !== o ? (n.push({
        value: o
    }),
    _ < o && E++,
    vr(Math.round((_ + E * y) * O) / O, o, Lc(o, w, e)) && E++) : _ < o && E++); E < S; ++E) {
        const M = Math.round((_ + E * y) * O) / O;
        if (b && M > s)
            break;
        n.push({
            value: M
        })
    }
    return b && h && P !== s ? n.length && vr(n[n.length - 1].value, s, Lc(s, w, e)) ? n[n.length - 1].value = s : n.push({
        value: s
    }) : (!b || P === s) && n.push({
        value: P
    }),
    n
}
function Lc(e, t, {horizontal: n, minRotation: r}) {
    const i = Xt(r)
      , a = (n ? Math.sin(i) : Math.cos(i)) || .001
      , o = .75 * t * ("" + e).length;
    return Math.min(t / a, o)
}
class Gi extends ke {
    constructor(t) {
        super(t),
        this.start = void 0,
        this.end = void 0,
        this._startValue = void 0,
        this._endValue = void 0,
        this._valueRange = 0
    }
    parse(t, n) {
        return J(t) || (typeof t == "number" || t instanceof Number) && !isFinite(+t) ? null : +t
    }
    handleTickRangeOptions() {
        const {beginAtZero: t} = this.options
          , {minDefined: n, maxDefined: r} = this.getUserBounds();
        let {min: i, max: a} = this;
        const o = l => i = n ? i : l
          , s = l => a = r ? a : l;
        if (t) {
            const l = Jt(i)
              , c = Jt(a);
            l < 0 && c < 0 ? s(0) : l > 0 && c > 0 && o(0)
        }
        if (i === a) {
            let l = a === 0 ? 1 : Math.abs(a * .05);
            s(a + l),
            t || o(i - l)
        }
        this.min = i,
        this.max = a
    }
    getTickLimit() {
        const t = this.options.ticks;
        let {maxTicksLimit: n, stepSize: r} = t, i;
        return r ? (i = Math.ceil(this.max / r) - Math.floor(this.min / r) + 1,
        i > 1e3 && (console.warn(`scales.${this.id}.ticks.stepSize: ${r} would result generating up to ${i} ticks. Limiting to 1000.`),
        i = 1e3)) : (i = this.computeTickLimit(),
        n = n || 11),
        n && (i = Math.min(n, i)),
        i
    }
    computeTickLimit() {
        return Number.POSITIVE_INFINITY
    }
    buildTicks() {
        const t = this.options
          , n = t.ticks;
        let r = this.getTickLimit();
        r = Math.max(2, r);
        const i = {
            maxTicks: r,
            bounds: t.bounds,
            min: t.min,
            max: t.max,
            precision: n.precision,
            step: n.stepSize,
            count: n.count,
            maxDigits: this._maxDigits(),
            horizontal: this.isHorizontal(),
            minRotation: n.minRotation || 0,
            includeBounds: n.includeBounds !== !1
        }
          , a = this._range || this
          , o = ix(i, a);
        return t.bounds === "ticks" && sh(o, this, "value"),
        t.reverse ? (o.reverse(),
        this.start = this.max,
        this.end = this.min) : (this.start = this.min,
        this.end = this.max),
        o
    }
    configure() {
        const t = this.ticks;
        let n = this.min
          , r = this.max;
        if (super.configure(),
        this.options.offset && t.length) {
            const i = (r - n) / Math.max(t.length - 1, 1) / 2;
            n -= i,
            r += i
        }
        this._startValue = n,
        this._endValue = r,
        this._valueRange = r - n
    }
    getLabelForValue(t) {
        return si(t, this.chart.options.locale, this.options.ticks.format)
    }
}
class wd extends Gi {
    static id = "linear";
    static defaults = {
        ticks: {
            callback: li.formatters.numeric
        }
    };
    determineDataLimits() {
        const {min: t, max: n} = this.getMinMax(!0);
        this.min = dt(t) ? t : 0,
        this.max = dt(n) ? n : 1,
        this.handleTickRangeOptions()
    }
    computeTickLimit() {
        const t = this.isHorizontal()
          , n = t ? this.width : this.height
          , r = Xt(this.options.ticks.minRotation)
          , i = (t ? Math.sin(r) : Math.cos(r)) || .001
          , a = this._resolveTickFontOptions(0);
        return Math.ceil(n / Math.min(40, a.lineHeight / i))
    }
    getPixelForValue(t) {
        return t === null ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange)
    }
    getValueForPixel(t) {
        return this._startValue + this.getDecimalForPixel(t) * this._valueRange
    }
}
const Dr = e => Math.floor(ye(e))
  , Re = (e, t) => Math.pow(10, Dr(e) + t);
function Rc(e) {
    return e / Math.pow(10, Dr(e)) === 1
}
function Bc(e, t, n) {
    const r = Math.pow(10, n)
      , i = Math.floor(e / r);
    return Math.ceil(t / r) - i
}
function ax(e, t) {
    const n = t - e;
    let r = Dr(n);
    for (; Bc(e, t, r) > 10; )
        r++;
    for (; Bc(e, t, r) < 10; )
        r--;
    return Math.min(r, Dr(e))
}
function ox(e, {min: t, max: n}) {
    t = It(e.min, t);
    const r = []
      , i = Dr(t);
    let a = ax(t, n)
      , o = a < 0 ? Math.pow(10, Math.abs(a)) : 1;
    const s = Math.pow(10, a)
      , l = i > a ? Math.pow(10, i) : 0
      , c = Math.round((t - l) * o) / o
      , u = Math.floor((t - l) / s / 10) * s * 10;
    let f = Math.floor((c - u) / Math.pow(10, a))
      , h = It(e.min, Math.round((l + u + f * Math.pow(10, a)) * o) / o);
    for (; h < n; )
        r.push({
            value: h,
            major: Rc(h),
            significand: f
        }),
        f >= 10 ? f = f < 15 ? 15 : 20 : f++,
        f >= 20 && (a++,
        f = 2,
        o = a >= 0 ? 1 : o),
        h = Math.round((l + u + f * Math.pow(10, a)) * o) / o;
    const d = It(e.max, h);
    return r.push({
        value: d,
        major: Rc(d),
        significand: f
    }),
    r
}
class _d extends ke {
    static id = "logarithmic";
    static defaults = {
        ticks: {
            callback: li.formatters.logarithmic,
            major: {
                enabled: !0
            }
        }
    };
    constructor(t) {
        super(t),
        this.start = void 0,
        this.end = void 0,
        this._startValue = void 0,
        this._valueRange = 0
    }
    parse(t, n) {
        const r = Gi.prototype.parse.apply(this, [t, n]);
        if (r === 0) {
            this._zero = !0;
            return
        }
        return dt(r) && r > 0 ? r : null
    }
    determineDataLimits() {
        const {min: t, max: n} = this.getMinMax(!0);
        this.min = dt(t) ? Math.max(0, t) : null,
        this.max = dt(n) ? Math.max(0, n) : null,
        this.options.beginAtZero && (this._zero = !0),
        this._zero && this.min !== this._suggestedMin && !dt(this._userMin) && (this.min = t === Re(this.min, 0) ? Re(this.min, -1) : Re(this.min, 0)),
        this.handleTickRangeOptions()
    }
    handleTickRangeOptions() {
        const {minDefined: t, maxDefined: n} = this.getUserBounds();
        let r = this.min
          , i = this.max;
        const a = s => r = t ? r : s
          , o = s => i = n ? i : s;
        r === i && (r <= 0 ? (a(1),
        o(10)) : (a(Re(r, -1)),
        o(Re(i, 1)))),
        r <= 0 && a(Re(i, -1)),
        i <= 0 && o(Re(r, 1)),
        this.min = r,
        this.max = i
    }
    buildTicks() {
        const t = this.options
          , n = {
            min: this._userMin,
            max: this._userMax
        }
          , r = ox(n, this);
        return t.bounds === "ticks" && sh(r, this, "value"),
        t.reverse ? (r.reverse(),
        this.start = this.max,
        this.end = this.min) : (this.start = this.min,
        this.end = this.max),
        r
    }
    getLabelForValue(t) {
        return t === void 0 ? "0" : si(t, this.chart.options.locale, this.options.ticks.format)
    }
    configure() {
        const t = this.min;
        super.configure(),
        this._startValue = ye(t),
        this._valueRange = ye(this.max) - ye(t)
    }
    getPixelForValue(t) {
        return (t === void 0 || t === 0) && (t = this.min),
        t === null || isNaN(t) ? NaN : this.getPixelForDecimal(t === this.min ? 0 : (ye(t) - this._startValue) / this._valueRange)
    }
    getValueForPixel(t) {
        const n = this.getDecimalForPixel(t);
        return Math.pow(10, this._startValue + n * this._valueRange)
    }
}
function Lo(e) {
    const t = e.ticks;
    if (t.display && e.display) {
        const n = St(t.backdropPadding);
        return Y(t.font && t.font.size, st.font.size) + n.height
    }
    return 0
}
function sx(e, t, n) {
    return n = ut(n) ? n : [n],
    {
        w: Tm(e, t.string, n),
        h: n.length * t.lineHeight
    }
}
function Nc(e, t, n, r, i) {
    return e === r || e === i ? {
        start: t - n / 2,
        end: t + n / 2
    } : e < r || e > i ? {
        start: t - n,
        end: t
    } : {
        start: t,
        end: t + n
    }
}
function lx(e) {
    const t = {
        l: e.left + e._padding.left,
        r: e.right - e._padding.right,
        t: e.top + e._padding.top,
        b: e.bottom - e._padding.bottom
    }
      , n = Object.assign({}, t)
      , r = []
      , i = []
      , a = e._pointLabels.length
      , o = e.options.pointLabels
      , s = o.centerPointLabels ? lt / a : 0;
    for (let l = 0; l < a; l++) {
        const c = o.setContext(e.getPointLabelContext(l));
        i[l] = c.padding;
        const u = e.getPointPosition(l, e.drawingArea + i[l], s)
          , f = vt(c.font)
          , h = sx(e.ctx, f, e._pointLabels[l]);
        r[l] = h;
        const d = Rt(e.getIndexAngle(l) + s)
          , p = Math.round(Vs(d))
          , g = Nc(p, u.x, h.w, 0, 180)
          , m = Nc(p, u.y, h.h, 90, 270);
        cx(n, t, d, g, m)
    }
    e.setCenterPoint(t.l - n.l, n.r - t.r, t.t - n.t, n.b - t.b),
    e._pointLabelItems = hx(e, r, i)
}
function cx(e, t, n, r, i) {
    const a = Math.abs(Math.sin(n))
      , o = Math.abs(Math.cos(n));
    let s = 0
      , l = 0;
    r.start < t.l ? (s = (t.l - r.start) / a,
    e.l = Math.min(e.l, t.l - s)) : r.end > t.r && (s = (r.end - t.r) / a,
    e.r = Math.max(e.r, t.r + s)),
    i.start < t.t ? (l = (t.t - i.start) / o,
    e.t = Math.min(e.t, t.t - l)) : i.end > t.b && (l = (i.end - t.b) / o,
    e.b = Math.max(e.b, t.b + l))
}
function ux(e, t, n) {
    const r = e.drawingArea
      , {extra: i, additionalAngle: a, padding: o, size: s} = n
      , l = e.getPointPosition(t, r + i + o, a)
      , c = Math.round(Vs(Rt(l.angle + pt)))
      , u = gx(l.y, s.h, c)
      , f = dx(c)
      , h = px(l.x, s.w, f);
    return {
        visible: !0,
        x: l.x,
        y: u,
        textAlign: f,
        left: h,
        top: u,
        right: h + s.w,
        bottom: u + s.h
    }
}
function fx(e, t) {
    if (!t)
        return !0;
    const {left: n, top: r, right: i, bottom: a} = e;
    return !(le({
        x: n,
        y: r
    }, t) || le({
        x: n,
        y: a
    }, t) || le({
        x: i,
        y: r
    }, t) || le({
        x: i,
        y: a
    }, t))
}
function hx(e, t, n) {
    const r = []
      , i = e._pointLabels.length
      , a = e.options
      , {centerPointLabels: o, display: s} = a.pointLabels
      , l = {
        extra: Lo(a) / 2,
        additionalAngle: o ? lt / i : 0
    };
    let c;
    for (let u = 0; u < i; u++) {
        l.padding = n[u],
        l.size = t[u];
        const f = ux(e, u, l);
        r.push(f),
        s === "auto" && (f.visible = fx(f, c),
        f.visible && (c = f))
    }
    return r
}
function dx(e) {
    return e === 0 || e === 180 ? "center" : e < 180 ? "left" : "right"
}
function px(e, t, n) {
    return n === "right" ? e -= t : n === "center" && (e -= t / 2),
    e
}
function gx(e, t, n) {
    return n === 90 || n === 270 ? e -= t / 2 : (n > 270 || n < 90) && (e -= t),
    e
}
function mx(e, t, n) {
    const {left: r, top: i, right: a, bottom: o} = n
      , {backdropColor: s} = t;
    if (!J(s)) {
        const l = Ge(t.borderRadius)
          , c = St(t.backdropPadding);
        e.fillStyle = s;
        const u = r - c.left
          , f = i - c.top
          , h = a - r + c.width
          , d = o - i + c.height;
        Object.values(l).some(p => p !== 0) ? (e.beginPath(),
        jr(e, {
            x: u,
            y: f,
            w: h,
            h: d,
            radius: l
        }),
        e.fill()) : e.fillRect(u, f, h, d)
    }
}
function yx(e, t) {
    const {ctx: n, options: {pointLabels: r}} = e;
    for (let i = t - 1; i >= 0; i--) {
        const a = e._pointLabelItems[i];
        if (!a.visible)
            continue;
        const o = r.setContext(e.getPointLabelContext(i));
        mx(n, o, a);
        const s = vt(o.font)
          , {x: l, y: c, textAlign: u} = a;
        Je(n, e._pointLabels[i], l, c + s.lineHeight / 2, s, {
            color: o.color,
            textAlign: u,
            textBaseline: "middle"
        })
    }
}
function Pd(e, t, n, r) {
    const {ctx: i} = e;
    if (n)
        i.arc(e.xCenter, e.yCenter, t, 0, ot);
    else {
        let a = e.getPointPosition(0, t);
        i.moveTo(a.x, a.y);
        for (let o = 1; o < r; o++)
            a = e.getPointPosition(o, t),
            i.lineTo(a.x, a.y)
    }
}
function vx(e, t, n, r, i) {
    const a = e.ctx
      , o = t.circular
      , {color: s, lineWidth: l} = t;
    !o && !r || !s || !l || n < 0 || (a.save(),
    a.strokeStyle = s,
    a.lineWidth = l,
    a.setLineDash(i.dash || []),
    a.lineDashOffset = i.dashOffset,
    a.beginPath(),
    Pd(e, n, o, r),
    a.closePath(),
    a.stroke(),
    a.restore())
}
function bx(e, t, n) {
    return Se(e, {
        label: n,
        index: t,
        type: "pointLabel"
    })
}
class Ad extends Gi {
    static id = "radialLinear";
    static defaults = {
        display: !0,
        animate: !0,
        position: "chartArea",
        angleLines: {
            display: !0,
            lineWidth: 1,
            borderDash: [],
            borderDashOffset: 0
        },
        grid: {
            circular: !1
        },
        startAngle: 0,
        ticks: {
            showLabelBackdrop: !0,
            callback: li.formatters.numeric
        },
        pointLabels: {
            backdropColor: void 0,
            backdropPadding: 2,
            display: !0,
            font: {
                size: 10
            },
            callback(t) {
                return t
            },
            padding: 5,
            centerPointLabels: !1
        }
    };
    static defaultRoutes = {
        "angleLines.color": "borderColor",
        "pointLabels.color": "color",
        "ticks.color": "color"
    };
    static descriptors = {
        angleLines: {
            _fallback: "grid"
        }
    };
    constructor(t) {
        super(t),
        this.xCenter = void 0,
        this.yCenter = void 0,
        this.drawingArea = void 0,
        this._pointLabels = [],
        this._pointLabelItems = []
    }
    setDimensions() {
        const t = this._padding = St(Lo(this.options) / 2)
          , n = this.width = this.maxWidth - t.width
          , r = this.height = this.maxHeight - t.height;
        this.xCenter = Math.floor(this.left + n / 2 + t.left),
        this.yCenter = Math.floor(this.top + r / 2 + t.top),
        this.drawingArea = Math.floor(Math.min(n, r) / 2)
    }
    determineDataLimits() {
        const {min: t, max: n} = this.getMinMax(!1);
        this.min = dt(t) && !isNaN(t) ? t : 0,
        this.max = dt(n) && !isNaN(n) ? n : 0,
        this.handleTickRangeOptions()
    }
    computeTickLimit() {
        return Math.ceil(this.drawingArea / Lo(this.options))
    }
    generateTickLabels(t) {
        Gi.prototype.generateTickLabels.call(this, t),
        this._pointLabels = this.getLabels().map( (n, r) => {
            const i = rt(this.options.pointLabels.callback, [n, r], this);
            return i || i === 0 ? i : ""
        }
        ).filter( (n, r) => this.chart.getDataVisibility(r))
    }
    fit() {
        const t = this.options;
        t.display && t.pointLabels.display ? lx(this) : this.setCenterPoint(0, 0, 0, 0)
    }
    setCenterPoint(t, n, r, i) {
        this.xCenter += Math.floor((t - n) / 2),
        this.yCenter += Math.floor((r - i) / 2),
        this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(t, n, r, i))
    }
    getIndexAngle(t) {
        const n = ot / (this._pointLabels.length || 1)
          , r = this.options.startAngle || 0;
        return Rt(t * n + Xt(r))
    }
    getDistanceFromCenterForValue(t) {
        if (J(t))
            return NaN;
        const n = this.drawingArea / (this.max - this.min);
        return this.options.reverse ? (this.max - t) * n : (t - this.min) * n
    }
    getValueForDistanceFromCenter(t) {
        if (J(t))
            return NaN;
        const n = t / (this.drawingArea / (this.max - this.min));
        return this.options.reverse ? this.max - n : this.min + n
    }
    getPointLabelContext(t) {
        const n = this._pointLabels || [];
        if (t >= 0 && t < n.length) {
            const r = n[t];
            return bx(this.getContext(), t, r)
        }
    }
    getPointPosition(t, n, r=0) {
        const i = this.getIndexAngle(t) - pt + r;
        return {
            x: Math.cos(i) * n + this.xCenter,
            y: Math.sin(i) * n + this.yCenter,
            angle: i
        }
    }
    getPointPositionForValue(t, n) {
        return this.getPointPosition(t, this.getDistanceFromCenterForValue(n))
    }
    getBasePosition(t) {
        return this.getPointPositionForValue(t || 0, this.getBaseValue())
    }
    getPointLabelPosition(t) {
        const {left: n, top: r, right: i, bottom: a} = this._pointLabelItems[t];
        return {
            left: n,
            top: r,
            right: i,
            bottom: a
        }
    }
    drawBackground() {
        const {backgroundColor: t, grid: {circular: n}} = this.options;
        if (t) {
            const r = this.ctx;
            r.save(),
            r.beginPath(),
            Pd(this, this.getDistanceFromCenterForValue(this._endValue), n, this._pointLabels.length),
            r.closePath(),
            r.fillStyle = t,
            r.fill(),
            r.restore()
        }
    }
    drawGrid() {
        const t = this.ctx
          , n = this.options
          , {angleLines: r, grid: i, border: a} = n
          , o = this._pointLabels.length;
        let s, l, c;
        if (n.pointLabels.display && yx(this, o),
        i.display && this.ticks.forEach( (u, f) => {
            if (f !== 0 || f === 0 && this.min < 0) {
                l = this.getDistanceFromCenterForValue(u.value);
                const h = this.getContext(f)
                  , d = i.setContext(h)
                  , p = a.setContext(h);
                vx(this, d, l, o, p)
            }
        }
        ),
        r.display) {
            for (t.save(),
            s = o - 1; s >= 0; s--) {
                const u = r.setContext(this.getPointLabelContext(s))
                  , {color: f, lineWidth: h} = u;
                !h || !f || (t.lineWidth = h,
                t.strokeStyle = f,
                t.setLineDash(u.borderDash),
                t.lineDashOffset = u.borderDashOffset,
                l = this.getDistanceFromCenterForValue(n.reverse ? this.min : this.max),
                c = this.getPointPosition(s, l),
                t.beginPath(),
                t.moveTo(this.xCenter, this.yCenter),
                t.lineTo(c.x, c.y),
                t.stroke())
            }
            t.restore()
        }
    }
    drawBorder() {}
    drawLabels() {
        const t = this.ctx
          , n = this.options
          , r = n.ticks;
        if (!r.display)
            return;
        const i = this.getIndexAngle(0);
        let a, o;
        t.save(),
        t.translate(this.xCenter, this.yCenter),
        t.rotate(i),
        t.textAlign = "center",
        t.textBaseline = "middle",
        this.ticks.forEach( (s, l) => {
            if (l === 0 && this.min >= 0 && !n.reverse)
                return;
            const c = r.setContext(this.getContext(l))
              , u = vt(c.font);
            if (a = this.getDistanceFromCenterForValue(this.ticks[l].value),
            c.showLabelBackdrop) {
                t.font = u.string,
                o = t.measureText(s.label).width,
                t.fillStyle = c.backdropColor;
                const f = St(c.backdropPadding);
                t.fillRect(-o / 2 - f.left, -a - u.size / 2 - f.top, o + f.width, u.size + f.height)
            }
            Je(t, s.label, 0, -a, u, {
                color: c.color,
                strokeColor: c.textStrokeColor,
                strokeWidth: c.textStrokeWidth
            })
        }
        ),
        t.restore()
    }
    drawTitle() {}
}
const La = {
    millisecond: {
        common: !0,
        size: 1,
        steps: 1e3
    },
    second: {
        common: !0,
        size: 1e3,
        steps: 60
    },
    minute: {
        common: !0,
        size: 6e4,
        steps: 60
    },
    hour: {
        common: !0,
        size: 36e5,
        steps: 24
    },
    day: {
        common: !0,
        size: 864e5,
        steps: 30
    },
    week: {
        common: !1,
        size: 6048e5,
        steps: 4
    },
    month: {
        common: !0,
        size: 2628e6,
        steps: 12
    },
    quarter: {
        common: !1,
        size: 7884e6,
        steps: 4
    },
    year: {
        common: !0,
        size: 3154e7
    }
}
  , Ct = Object.keys(La);
function zc(e, t) {
    return e - t
}
function Fc(e, t) {
    if (J(t))
        return null;
    const n = e._adapter
      , {parser: r, round: i, isoWeekday: a} = e._parseOpts;
    let o = t;
    return typeof r == "function" && (o = r(o)),
    dt(o) || (o = typeof r == "string" ? n.parse(o, r) : n.parse(o)),
    o === null ? null : (i && (o = i === "week" && (xn(a) || a === !0) ? n.startOf(o, "isoWeek", a) : n.startOf(o, i)),
    +o)
}
function Wc(e, t, n, r) {
    const i = Ct.length;
    for (let a = Ct.indexOf(e); a < i - 1; ++a) {
        const o = La[Ct[a]]
          , s = o.steps ? o.steps : Number.MAX_SAFE_INTEGER;
        if (o.common && Math.ceil((n - t) / (s * o.size)) <= r)
            return Ct[a]
    }
    return Ct[i - 1]
}
function xx(e, t, n, r, i) {
    for (let a = Ct.length - 1; a >= Ct.indexOf(n); a--) {
        const o = Ct[a];
        if (La[o].common && e._adapter.diff(i, r, o) >= t - 1)
            return o
    }
    return Ct[n ? Ct.indexOf(n) : 0]
}
function Ox(e) {
    for (let t = Ct.indexOf(e) + 1, n = Ct.length; t < n; ++t)
        if (La[Ct[t]].common)
            return Ct[t]
}
function Vc(e, t, n) {
    if (!n)
        e[t] = !0;
    else if (n.length) {
        const {lo: r, hi: i} = Hs(n, t)
          , a = n[r] >= t ? n[r] : n[i];
        e[a] = !0
    }
}
function wx(e, t, n, r) {
    const i = e._adapter
      , a = +i.startOf(t[0].value, r)
      , o = t[t.length - 1].value;
    let s, l;
    for (s = a; s <= o; s = +i.add(s, 1, r))
        l = n[s],
        l >= 0 && (t[l].major = !0);
    return t
}
function Hc(e, t, n) {
    const r = []
      , i = {}
      , a = t.length;
    let o, s;
    for (o = 0; o < a; ++o)
        s = t[o],
        i[s] = o,
        r.push({
            value: s,
            major: !1
        });
    return a === 0 || !n ? r : wx(e, r, i, n)
}
class Ui extends ke {
    static id = "time";
    static defaults = {
        bounds: "data",
        adapters: {},
        time: {
            parser: !1,
            unit: !1,
            round: !1,
            isoWeekday: !1,
            minUnit: "millisecond",
            displayFormats: {}
        },
        ticks: {
            source: "auto",
            callback: !1,
            major: {
                enabled: !1
            }
        }
    };
    constructor(t) {
        super(t),
        this._cache = {
            data: [],
            labels: [],
            all: []
        },
        this._unit = "day",
        this._majorUnit = void 0,
        this._offsets = {},
        this._normalized = !1,
        this._parseOpts = void 0
    }
    init(t, n={}) {
        const r = t.time || (t.time = {})
          , i = this._adapter = new Nh._date(t.adapters.date);
        i.init(n),
        yr(r.displayFormats, i.formats()),
        this._parseOpts = {
            parser: r.parser,
            round: r.round,
            isoWeekday: r.isoWeekday
        },
        super.init(t),
        this._normalized = n.normalized
    }
    parse(t, n) {
        return t === void 0 ? null : Fc(this, t)
    }
    beforeLayout() {
        super.beforeLayout(),
        this._cache = {
            data: [],
            labels: [],
            all: []
        }
    }
    determineDataLimits() {
        const t = this.options
          , n = this._adapter
          , r = t.time.unit || "day";
        let {min: i, max: a, minDefined: o, maxDefined: s} = this.getUserBounds();
        function l(c) {
            !o && !isNaN(c.min) && (i = Math.min(i, c.min)),
            !s && !isNaN(c.max) && (a = Math.max(a, c.max))
        }
        (!o || !s) && (l(this._getLabelBounds()),
        (t.bounds !== "ticks" || t.ticks.source !== "labels") && l(this.getMinMax(!1))),
        i = dt(i) && !isNaN(i) ? i : +n.startOf(Date.now(), r),
        a = dt(a) && !isNaN(a) ? a : +n.endOf(Date.now(), r) + 1,
        this.min = Math.min(i, a - 1),
        this.max = Math.max(i + 1, a)
    }
    _getLabelBounds() {
        const t = this.getLabelTimestamps();
        let n = Number.POSITIVE_INFINITY
          , r = Number.NEGATIVE_INFINITY;
        return t.length && (n = t[0],
        r = t[t.length - 1]),
        {
            min: n,
            max: r
        }
    }
    buildTicks() {
        const t = this.options
          , n = t.time
          , r = t.ticks
          , i = r.source === "labels" ? this.getLabelTimestamps() : this._generate();
        t.bounds === "ticks" && i.length && (this.min = this._userMin || i[0],
        this.max = this._userMax || i[i.length - 1]);
        const a = this.min
          , o = this.max
          , s = ym(i, a, o);
        return this._unit = n.unit || (r.autoSkip ? Wc(n.minUnit, this.min, this.max, this._getLabelCapacity(a)) : xx(this, s.length, n.minUnit, this.min, this.max)),
        this._majorUnit = !r.major.enabled || this._unit === "year" ? void 0 : Ox(this._unit),
        this.initOffsets(i),
        t.reverse && s.reverse(),
        Hc(this, s, this._majorUnit)
    }
    afterAutoSkip() {
        this.options.offsetAfterAutoskip && this.initOffsets(this.ticks.map(t => +t.value))
    }
    initOffsets(t=[]) {
        let n = 0, r = 0, i, a;
        this.options.offset && t.length && (i = this.getDecimalForValue(t[0]),
        t.length === 1 ? n = 1 - i : n = (this.getDecimalForValue(t[1]) - i) / 2,
        a = this.getDecimalForValue(t[t.length - 1]),
        t.length === 1 ? r = a : r = (a - this.getDecimalForValue(t[t.length - 2])) / 2);
        const o = t.length < 3 ? .5 : .25;
        n = Ot(n, 0, o),
        r = Ot(r, 0, o),
        this._offsets = {
            start: n,
            end: r,
            factor: 1 / (n + 1 + r)
        }
    }
    _generate() {
        const t = this._adapter
          , n = this.min
          , r = this.max
          , i = this.options
          , a = i.time
          , o = a.unit || Wc(a.minUnit, n, r, this._getLabelCapacity(n))
          , s = Y(i.ticks.stepSize, 1)
          , l = o === "week" ? a.isoWeekday : !1
          , c = xn(l) || l === !0
          , u = {};
        let f = n, h, d;
        if (c && (f = +t.startOf(f, "isoWeek", l)),
        f = +t.startOf(f, c ? "day" : o),
        t.diff(r, n, o) > 1e5 * s)
            throw new Error(n + " and " + r + " are too far apart with stepSize of " + s + " " + o);
        const p = i.ticks.source === "data" && this.getDataTimestamps();
        for (h = f,
        d = 0; h < r; h = +t.add(h, s, o),
        d++)
            Vc(u, h, p);
        return (h === r || i.bounds === "ticks" || d === 1) && Vc(u, h, p),
        Object.keys(u).sort(zc).map(g => +g)
    }
    getLabelForValue(t) {
        const n = this._adapter
          , r = this.options.time;
        return r.tooltipFormat ? n.format(t, r.tooltipFormat) : n.format(t, r.displayFormats.datetime)
    }
    format(t, n) {
        const i = this.options.time.displayFormats
          , a = this._unit
          , o = n || i[a];
        return this._adapter.format(t, o)
    }
    _tickFormatFunction(t, n, r, i) {
        const a = this.options
          , o = a.ticks.callback;
        if (o)
            return rt(o, [t, n, r], this);
        const s = a.time.displayFormats
          , l = this._unit
          , c = this._majorUnit
          , u = l && s[l]
          , f = c && s[c]
          , h = r[n]
          , d = c && f && h && h.major;
        return this._adapter.format(t, i || (d ? f : u))
    }
    generateTickLabels(t) {
        let n, r, i;
        for (n = 0,
        r = t.length; n < r; ++n)
            i = t[n],
            i.label = this._tickFormatFunction(i.value, n, t)
    }
    getDecimalForValue(t) {
        return t === null ? NaN : (t - this.min) / (this.max - this.min)
    }
    getPixelForValue(t) {
        const n = this._offsets
          , r = this.getDecimalForValue(t);
        return this.getPixelForDecimal((n.start + r) * n.factor)
    }
    getValueForPixel(t) {
        const n = this._offsets
          , r = this.getDecimalForPixel(t) / n.factor - n.end;
        return this.min + r * (this.max - this.min)
    }
    _getLabelSize(t) {
        const n = this.options.ticks
          , r = this.ctx.measureText(t).width
          , i = Xt(this.isHorizontal() ? n.maxRotation : n.minRotation)
          , a = Math.cos(i)
          , o = Math.sin(i)
          , s = this._resolveTickFontOptions(0).size;
        return {
            w: r * a + s * o,
            h: r * o + s * a
        }
    }
    _getLabelCapacity(t) {
        const n = this.options.time
          , r = n.displayFormats
          , i = r[n.unit] || r.millisecond
          , a = this._tickFormatFunction(t, 0, Hc(this, [t], this._majorUnit), i)
          , o = this._getLabelSize(a)
          , s = Math.floor(this.isHorizontal() ? this.width / o.w : this.height / o.h) - 1;
        return s > 0 ? s : 1
    }
    getDataTimestamps() {
        let t = this._cache.data || [], n, r;
        if (t.length)
            return t;
        const i = this.getMatchingVisibleMetas();
        if (this._normalized && i.length)
            return this._cache.data = i[0].controller.getAllParsedValues(this);
        for (n = 0,
        r = i.length; n < r; ++n)
            t = t.concat(i[n].controller.getAllParsedValues(this));
        return this._cache.data = this.normalize(t)
    }
    getLabelTimestamps() {
        const t = this._cache.labels || [];
        let n, r;
        if (t.length)
            return t;
        const i = this.getLabels();
        for (n = 0,
        r = i.length; n < r; ++n)
            t.push(Fc(this, i[n]));
        return this._cache.labels = this._normalized ? t : this.normalize(t)
    }
    normalize(t) {
        return uh(t.sort(zc))
    }
}
function Si(e, t, n) {
    let r = 0, i = e.length - 1, a, o, s, l;
    n ? (t >= e[r].pos && t <= e[i].pos && ({lo: r, hi: i} = se(e, "pos", t)),
    {pos: a, time: s} = e[r],
    {pos: o, time: l} = e[i]) : (t >= e[r].time && t <= e[i].time && ({lo: r, hi: i} = se(e, "time", t)),
    {time: a, pos: s} = e[r],
    {time: o, pos: l} = e[i]);
    const c = o - a;
    return c ? s + (l - s) * (t - a) / c : s
}
class Sd extends Ui {
    static id = "timeseries";
    static defaults = Ui.defaults;
    constructor(t) {
        super(t),
        this._table = [],
        this._minPos = void 0,
        this._tableRange = void 0
    }
    initOffsets() {
        const t = this._getTimestampsForTable()
          , n = this._table = this.buildLookupTable(t);
        this._minPos = Si(n, this.min),
        this._tableRange = Si(n, this.max) - this._minPos,
        super.initOffsets(t)
    }
    buildLookupTable(t) {
        const {min: n, max: r} = this
          , i = []
          , a = [];
        let o, s, l, c, u;
        for (o = 0,
        s = t.length; o < s; ++o)
            c = t[o],
            c >= n && c <= r && i.push(c);
        if (i.length < 2)
            return [{
                time: n,
                pos: 0
            }, {
                time: r,
                pos: 1
            }];
        for (o = 0,
        s = i.length; o < s; ++o)
            u = i[o + 1],
            l = i[o - 1],
            c = i[o],
            Math.round((u + l) / 2) !== c && a.push({
                time: c,
                pos: o / (s - 1)
            });
        return a
    }
    _generate() {
        const t = this.min
          , n = this.max;
        let r = super.getDataTimestamps();
        return (!r.includes(t) || !r.length) && r.splice(0, 0, t),
        (!r.includes(n) || r.length === 1) && r.push(n),
        r.sort( (i, a) => i - a)
    }
    _getTimestampsForTable() {
        let t = this._cache.all || [];
        if (t.length)
            return t;
        const n = this.getDataTimestamps()
          , r = this.getLabelTimestamps();
        return n.length && r.length ? t = this.normalize(n.concat(r)) : t = n.length ? n : r,
        t = this._cache.all = t,
        t
    }
    getDecimalForValue(t) {
        return (Si(this._table, t) - this._minPos) / this._tableRange
    }
    getValueForPixel(t) {
        const n = this._offsets
          , r = this.getDecimalForPixel(t) / n.factor - n.end;
        return Si(this._table, r * this._tableRange + this._minPos, !0)
    }
}
var kd = Object.freeze({
    __proto__: null,
    CategoryScale: Od,
    LinearScale: wd,
    LogarithmicScale: _d,
    RadialLinearScale: Ad,
    TimeScale: Ui,
    TimeSeriesScale: Sd
});
const _x = [Bh, ad, xd, kd]
  , LM = Object.freeze(Object.defineProperty({
    __proto__: null,
    Animation: Mh,
    Animations: Qs,
    ArcElement: Qh,
    BarController: Ch,
    BarElement: id,
    BasePlatform: nl,
    BasicPlatform: Vh,
    BubbleController: Dh,
    CategoryScale: Od,
    Chart: Jh,
    Colors: ld,
    DatasetController: he,
    Decimation: ud,
    DomPlatform: Xh,
    DoughnutController: $a,
    Element: te,
    Filler: dd,
    Interaction: zh,
    Legend: gd,
    LineController: Ih,
    LineElement: ui,
    LinearScale: wd,
    LogarithmicScale: _d,
    PieController: $h,
    PointElement: nd,
    PolarAreaController: tl,
    RadarController: Lh,
    RadialLinearScale: Ad,
    Scale: ke,
    ScatterController: Rh,
    SubTitle: yd,
    Ticks: li,
    TimeScale: Ui,
    TimeSeriesScale: Sd,
    Title: md,
    Tooltip: bd,
    _adapters: Nh,
    _detectPlatform: Gh,
    animator: qt,
    controllers: Bh,
    defaults: st,
    elements: ad,
    layouts: wt,
    plugins: xd,
    registerables: _x,
    registry: Vt,
    scales: kd
}, Symbol.toStringTag, {
    value: "Module"
}));
var Et = function(t) {
    return t === 0 ? 0 : t > 0 ? 1 : -1
}
  , He = function(t) {
    return Ye(t) && t.indexOf("%") === t.length - 1
}
  , L = function(t) {
    return vg(t) && !Gn(t)
}
  , bt = function(t) {
    return L(t) || Ye(t)
}
  , Px = 0
  , Ee = function(t) {
    var n = ++Px;
    return "".concat(t || "").concat(n)
}
  , Mt = function(t, n) {
    var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0
      , i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
    if (!L(t) && !Ye(t))
        return r;
    var a;
    if (He(t)) {
        var o = t.indexOf("%");
        a = n * parseFloat(t.slice(0, o)) / 100
    } else
        a = +t;
    return Gn(a) && (a = r),
    i && a > n && (a = n),
    a
}
  , ge = function(t) {
    if (!t)
        return null;
    var n = Object.keys(t);
    return n && n.length ? t[n[0]] : null
}
  , Ax = function(t) {
    if (!Array.isArray(t))
        return !1;
    for (var n = t.length, r = {}, i = 0; i < n; i++)
        if (!r[t[i]])
            r[t[i]] = !0;
        else
            return !0;
    return !1
}
  , ft = function(t, n) {
    return L(t) && L(n) ? function(r) {
        return t + r * (n - t)
    }
    : function() {
        return n
    }
};
function Yi(e, t, n) {
    return !e || !e.length ? null : e.find(function(r) {
        return r && (typeof t == "function" ? t(r) : Bt(r, t)) === n
    })
}
var Sx = function(t) {
    if (!t || !t.length)
        return null;
    for (var n = t.length, r = 0, i = 0, a = 0, o = 0, s = 1 / 0, l = -1 / 0, c = 0, u = 0, f = 0; f < n; f++)
        c = t[f].cx || 0,
        u = t[f].cy || 0,
        r += c,
        i += u,
        a += c * u,
        o += c * c,
        s = Math.min(s, c),
        l = Math.max(l, c);
    var h = n * o !== r * r ? (n * a - r * i) / (n * o - r * r) : 0;
    return {
        xmin: s,
        xmax: l,
        a: h,
        b: (i - h * r) / n
    }
}
  , kx = function(t, n) {
    return L(t) && L(n) ? t - n : Ye(t) && Ye(n) ? t.localeCompare(n) : t instanceof Date && n instanceof Date ? t.getTime() - n.getTime() : String(t).localeCompare(String(n))
};
function yn(e, t) {
    for (var n in e)
        if ({}.hasOwnProperty.call(e, n) && (!{}.hasOwnProperty.call(t, n) || e[n] !== t[n]))
            return !1;
    for (var r in t)
        if ({}.hasOwnProperty.call(t, r) && !{}.hasOwnProperty.call(e, r))
            return !1;
    return !0
}
function Ro(e) {
    "@babel/helpers - typeof";
    return Ro = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Ro(e)
}
var Ex = ["viewBox", "children"]
  , Mx = ["aria-activedescendant", "aria-atomic", "aria-autocomplete", "aria-busy", "aria-checked", "aria-colcount", "aria-colindex", "aria-colspan", "aria-controls", "aria-current", "aria-describedby", "aria-details", "aria-disabled", "aria-errormessage", "aria-expanded", "aria-flowto", "aria-haspopup", "aria-hidden", "aria-invalid", "aria-keyshortcuts", "aria-label", "aria-labelledby", "aria-level", "aria-live", "aria-modal", "aria-multiline", "aria-multiselectable", "aria-orientation", "aria-owns", "aria-placeholder", "aria-posinset", "aria-pressed", "aria-readonly", "aria-relevant", "aria-required", "aria-roledescription", "aria-rowcount", "aria-rowindex", "aria-rowspan", "aria-selected", "aria-setsize", "aria-sort", "aria-valuemax", "aria-valuemin", "aria-valuenow", "aria-valuetext", "className", "color", "height", "id", "lang", "max", "media", "method", "min", "name", "style", "target", "width", "role", "tabIndex", "accentHeight", "accumulate", "additive", "alignmentBaseline", "allowReorder", "alphabetic", "amplitude", "arabicForm", "ascent", "attributeName", "attributeType", "autoReverse", "azimuth", "baseFrequency", "baselineShift", "baseProfile", "bbox", "begin", "bias", "by", "calcMode", "capHeight", "clip", "clipPath", "clipPathUnits", "clipRule", "colorInterpolation", "colorInterpolationFilters", "colorProfile", "colorRendering", "contentScriptType", "contentStyleType", "cursor", "cx", "cy", "d", "decelerate", "descent", "diffuseConstant", "direction", "display", "divisor", "dominantBaseline", "dur", "dx", "dy", "edgeMode", "elevation", "enableBackground", "end", "exponent", "externalResourcesRequired", "fill", "fillOpacity", "fillRule", "filter", "filterRes", "filterUnits", "floodColor", "floodOpacity", "focusable", "fontFamily", "fontSize", "fontSizeAdjust", "fontStretch", "fontStyle", "fontVariant", "fontWeight", "format", "from", "fx", "fy", "g1", "g2", "glyphName", "glyphOrientationHorizontal", "glyphOrientationVertical", "glyphRef", "gradientTransform", "gradientUnits", "hanging", "horizAdvX", "horizOriginX", "href", "ideographic", "imageRendering", "in2", "in", "intercept", "k1", "k2", "k3", "k4", "k", "kernelMatrix", "kernelUnitLength", "kerning", "keyPoints", "keySplines", "keyTimes", "lengthAdjust", "letterSpacing", "lightingColor", "limitingConeAngle", "local", "markerEnd", "markerHeight", "markerMid", "markerStart", "markerUnits", "markerWidth", "mask", "maskContentUnits", "maskUnits", "mathematical", "mode", "numOctaves", "offset", "opacity", "operator", "order", "orient", "orientation", "origin", "overflow", "overlinePosition", "overlineThickness", "paintOrder", "panose1", "pathLength", "patternContentUnits", "patternTransform", "patternUnits", "pointerEvents", "pointsAtX", "pointsAtY", "pointsAtZ", "preserveAlpha", "preserveAspectRatio", "primitiveUnits", "r", "radius", "refX", "refY", "renderingIntent", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "result", "rotate", "rx", "ry", "seed", "shapeRendering", "slope", "spacing", "specularConstant", "specularExponent", "speed", "spreadMethod", "startOffset", "stdDeviation", "stemh", "stemv", "stitchTiles", "stopColor", "stopOpacity", "strikethroughPosition", "strikethroughThickness", "string", "stroke", "strokeDasharray", "strokeDashoffset", "strokeLinecap", "strokeLinejoin", "strokeMiterlimit", "strokeOpacity", "strokeWidth", "surfaceScale", "systemLanguage", "tableValues", "targetX", "targetY", "textAnchor", "textDecoration", "textLength", "textRendering", "to", "transform", "u1", "u2", "underlinePosition", "underlineThickness", "unicode", "unicodeBidi", "unicodeRange", "unitsPerEm", "vAlphabetic", "values", "vectorEffect", "version", "vertAdvY", "vertOriginX", "vertOriginY", "vHanging", "vIdeographic", "viewTarget", "visibility", "vMathematical", "widths", "wordSpacing", "writingMode", "x1", "x2", "x", "xChannelSelector", "xHeight", "xlinkActuate", "xlinkArcrole", "xlinkHref", "xlinkRole", "xlinkShow", "xlinkTitle", "xlinkType", "xmlBase", "xmlLang", "xmlns", "xmlnsXlink", "xmlSpace", "y1", "y2", "y", "yChannelSelector", "z", "zoomAndPan", "ref", "key", "angle"]
  , Kc = ["points", "pathLength"]
  , vo = {
    svg: Ex,
    polygon: Kc,
    polyline: Kc
}
  , al = ["dangerouslySetInnerHTML", "onCopy", "onCopyCapture", "onCut", "onCutCapture", "onPaste", "onPasteCapture", "onCompositionEnd", "onCompositionEndCapture", "onCompositionStart", "onCompositionStartCapture", "onCompositionUpdate", "onCompositionUpdateCapture", "onFocus", "onFocusCapture", "onBlur", "onBlurCapture", "onChange", "onChangeCapture", "onBeforeInput", "onBeforeInputCapture", "onInput", "onInputCapture", "onReset", "onResetCapture", "onSubmit", "onSubmitCapture", "onInvalid", "onInvalidCapture", "onLoad", "onLoadCapture", "onError", "onErrorCapture", "onKeyDown", "onKeyDownCapture", "onKeyPress", "onKeyPressCapture", "onKeyUp", "onKeyUpCapture", "onAbort", "onAbortCapture", "onCanPlay", "onCanPlayCapture", "onCanPlayThrough", "onCanPlayThroughCapture", "onDurationChange", "onDurationChangeCapture", "onEmptied", "onEmptiedCapture", "onEncrypted", "onEncryptedCapture", "onEnded", "onEndedCapture", "onLoadedData", "onLoadedDataCapture", "onLoadedMetadata", "onLoadedMetadataCapture", "onLoadStart", "onLoadStartCapture", "onPause", "onPauseCapture", "onPlay", "onPlayCapture", "onPlaying", "onPlayingCapture", "onProgress", "onProgressCapture", "onRateChange", "onRateChangeCapture", "onSeeked", "onSeekedCapture", "onSeeking", "onSeekingCapture", "onStalled", "onStalledCapture", "onSuspend", "onSuspendCapture", "onTimeUpdate", "onTimeUpdateCapture", "onVolumeChange", "onVolumeChangeCapture", "onWaiting", "onWaitingCapture", "onAuxClick", "onAuxClickCapture", "onClick", "onClickCapture", "onContextMenu", "onContextMenuCapture", "onDoubleClick", "onDoubleClickCapture", "onDrag", "onDragCapture", "onDragEnd", "onDragEndCapture", "onDragEnter", "onDragEnterCapture", "onDragExit", "onDragExitCapture", "onDragLeave", "onDragLeaveCapture", "onDragOver", "onDragOverCapture", "onDragStart", "onDragStartCapture", "onDrop", "onDropCapture", "onMouseDown", "onMouseDownCapture", "onMouseEnter", "onMouseLeave", "onMouseMove", "onMouseMoveCapture", "onMouseOut", "onMouseOutCapture", "onMouseOver", "onMouseOverCapture", "onMouseUp", "onMouseUpCapture", "onSelect", "onSelectCapture", "onTouchCancel", "onTouchCancelCapture", "onTouchEnd", "onTouchEndCapture", "onTouchMove", "onTouchMoveCapture", "onTouchStart", "onTouchStartCapture", "onPointerDown", "onPointerDownCapture", "onPointerMove", "onPointerMoveCapture", "onPointerUp", "onPointerUpCapture", "onPointerCancel", "onPointerCancelCapture", "onPointerEnter", "onPointerEnterCapture", "onPointerLeave", "onPointerLeaveCapture", "onPointerOver", "onPointerOverCapture", "onPointerOut", "onPointerOutCapture", "onGotPointerCapture", "onGotPointerCaptureCapture", "onLostPointerCapture", "onLostPointerCaptureCapture", "onScroll", "onScrollCapture", "onWheel", "onWheelCapture", "onAnimationStart", "onAnimationStartCapture", "onAnimationEnd", "onAnimationEndCapture", "onAnimationIteration", "onAnimationIterationCapture", "onTransitionEnd", "onTransitionEndCapture"]
  , qi = function(t, n) {
    if (!t || typeof t == "function" || typeof t == "boolean")
        return null;
    var r = t;
    if (N.isValidElement(t) && (r = t.props),
    !Un(r))
        return null;
    var i = {};
    return Object.keys(r).forEach(function(a) {
        al.includes(a) && (i[a] = n || function(o) {
            return r[a](r, o)
        }
        )
    }),
    i
}
  , Tx = function(t, n, r) {
    return function(i) {
        return t(n, r, i),
        null
    }
}
  , Ae = function(t, n, r) {
    if (!Un(t) || Ro(t) !== "object")
        return null;
    var i = null;
    return Object.keys(t).forEach(function(a) {
        var o = t[a];
        al.includes(a) && typeof o == "function" && (i || (i = {}),
        i[a] = Tx(o, n, r))
    }),
    i
}
  , jx = ["children"]
  , Cx = ["children"];
function Xc(e, t) {
    if (e == null)
        return {};
    var n = Dx(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function Dx(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function Bo(e) {
    "@babel/helpers - typeof";
    return Bo = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Bo(e)
}
var Gc = {
    click: "onClick",
    mousedown: "onMouseDown",
    mouseup: "onMouseUp",
    mouseover: "onMouseOver",
    mousemove: "onMouseMove",
    mouseout: "onMouseOut",
    mouseenter: "onMouseEnter",
    mouseleave: "onMouseLeave",
    touchcancel: "onTouchCancel",
    touchend: "onTouchEnd",
    touchmove: "onTouchMove",
    touchstart: "onTouchStart",
    contextmenu: "onContextMenu",
    dblclick: "onDoubleClick"
}
  , ue = function(t) {
    return typeof t == "string" ? t : t ? t.displayName || t.name || "Component" : ""
}
  , Uc = null
  , bo = null
  , ol = function e(t) {
    if (t === Uc && Array.isArray(bo))
        return bo;
    var n = [];
    return N.Children.forEach(t, function(r) {
        X(r) || (nm.isFragment(r) ? n = n.concat(e(r.props.children)) : n.push(r))
    }),
    bo = n,
    Uc = t,
    n
};
function Tt(e, t) {
    var n = []
      , r = [];
    return Array.isArray(t) ? r = t.map(function(i) {
        return ue(i)
    }) : r = [ue(t)],
    ol(e).forEach(function(i) {
        var a = Bt(i, "type.displayName") || Bt(i, "type.name");
        r.indexOf(a) !== -1 && n.push(i)
    }),
    n
}
function Lt(e, t) {
    var n = Tt(e, t);
    return n && n[0]
}
var Yc = function(t) {
    if (!t || !t.props)
        return !1;
    var n = t.props
      , r = n.width
      , i = n.height;
    return !(!L(r) || r <= 0 || !L(i) || i <= 0)
}
  , Ix = ["a", "altGlyph", "altGlyphDef", "altGlyphItem", "animate", "animateColor", "animateMotion", "animateTransform", "circle", "clipPath", "color-profile", "cursor", "defs", "desc", "ellipse", "feBlend", "feColormatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence", "filter", "font", "font-face", "font-face-format", "font-face-name", "font-face-url", "foreignObject", "g", "glyph", "glyphRef", "hkern", "image", "line", "lineGradient", "marker", "mask", "metadata", "missing-glyph", "mpath", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "script", "set", "stop", "style", "svg", "switch", "symbol", "text", "textPath", "title", "tref", "tspan", "use", "view", "vkern"]
  , $x = function(t) {
    return t && t.type && Ye(t.type) && Ix.indexOf(t.type) >= 0
}
  , Ed = function(t) {
    return t && Bo(t) === "object" && "clipDot"in t
}
  , Lx = function(t, n, r, i) {
    var a, o = (a = vo?.[i]) !== null && a !== void 0 ? a : [];
    return n.startsWith("data-") || !K(t) && (i && o.includes(n) || Mx.includes(n)) || r && al.includes(n)
}
  , F = function(t, n, r) {
    if (!t || typeof t == "function" || typeof t == "boolean")
        return null;
    var i = t;
    if (N.isValidElement(t) && (i = t.props),
    !Un(i))
        return null;
    var a = {};
    return Object.keys(i).forEach(function(o) {
        var s;
        Lx((s = i) === null || s === void 0 ? void 0 : s[o], o, n, r) && (a[o] = i[o])
    }),
    a
}
  , No = function e(t, n) {
    if (t === n)
        return !0;
    var r = N.Children.count(t);
    if (r !== N.Children.count(n))
        return !1;
    if (r === 0)
        return !0;
    if (r === 1)
        return qc(Array.isArray(t) ? t[0] : t, Array.isArray(n) ? n[0] : n);
    for (var i = 0; i < r; i++) {
        var a = t[i]
          , o = n[i];
        if (Array.isArray(a) || Array.isArray(o)) {
            if (!e(a, o))
                return !1
        } else if (!qc(a, o))
            return !1
    }
    return !0
}
  , qc = function(t, n) {
    if (X(t) && X(n))
        return !0;
    if (!X(t) && !X(n)) {
        var r = t.props || {}
          , i = r.children
          , a = Xc(r, jx)
          , o = n.props || {}
          , s = o.children
          , l = Xc(o, Cx);
        return i && s ? yn(a, l) && No(i, s) : !i && !s ? yn(a, l) : !1
    }
    return !1
}
  , Zc = function(t, n) {
    var r = []
      , i = {};
    return ol(t).forEach(function(a, o) {
        if ($x(a))
            r.push(a);
        else if (a) {
            var s = ue(a.type)
              , l = n[s] || {}
              , c = l.handler
              , u = l.once;
            if (c && (!u || !i[s])) {
                var f = c(a, s, o);
                r.push(f),
                i[s] = !0
            }
        }
    }),
    r
}
  , Rx = function(t) {
    var n = t && t.type;
    return n && Gc[n] ? Gc[n] : null
}
  , Bx = function(t, n) {
    return ol(n).indexOf(t)
}
  , Nx = ["children", "width", "height", "viewBox", "className", "style", "title", "desc"];
function zo() {
    return zo = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    zo.apply(this, arguments)
}
function zx(e, t) {
    if (e == null)
        return {};
    var n = Fx(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function Fx(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function Fo(e) {
    var t = e.children
      , n = e.width
      , r = e.height
      , i = e.viewBox
      , a = e.className
      , o = e.style
      , s = e.title
      , l = e.desc
      , c = zx(e, Nx)
      , u = i || {
        width: n,
        height: r,
        x: 0,
        y: 0
    }
      , f = U("recharts-surface", a);
    return A.createElement("svg", zo({}, F(c, !0, "svg"), {
        className: f,
        width: n,
        height: r,
        style: o,
        viewBox: "".concat(u.x, " ").concat(u.y, " ").concat(u.width, " ").concat(u.height)
    }), A.createElement("title", null, s), A.createElement("desc", null, l), t)
}
var Wx = ["children", "className"];
function Wo() {
    return Wo = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    Wo.apply(this, arguments)
}
function Vx(e, t) {
    if (e == null)
        return {};
    var n = Hx(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function Hx(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
var q = A.forwardRef(function(e, t) {
    var n = e.children
      , r = e.className
      , i = Vx(e, Wx)
      , a = U("recharts-layer", r);
    return A.createElement("g", Wo({
        className: a
    }, F(i, !0), {
        ref: t
    }), n)
})
  , Gt = function(t, n) {
    for (var r = arguments.length, i = new Array(r > 2 ? r - 2 : 0), a = 2; a < r; a++)
        i[a - 2] = arguments[a]
};
function Ir(e) {
    "@babel/helpers - typeof";
    return Ir = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Ir(e)
}
var Kx = ["type", "size", "sizeType"];
function Vo() {
    return Vo = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    Vo.apply(this, arguments)
}
function Jc(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function Qc(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? Jc(Object(n), !0).forEach(function(r) {
            Xx(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Jc(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function Xx(e, t, n) {
    return t = Gx(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function Gx(e) {
    var t = Ux(e, "string");
    return Ir(t) == "symbol" ? t : t + ""
}
function Ux(e, t) {
    if (Ir(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Ir(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
function Yx(e, t) {
    if (e == null)
        return {};
    var n = qx(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function qx(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
var Md = {
    symbolCircle: eh,
    symbolCross: Ag,
    symbolDiamond: Pg,
    symbolSquare: _g,
    symbolStar: wg,
    symbolTriangle: Og,
    symbolWye: xg
}
  , Zx = Math.PI / 180
  , Jx = function(t) {
    var n = "symbol".concat(Ta(t));
    return Md[n] || eh
}
  , Qx = function(t, n, r) {
    if (n === "area")
        return t;
    switch (r) {
    case "cross":
        return 5 * t * t / 9;
    case "diamond":
        return .5 * t * t / Math.sqrt(3);
    case "square":
        return t * t;
    case "star":
        {
            var i = 18 * Zx;
            return 1.25 * t * t * (Math.tan(i) - Math.tan(i * 2) * Math.pow(Math.tan(i), 2))
        }
    case "triangle":
        return Math.sqrt(3) * t * t / 4;
    case "wye":
        return (21 - 10 * Math.sqrt(3)) * t * t / 8;
    default:
        return Math.PI * t * t / 4
    }
}
  , t0 = function(t, n) {
    Md["symbol".concat(Ta(t))] = n
}
  , Ra = function(t) {
    var n = t.type
      , r = n === void 0 ? "circle" : n
      , i = t.size
      , a = i === void 0 ? 64 : i
      , o = t.sizeType
      , s = o === void 0 ? "area" : o
      , l = Yx(t, Kx)
      , c = Qc(Qc({}, l), {}, {
        type: r,
        size: a,
        sizeType: s
    })
      , u = function() {
        var m = Jx(r)
          , v = bg().type(m).size(Qx(a, s, r));
        return v()
    }
      , f = c.className
      , h = c.cx
      , d = c.cy
      , p = F(c, !0);
    return h === +h && d === +d && a === +a ? A.createElement("path", Vo({}, p, {
        className: U("recharts-symbols", f),
        transform: "translate(".concat(h, ", ").concat(d, ")"),
        d: u()
    })) : null
};
Ra.registerSymbol = t0;
function _n(e) {
    "@babel/helpers - typeof";
    return _n = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    _n(e)
}
function Ho() {
    return Ho = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    Ho.apply(this, arguments)
}
function tu(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function e0(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? tu(Object(n), !0).forEach(function(r) {
            $r(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : tu(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function n0(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function r0(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, jd(r.key), r)
    }
}
function i0(e, t, n) {
    return t && r0(e.prototype, t),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function a0(e, t, n) {
    return t = Zi(t),
    o0(e, Td() ? Reflect.construct(t, n || [], Zi(e).constructor) : t.apply(e, n))
}
function o0(e, t) {
    if (t && (_n(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return s0(e)
}
function s0(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function Td() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (Td = function() {
        return !!e
    }
    )()
}
function Zi(e) {
    return Zi = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    Zi(e)
}
function l0(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && Ko(e, t)
}
function Ko(e, t) {
    return Ko = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    Ko(e, t)
}
function $r(e, t, n) {
    return t = jd(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function jd(e) {
    var t = c0(e, "string");
    return _n(t) == "symbol" ? t : t + ""
}
function c0(e, t) {
    if (_n(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (_n(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var Wt = 32
  , sl = function(e) {
    function t() {
        return n0(this, t),
        a0(this, t, arguments)
    }
    return l0(t, e),
    i0(t, [{
        key: "renderIcon",
        value: function(r) {
            var i = this.props.inactiveColor
              , a = Wt / 2
              , o = Wt / 6
              , s = Wt / 3
              , l = r.inactive ? i : r.color;
            if (r.type === "plainline")
                return A.createElement("line", {
                    strokeWidth: 4,
                    fill: "none",
                    stroke: l,
                    strokeDasharray: r.payload.strokeDasharray,
                    x1: 0,
                    y1: a,
                    x2: Wt,
                    y2: a,
                    className: "recharts-legend-icon"
                });
            if (r.type === "line")
                return A.createElement("path", {
                    strokeWidth: 4,
                    fill: "none",
                    stroke: l,
                    d: "M0,".concat(a, "h").concat(s, `
            A`).concat(o, ",").concat(o, ",0,1,1,").concat(2 * s, ",").concat(a, `
            H`).concat(Wt, "M").concat(2 * s, ",").concat(a, `
            A`).concat(o, ",").concat(o, ",0,1,1,").concat(s, ",").concat(a),
                    className: "recharts-legend-icon"
                });
            if (r.type === "rect")
                return A.createElement("path", {
                    stroke: "none",
                    fill: l,
                    d: "M0,".concat(Wt / 8, "h").concat(Wt, "v").concat(Wt * 3 / 4, "h").concat(-32, "z"),
                    className: "recharts-legend-icon"
                });
            if (A.isValidElement(r.legendIcon)) {
                var c = e0({}, r);
                return delete c.legendIcon,
                A.cloneElement(r.legendIcon, c)
            }
            return A.createElement(Ra, {
                fill: l,
                cx: a,
                cy: a,
                size: Wt,
                sizeType: "diameter",
                type: r.type
            })
        }
    }, {
        key: "renderItems",
        value: function() {
            var r = this
              , i = this.props
              , a = i.payload
              , o = i.iconSize
              , s = i.layout
              , l = i.formatter
              , c = i.inactiveColor
              , u = {
                x: 0,
                y: 0,
                width: Wt,
                height: Wt
            }
              , f = {
                display: s === "horizontal" ? "inline-block" : "block",
                marginRight: 10
            }
              , h = {
                display: "inline-block",
                verticalAlign: "middle",
                marginRight: 4
            };
            return a.map(function(d, p) {
                var g = d.formatter || l
                  , m = U($r($r({
                    "recharts-legend-item": !0
                }, "legend-item-".concat(p), !0), "inactive", d.inactive));
                if (d.type === "none")
                    return null;
                var v = K(d.value) ? null : d.value;
                Gt(!K(d.value), `The name property is also required when using a function for the dataKey of a chart's cartesian components. Ex: <Bar name="Name of my Data"/>`);
                var b = d.inactive ? c : d.color;
                return A.createElement("li", Ho({
                    className: m,
                    style: f,
                    key: "legend-item-".concat(p)
                }, Ae(r.props, d, p)), A.createElement(Fo, {
                    width: o,
                    height: o,
                    viewBox: u,
                    style: h
                }, r.renderIcon(d)), A.createElement("span", {
                    className: "recharts-legend-item-text",
                    style: {
                        color: b
                    }
                }, g ? g(v, d, p) : v))
            })
        }
    }, {
        key: "render",
        value: function() {
            var r = this.props
              , i = r.payload
              , a = r.layout
              , o = r.align;
            if (!i || !i.length)
                return null;
            var s = {
                padding: 0,
                margin: 0,
                textAlign: a === "horizontal" ? o : "left"
            };
            return A.createElement("ul", {
                className: "recharts-default-legend",
                style: s
            }, this.renderItems())
        }
    }])
}(N.PureComponent);
$r(sl, "displayName", "Legend");
$r(sl, "defaultProps", {
    iconSize: 14,
    layout: "horizontal",
    align: "center",
    verticalAlign: "middle",
    inactiveColor: "#ccc"
});
function Cd(e, t, n) {
    return t === !0 ? wl(e, n) : K(t) ? wl(e, t) : e
}
function Pn(e) {
    "@babel/helpers - typeof";
    return Pn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Pn(e)
}
var u0 = ["ref"];
function eu(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function ne(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? eu(Object(n), !0).forEach(function(r) {
            Ba(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : eu(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function f0(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function nu(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, Id(r.key), r)
    }
}
function h0(e, t, n) {
    return t && nu(e.prototype, t),
    n && nu(e, n),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function d0(e, t, n) {
    return t = Ji(t),
    p0(e, Dd() ? Reflect.construct(t, n || [], Ji(e).constructor) : t.apply(e, n))
}
function p0(e, t) {
    if (t && (Pn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return g0(e)
}
function g0(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function Dd() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (Dd = function() {
        return !!e
    }
    )()
}
function Ji(e) {
    return Ji = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    Ji(e)
}
function m0(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && Xo(e, t)
}
function Xo(e, t) {
    return Xo = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    Xo(e, t)
}
function Ba(e, t, n) {
    return t = Id(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function Id(e) {
    var t = y0(e, "string");
    return Pn(t) == "symbol" ? t : t + ""
}
function y0(e, t) {
    if (Pn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Pn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
function v0(e, t) {
    if (e == null)
        return {};
    var n = b0(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function b0(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function x0(e) {
    return e.value
}
function O0(e, t) {
    if (A.isValidElement(e))
        return A.cloneElement(e, t);
    if (typeof e == "function")
        return A.createElement(e, t);
    t.ref;
    var n = v0(t, u0);
    return A.createElement(sl, n)
}
var ru = 1
  , vn = function(e) {
    function t() {
        var n;
        f0(this, t);
        for (var r = arguments.length, i = new Array(r), a = 0; a < r; a++)
            i[a] = arguments[a];
        return n = d0(this, t, [].concat(i)),
        Ba(n, "lastBoundingBox", {
            width: -1,
            height: -1
        }),
        n
    }
    return m0(t, e),
    h0(t, [{
        key: "componentDidMount",
        value: function() {
            this.updateBBox()
        }
    }, {
        key: "componentDidUpdate",
        value: function() {
            this.updateBBox()
        }
    }, {
        key: "getBBox",
        value: function() {
            if (this.wrapperNode && this.wrapperNode.getBoundingClientRect) {
                var r = this.wrapperNode.getBoundingClientRect();
                return r.height = this.wrapperNode.offsetHeight,
                r.width = this.wrapperNode.offsetWidth,
                r
            }
            return null
        }
    }, {
        key: "updateBBox",
        value: function() {
            var r = this.props.onBBoxUpdate
              , i = this.getBBox();
            i ? (Math.abs(i.width - this.lastBoundingBox.width) > ru || Math.abs(i.height - this.lastBoundingBox.height) > ru) && (this.lastBoundingBox.width = i.width,
            this.lastBoundingBox.height = i.height,
            r && r(i)) : (this.lastBoundingBox.width !== -1 || this.lastBoundingBox.height !== -1) && (this.lastBoundingBox.width = -1,
            this.lastBoundingBox.height = -1,
            r && r(null))
        }
    }, {
        key: "getBBoxSnapshot",
        value: function() {
            return this.lastBoundingBox.width >= 0 && this.lastBoundingBox.height >= 0 ? ne({}, this.lastBoundingBox) : {
                width: 0,
                height: 0
            }
        }
    }, {
        key: "getDefaultPosition",
        value: function(r) {
            var i = this.props, a = i.layout, o = i.align, s = i.verticalAlign, l = i.margin, c = i.chartWidth, u = i.chartHeight, f, h;
            if (!r || (r.left === void 0 || r.left === null) && (r.right === void 0 || r.right === null))
                if (o === "center" && a === "vertical") {
                    var d = this.getBBoxSnapshot();
                    f = {
                        left: ((c || 0) - d.width) / 2
                    }
                } else
                    f = o === "right" ? {
                        right: l && l.right || 0
                    } : {
                        left: l && l.left || 0
                    };
            if (!r || (r.top === void 0 || r.top === null) && (r.bottom === void 0 || r.bottom === null))
                if (s === "middle") {
                    var p = this.getBBoxSnapshot();
                    h = {
                        top: ((u || 0) - p.height) / 2
                    }
                } else
                    h = s === "bottom" ? {
                        bottom: l && l.bottom || 0
                    } : {
                        top: l && l.top || 0
                    };
            return ne(ne({}, f), h)
        }
    }, {
        key: "render",
        value: function() {
            var r = this
              , i = this.props
              , a = i.content
              , o = i.width
              , s = i.height
              , l = i.wrapperStyle
              , c = i.payloadUniqBy
              , u = i.payload
              , f = ne(ne({
                position: "absolute",
                width: o || "auto",
                height: s || "auto"
            }, this.getDefaultPosition(l)), l);
            return A.createElement("div", {
                className: "recharts-legend-wrapper",
                style: f,
                ref: function(d) {
                    r.wrapperNode = d
                }
            }, O0(a, ne(ne({}, this.props), {}, {
                payload: Cd(u, c, x0)
            })))
        }
    }], [{
        key: "getWithHeight",
        value: function(r, i) {
            var a = ne(ne({}, this.defaultProps), r.props)
              , o = a.layout;
            return o === "vertical" && L(r.props.height) ? {
                height: r.props.height
            } : o === "horizontal" ? {
                width: r.props.width || i
            } : null
        }
    }])
}(N.PureComponent);
Ba(vn, "displayName", "Legend");
Ba(vn, "defaultProps", {
    iconSize: 14,
    layout: "horizontal",
    align: "center",
    verticalAlign: "bottom"
});
function Lr(e) {
    "@babel/helpers - typeof";
    return Lr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Lr(e)
}
function Go() {
    return Go = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    Go.apply(this, arguments)
}
function w0(e, t) {
    return S0(e) || A0(e, t) || P0(e, t) || _0()
}
function _0() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function P0(e, t) {
    if (e) {
        if (typeof e == "string")
            return iu(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return iu(e, t)
    }
}
function iu(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
function A0(e, t) {
    var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
    if (n != null) {
        var r, i, a, o, s = [], l = !0, c = !1;
        try {
            if (a = (n = n.call(e)).next,
            t !== 0)
                for (; !(l = (r = a.call(n)).done) && (s.push(r.value),
                s.length !== t); l = !0)
                    ;
        } catch (u) {
            c = !0,
            i = u
        } finally {
            try {
                if (!l && n.return != null && (o = n.return(),
                Object(o) !== o))
                    return
            } finally {
                if (c)
                    throw i
            }
        }
        return s
    }
}
function S0(e) {
    if (Array.isArray(e))
        return e
}
function au(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function xo(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? au(Object(n), !0).forEach(function(r) {
            k0(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : au(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function k0(e, t, n) {
    return t = E0(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function E0(e) {
    var t = M0(e, "string");
    return Lr(t) == "symbol" ? t : t + ""
}
function M0(e, t) {
    if (Lr(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Lr(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
function T0(e) {
    return Array.isArray(e) && bt(e[0]) && bt(e[1]) ? e.join(" ~ ") : e
}
var j0 = function(t) {
    var n = t.separator
      , r = n === void 0 ? " : " : n
      , i = t.contentStyle
      , a = i === void 0 ? {} : i
      , o = t.itemStyle
      , s = o === void 0 ? {} : o
      , l = t.labelStyle
      , c = l === void 0 ? {} : l
      , u = t.payload
      , f = t.formatter
      , h = t.itemSorter
      , d = t.wrapperClassName
      , p = t.labelClassName
      , g = t.label
      , m = t.labelFormatter
      , v = t.accessibilityLayer
      , b = v === void 0 ? !1 : v
      , x = function() {
        if (u && u.length) {
            var M = {
                padding: 0,
                margin: 0
            }
              , C = (h ? Fs(u, h) : u).map(function(I, T) {
                if (I.type === "none")
                    return null;
                var j = xo({
                    display: "block",
                    paddingTop: 4,
                    paddingBottom: 4,
                    color: I.color || "#000"
                }, s)
                  , $ = I.formatter || f || T0
                  , R = I.value
                  , B = I.name
                  , W = R
                  , V = B;
                if ($ && W != null && V != null) {
                    var z = $(R, B, I, T, u);
                    if (Array.isArray(z)) {
                        var H = w0(z, 2);
                        W = H[0],
                        V = H[1]
                    } else
                        W = z
                }
                return A.createElement("li", {
                    className: "recharts-tooltip-item",
                    key: "tooltip-item-".concat(T),
                    style: j
                }, bt(V) ? A.createElement("span", {
                    className: "recharts-tooltip-item-name"
                }, V) : null, bt(V) ? A.createElement("span", {
                    className: "recharts-tooltip-item-separator"
                }, r) : null, A.createElement("span", {
                    className: "recharts-tooltip-item-value"
                }, W), A.createElement("span", {
                    className: "recharts-tooltip-item-unit"
                }, I.unit || ""))
            });
            return A.createElement("ul", {
                className: "recharts-tooltip-item-list",
                style: M
            }, C)
        }
        return null
    }
      , w = xo({
        margin: 0,
        padding: 10,
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        whiteSpace: "nowrap"
    }, a)
      , y = xo({
        margin: 0
    }, c)
      , O = !X(g)
      , _ = O ? g : ""
      , P = U("recharts-default-tooltip", d)
      , S = U("recharts-tooltip-label", p);
    O && m && u !== void 0 && u !== null && (_ = m(g, u));
    var k = b ? {
        role: "status",
        "aria-live": "assertive"
    } : {};
    return A.createElement("div", Go({
        className: P,
        style: w
    }, k), A.createElement("p", {
        className: S,
        style: y
    }, A.isValidElement(_) ? _ : "".concat(_)), x())
};
function Rr(e) {
    "@babel/helpers - typeof";
    return Rr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Rr(e)
}
function ki(e, t, n) {
    return t = C0(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function C0(e) {
    var t = D0(e, "string");
    return Rr(t) == "symbol" ? t : t + ""
}
function D0(e, t) {
    if (Rr(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Rr(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
var ur = "recharts-tooltip-wrapper"
  , I0 = {
    visibility: "hidden"
};
function $0(e) {
    var t = e.coordinate
      , n = e.translateX
      , r = e.translateY;
    return U(ur, ki(ki(ki(ki({}, "".concat(ur, "-right"), L(n) && t && L(t.x) && n >= t.x), "".concat(ur, "-left"), L(n) && t && L(t.x) && n < t.x), "".concat(ur, "-bottom"), L(r) && t && L(t.y) && r >= t.y), "".concat(ur, "-top"), L(r) && t && L(t.y) && r < t.y))
}
function ou(e) {
    var t = e.allowEscapeViewBox
      , n = e.coordinate
      , r = e.key
      , i = e.offsetTopLeft
      , a = e.position
      , o = e.reverseDirection
      , s = e.tooltipDimension
      , l = e.viewBox
      , c = e.viewBoxDimension;
    if (a && L(a[r]))
        return a[r];
    var u = n[r] - s - i
      , f = n[r] + i;
    if (t[r])
        return o[r] ? u : f;
    if (o[r]) {
        var h = u
          , d = l[r];
        return h < d ? Math.max(f, l[r]) : Math.max(u, l[r])
    }
    var p = f + s
      , g = l[r] + c;
    return p > g ? Math.max(u, l[r]) : Math.max(f, l[r])
}
function L0(e) {
    var t = e.translateX
      , n = e.translateY
      , r = e.useTranslate3d;
    return {
        transform: r ? "translate3d(".concat(t, "px, ").concat(n, "px, 0)") : "translate(".concat(t, "px, ").concat(n, "px)")
    }
}
function R0(e) {
    var t = e.allowEscapeViewBox, n = e.coordinate, r = e.offsetTopLeft, i = e.position, a = e.reverseDirection, o = e.tooltipBox, s = e.useTranslate3d, l = e.viewBox, c, u, f;
    return o.height > 0 && o.width > 0 && n ? (u = ou({
        allowEscapeViewBox: t,
        coordinate: n,
        key: "x",
        offsetTopLeft: r,
        position: i,
        reverseDirection: a,
        tooltipDimension: o.width,
        viewBox: l,
        viewBoxDimension: l.width
    }),
    f = ou({
        allowEscapeViewBox: t,
        coordinate: n,
        key: "y",
        offsetTopLeft: r,
        position: i,
        reverseDirection: a,
        tooltipDimension: o.height,
        viewBox: l,
        viewBoxDimension: l.height
    }),
    c = L0({
        translateX: u,
        translateY: f,
        useTranslate3d: s
    })) : c = I0,
    {
        cssProperties: c,
        cssClasses: $0({
            translateX: u,
            translateY: f,
            coordinate: n
        })
    }
}
function An(e) {
    "@babel/helpers - typeof";
    return An = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    An(e)
}
function su(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function lu(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? su(Object(n), !0).forEach(function(r) {
            Yo(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : su(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function B0(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function N0(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, Ld(r.key), r)
    }
}
function z0(e, t, n) {
    return t && N0(e.prototype, t),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function F0(e, t, n) {
    return t = Qi(t),
    W0(e, $d() ? Reflect.construct(t, n || [], Qi(e).constructor) : t.apply(e, n))
}
function W0(e, t) {
    if (t && (An(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return V0(e)
}
function V0(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function $d() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return ($d = function() {
        return !!e
    }
    )()
}
function Qi(e) {
    return Qi = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    Qi(e)
}
function H0(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && Uo(e, t)
}
function Uo(e, t) {
    return Uo = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    Uo(e, t)
}
function Yo(e, t, n) {
    return t = Ld(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function Ld(e) {
    var t = K0(e, "string");
    return An(t) == "symbol" ? t : t + ""
}
function K0(e, t) {
    if (An(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (An(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var cu = 1
  , X0 = function(e) {
    function t() {
        var n;
        B0(this, t);
        for (var r = arguments.length, i = new Array(r), a = 0; a < r; a++)
            i[a] = arguments[a];
        return n = F0(this, t, [].concat(i)),
        Yo(n, "state", {
            dismissed: !1,
            dismissedAtCoordinate: {
                x: 0,
                y: 0
            },
            lastBoundingBox: {
                width: -1,
                height: -1
            }
        }),
        Yo(n, "handleKeyDown", function(o) {
            if (o.key === "Escape") {
                var s, l, c, u;
                n.setState({
                    dismissed: !0,
                    dismissedAtCoordinate: {
                        x: (s = (l = n.props.coordinate) === null || l === void 0 ? void 0 : l.x) !== null && s !== void 0 ? s : 0,
                        y: (c = (u = n.props.coordinate) === null || u === void 0 ? void 0 : u.y) !== null && c !== void 0 ? c : 0
                    }
                })
            }
        }),
        n
    }
    return H0(t, e),
    z0(t, [{
        key: "updateBBox",
        value: function() {
            if (this.wrapperNode && this.wrapperNode.getBoundingClientRect) {
                var r = this.wrapperNode.getBoundingClientRect();
                (Math.abs(r.width - this.state.lastBoundingBox.width) > cu || Math.abs(r.height - this.state.lastBoundingBox.height) > cu) && this.setState({
                    lastBoundingBox: {
                        width: r.width,
                        height: r.height
                    }
                })
            } else
                (this.state.lastBoundingBox.width !== -1 || this.state.lastBoundingBox.height !== -1) && this.setState({
                    lastBoundingBox: {
                        width: -1,
                        height: -1
                    }
                })
        }
    }, {
        key: "componentDidMount",
        value: function() {
            document.addEventListener("keydown", this.handleKeyDown),
            this.updateBBox()
        }
    }, {
        key: "componentWillUnmount",
        value: function() {
            document.removeEventListener("keydown", this.handleKeyDown)
        }
    }, {
        key: "componentDidUpdate",
        value: function() {
            var r, i;
            this.props.active && this.updateBBox(),
            this.state.dismissed && (((r = this.props.coordinate) === null || r === void 0 ? void 0 : r.x) !== this.state.dismissedAtCoordinate.x || ((i = this.props.coordinate) === null || i === void 0 ? void 0 : i.y) !== this.state.dismissedAtCoordinate.y) && (this.state.dismissed = !1)
        }
    }, {
        key: "render",
        value: function() {
            var r = this
              , i = this.props
              , a = i.active
              , o = i.allowEscapeViewBox
              , s = i.animationDuration
              , l = i.animationEasing
              , c = i.children
              , u = i.coordinate
              , f = i.hasPayload
              , h = i.isAnimationActive
              , d = i.offset
              , p = i.position
              , g = i.reverseDirection
              , m = i.useTranslate3d
              , v = i.viewBox
              , b = i.wrapperStyle
              , x = R0({
                allowEscapeViewBox: o,
                coordinate: u,
                offsetTopLeft: d,
                position: p,
                reverseDirection: g,
                tooltipBox: this.state.lastBoundingBox,
                useTranslate3d: m,
                viewBox: v
            })
              , w = x.cssClasses
              , y = x.cssProperties
              , O = lu(lu({
                transition: h && a ? "transform ".concat(s, "ms ").concat(l) : void 0
            }, y), {}, {
                pointerEvents: "none",
                visibility: !this.state.dismissed && a && f ? "visible" : "hidden",
                position: "absolute",
                top: 0,
                left: 0
            }, b);
            return A.createElement("div", {
                tabIndex: -1,
                className: w,
                style: O,
                ref: function(P) {
                    r.wrapperNode = P
                }
            }, c)
        }
    }])
}(N.PureComponent)
  , G0 = function() {
    return !(typeof window < "u" && window.document && window.document.createElement && window.setTimeout)
}
  , de = {
    isSsr: G0()
};
function Sn(e) {
    "@babel/helpers - typeof";
    return Sn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Sn(e)
}
function uu(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function fu(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? uu(Object(n), !0).forEach(function(r) {
            ll(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : uu(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function U0(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function Y0(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, Bd(r.key), r)
    }
}
function q0(e, t, n) {
    return t && Y0(e.prototype, t),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function Z0(e, t, n) {
    return t = ta(t),
    J0(e, Rd() ? Reflect.construct(t, n || [], ta(e).constructor) : t.apply(e, n))
}
function J0(e, t) {
    if (t && (Sn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return Q0(e)
}
function Q0(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function Rd() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (Rd = function() {
        return !!e
    }
    )()
}
function ta(e) {
    return ta = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    ta(e)
}
function tO(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && qo(e, t)
}
function qo(e, t) {
    return qo = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    qo(e, t)
}
function ll(e, t, n) {
    return t = Bd(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function Bd(e) {
    var t = eO(e, "string");
    return Sn(t) == "symbol" ? t : t + ""
}
function eO(e, t) {
    if (Sn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Sn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
function nO(e) {
    return e.dataKey
}
function rO(e, t) {
    return A.isValidElement(e) ? A.cloneElement(e, t) : typeof e == "function" ? A.createElement(e, t) : A.createElement(j0, t)
}
var ie = function(e) {
    function t() {
        return U0(this, t),
        Z0(this, t, arguments)
    }
    return tO(t, e),
    q0(t, [{
        key: "render",
        value: function() {
            var r = this
              , i = this.props
              , a = i.active
              , o = i.allowEscapeViewBox
              , s = i.animationDuration
              , l = i.animationEasing
              , c = i.content
              , u = i.coordinate
              , f = i.filterNull
              , h = i.isAnimationActive
              , d = i.offset
              , p = i.payload
              , g = i.payloadUniqBy
              , m = i.position
              , v = i.reverseDirection
              , b = i.useTranslate3d
              , x = i.viewBox
              , w = i.wrapperStyle
              , y = p ?? [];
            f && y.length && (y = Cd(p.filter(function(_) {
                return _.value != null && (_.hide !== !0 || r.props.includeHidden)
            }), g, nO));
            var O = y.length > 0;
            return A.createElement(X0, {
                allowEscapeViewBox: o,
                animationDuration: s,
                animationEasing: l,
                isAnimationActive: h,
                active: a,
                coordinate: u,
                hasPayload: O,
                offset: d,
                position: m,
                reverseDirection: v,
                useTranslate3d: b,
                viewBox: x,
                wrapperStyle: w
            }, rO(c, fu(fu({}, this.props), {}, {
                payload: y
            })))
        }
    }])
}(N.PureComponent);
ll(ie, "displayName", "Tooltip");
ll(ie, "defaultProps", {
    accessibilityLayer: !1,
    allowEscapeViewBox: {
        x: !1,
        y: !1
    },
    animationDuration: 400,
    animationEasing: "ease",
    contentStyle: {},
    coordinate: {
        x: 0,
        y: 0
    },
    cursor: !0,
    cursorStyle: {},
    filterNull: !0,
    isAnimationActive: !de.isSsr,
    itemStyle: {},
    labelStyle: {},
    offset: 10,
    reverseDirection: {
        x: !1,
        y: !1
    },
    separator: " : ",
    trigger: "hover",
    useTranslate3d: !1,
    viewBox: {
        x: 0,
        y: 0,
        height: 0,
        width: 0
    },
    wrapperStyle: {}
});
function Br(e) {
    "@babel/helpers - typeof";
    return Br = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Br(e)
}
function hu(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function Ei(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? hu(Object(n), !0).forEach(function(r) {
            iO(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : hu(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function iO(e, t, n) {
    return t = aO(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function aO(e) {
    var t = oO(e, "string");
    return Br(t) == "symbol" ? t : t + ""
}
function oO(e, t) {
    if (Br(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Br(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
function sO(e, t) {
    return fO(e) || uO(e, t) || cO(e, t) || lO()
}
function lO() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function cO(e, t) {
    if (e) {
        if (typeof e == "string")
            return du(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return du(e, t)
    }
}
function du(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
function uO(e, t) {
    var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
    if (n != null) {
        var r, i, a, o, s = [], l = !0, c = !1;
        try {
            if (a = (n = n.call(e)).next,
            t !== 0)
                for (; !(l = (r = a.call(n)).done) && (s.push(r.value),
                s.length !== t); l = !0)
                    ;
        } catch (u) {
            c = !0,
            i = u
        } finally {
            try {
                if (!l && n.return != null && (o = n.return(),
                Object(o) !== o))
                    return
            } finally {
                if (c)
                    throw i
            }
        }
        return s
    }
}
function fO(e) {
    if (Array.isArray(e))
        return e
}
var RM = N.forwardRef(function(e, t) {
    var n = e.aspect
      , r = e.initialDimension
      , i = r === void 0 ? {
        width: -1,
        height: -1
    } : r
      , a = e.width
      , o = a === void 0 ? "100%" : a
      , s = e.height
      , l = s === void 0 ? "100%" : s
      , c = e.minWidth
      , u = c === void 0 ? 0 : c
      , f = e.minHeight
      , h = e.maxHeight
      , d = e.children
      , p = e.debounce
      , g = p === void 0 ? 0 : p
      , m = e.id
      , v = e.className
      , b = e.onResize
      , x = e.style
      , w = x === void 0 ? {} : x
      , y = N.useRef(null)
      , O = N.useRef();
    O.current = b,
    N.useImperativeHandle(t, function() {
        return Object.defineProperty(y.current, "current", {
            get: function() {
                return console.warn("The usage of ref.current.current is deprecated and will no longer be supported."),
                y.current
            },
            configurable: !0
        })
    });
    var _ = N.useState({
        containerWidth: i.width,
        containerHeight: i.height
    })
      , P = sO(_, 2)
      , S = P[0]
      , k = P[1]
      , E = N.useCallback(function(C, I) {
        k(function(T) {
            var j = Math.round(C)
              , $ = Math.round(I);
            return T.containerWidth === j && T.containerHeight === $ ? T : {
                containerWidth: j,
                containerHeight: $
            }
        })
    }, []);
    N.useEffect(function() {
        var C = function(B) {
            var W, V = B[0].contentRect, z = V.width, H = V.height;
            E(z, H),
            (W = O.current) === null || W === void 0 || W.call(O, z, H)
        };
        g > 0 && (C = nh(C, g, {
            trailing: !0,
            leading: !1
        }));
        var I = new ResizeObserver(C)
          , T = y.current.getBoundingClientRect()
          , j = T.width
          , $ = T.height;
        return E(j, $),
        I.observe(y.current),
        function() {
            I.disconnect()
        }
    }, [E, g]);
    var M = N.useMemo(function() {
        var C = S.containerWidth
          , I = S.containerHeight;
        if (C < 0 || I < 0)
            return null;
        Gt(He(o) || He(l), `The width(%s) and height(%s) are both fixed numbers,
       maybe you don't need to use a ResponsiveContainer.`, o, l),
        Gt(!n || n > 0, "The aspect(%s) must be greater than zero.", n);
        var T = He(o) ? C : o
          , j = He(l) ? I : l;
        n && n > 0 && (T ? j = T / n : j && (T = j * n),
        h && j > h && (j = h)),
        Gt(T > 0 || j > 0, `The width(%s) and height(%s) of chart should be greater than 0,
       please check the style of container, or the props width(%s) and height(%s),
       or add a minWidth(%s) or minHeight(%s) or use aspect(%s) to control the
       height and width.`, T, j, o, l, u, f, n);
        var $ = !Array.isArray(d) && ue(d.type).endsWith("Chart");
        return A.Children.map(d, function(R) {
            return A.isValidElement(R) ? N.cloneElement(R, Ei({
                width: T,
                height: j
            }, $ ? {
                style: Ei({
                    height: "100%",
                    width: "100%",
                    maxHeight: j,
                    maxWidth: T
                }, R.props.style)
            } : {})) : R
        })
    }, [n, d, l, h, f, u, S, o]);
    return A.createElement("div", {
        id: m ? "".concat(m) : void 0,
        className: U("recharts-responsive-container", v),
        style: Ei(Ei({}, w), {}, {
            width: o,
            height: l,
            minWidth: u,
            minHeight: f,
            maxHeight: h
        }),
        ref: y
    }, M)
})
  , Na = function(t) {
    return null
};
Na.displayName = "Cell";
function Nr(e) {
    "@babel/helpers - typeof";
    return Nr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Nr(e)
}
function pu(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function Zo(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? pu(Object(n), !0).forEach(function(r) {
            hO(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : pu(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function hO(e, t, n) {
    return t = dO(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function dO(e) {
    var t = pO(e, "string");
    return Nr(t) == "symbol" ? t : t + ""
}
function pO(e, t) {
    if (Nr(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Nr(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
var ln = {
    widthCache: {},
    cacheCount: 0
}
  , gO = 2e3
  , mO = {
    position: "absolute",
    top: "-20000px",
    left: 0,
    padding: 0,
    margin: 0,
    border: "none",
    whiteSpace: "pre"
}
  , gu = "recharts_measurement_span";
function yO(e) {
    var t = Zo({}, e);
    return Object.keys(t).forEach(function(n) {
        t[n] || delete t[n]
    }),
    t
}
var Or = function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (t == null || de.isSsr)
        return {
            width: 0,
            height: 0
        };
    var r = yO(n)
      , i = JSON.stringify({
        text: t,
        copyStyle: r
    });
    if (ln.widthCache[i])
        return ln.widthCache[i];
    try {
        var a = document.getElementById(gu);
        a || (a = document.createElement("span"),
        a.setAttribute("id", gu),
        a.setAttribute("aria-hidden", "true"),
        document.body.appendChild(a));
        var o = Zo(Zo({}, mO), r);
        Object.assign(a.style, o),
        a.textContent = "".concat(t);
        var s = a.getBoundingClientRect()
          , l = {
            width: s.width,
            height: s.height
        };
        return ln.widthCache[i] = l,
        ++ln.cacheCount > gO && (ln.cacheCount = 0,
        ln.widthCache = {}),
        l
    } catch {
        return {
            width: 0,
            height: 0
        }
    }
}
  , vO = function(t) {
    return {
        top: t.top + window.scrollY - document.documentElement.clientTop,
        left: t.left + window.scrollX - document.documentElement.clientLeft
    }
};
function zr(e) {
    "@babel/helpers - typeof";
    return zr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    zr(e)
}
function ea(e, t) {
    return wO(e) || OO(e, t) || xO(e, t) || bO()
}
function bO() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function xO(e, t) {
    if (e) {
        if (typeof e == "string")
            return mu(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return mu(e, t)
    }
}
function mu(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
function OO(e, t) {
    var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
    if (n != null) {
        var r, i, a, o, s = [], l = !0, c = !1;
        try {
            if (a = (n = n.call(e)).next,
            t === 0) {
                if (Object(n) !== n)
                    return;
                l = !1
            } else
                for (; !(l = (r = a.call(n)).done) && (s.push(r.value),
                s.length !== t); l = !0)
                    ;
        } catch (u) {
            c = !0,
            i = u
        } finally {
            try {
                if (!l && n.return != null && (o = n.return(),
                Object(o) !== o))
                    return
            } finally {
                if (c)
                    throw i
            }
        }
        return s
    }
}
function wO(e) {
    if (Array.isArray(e))
        return e
}
function _O(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function yu(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, AO(r.key), r)
    }
}
function PO(e, t, n) {
    return t && yu(e.prototype, t),
    n && yu(e, n),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function AO(e) {
    var t = SO(e, "string");
    return zr(t) == "symbol" ? t : t + ""
}
function SO(e, t) {
    if (zr(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (zr(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var vu = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([*/])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/
  , bu = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([+-])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/
  , kO = /^px|cm|vh|vw|em|rem|%|mm|in|pt|pc|ex|ch|vmin|vmax|Q$/
  , EO = /(-?\d+(?:\.\d+)?)([a-zA-Z%]+)?/
  , Nd = {
    cm: 96 / 2.54,
    mm: 96 / 25.4,
    pt: 96 / 72,
    pc: 96 / 6,
    in: 96,
    Q: 96 / (2.54 * 40),
    px: 1
}
  , MO = Object.keys(Nd)
  , fn = "NaN";
function TO(e, t) {
    return e * Nd[t]
}
var Mi = function() {
    function e(t, n) {
        _O(this, e),
        this.num = t,
        this.unit = n,
        this.num = t,
        this.unit = n,
        Number.isNaN(t) && (this.unit = ""),
        n !== "" && !kO.test(n) && (this.num = NaN,
        this.unit = ""),
        MO.includes(n) && (this.num = TO(t, n),
        this.unit = "px")
    }
    return PO(e, [{
        key: "add",
        value: function(n) {
            return this.unit !== n.unit ? new e(NaN,"") : new e(this.num + n.num,this.unit)
        }
    }, {
        key: "subtract",
        value: function(n) {
            return this.unit !== n.unit ? new e(NaN,"") : new e(this.num - n.num,this.unit)
        }
    }, {
        key: "multiply",
        value: function(n) {
            return this.unit !== "" && n.unit !== "" && this.unit !== n.unit ? new e(NaN,"") : new e(this.num * n.num,this.unit || n.unit)
        }
    }, {
        key: "divide",
        value: function(n) {
            return this.unit !== "" && n.unit !== "" && this.unit !== n.unit ? new e(NaN,"") : new e(this.num / n.num,this.unit || n.unit)
        }
    }, {
        key: "toString",
        value: function() {
            return "".concat(this.num).concat(this.unit)
        }
    }, {
        key: "isNaN",
        value: function() {
            return Number.isNaN(this.num)
        }
    }], [{
        key: "parse",
        value: function(n) {
            var r, i = (r = EO.exec(n)) !== null && r !== void 0 ? r : [], a = ea(i, 3), o = a[1], s = a[2];
            return new e(parseFloat(o),s ?? "")
        }
    }])
}();
function zd(e) {
    if (e.includes(fn))
        return fn;
    for (var t = e; t.includes("*") || t.includes("/"); ) {
        var n, r = (n = vu.exec(t)) !== null && n !== void 0 ? n : [], i = ea(r, 4), a = i[1], o = i[2], s = i[3], l = Mi.parse(a ?? ""), c = Mi.parse(s ?? ""), u = o === "*" ? l.multiply(c) : l.divide(c);
        if (u.isNaN())
            return fn;
        t = t.replace(vu, u.toString())
    }
    for (; t.includes("+") || /.-\d+(?:\.\d+)?/.test(t); ) {
        var f, h = (f = bu.exec(t)) !== null && f !== void 0 ? f : [], d = ea(h, 4), p = d[1], g = d[2], m = d[3], v = Mi.parse(p ?? ""), b = Mi.parse(m ?? ""), x = g === "+" ? v.add(b) : v.subtract(b);
        if (x.isNaN())
            return fn;
        t = t.replace(bu, x.toString())
    }
    return t
}
var xu = /\(([^()]*)\)/;
function jO(e) {
    for (var t = e; t.includes("("); ) {
        var n = xu.exec(t)
          , r = ea(n, 2)
          , i = r[1];
        t = t.replace(xu, zd(i))
    }
    return t
}
function CO(e) {
    var t = e.replace(/\s+/g, "");
    return t = jO(t),
    t = zd(t),
    t
}
function DO(e) {
    try {
        return CO(e)
    } catch {
        return fn
    }
}
function Oo(e) {
    var t = DO(e.slice(5, -1));
    return t === fn ? "" : t
}
var IO = ["x", "y", "lineHeight", "capHeight", "scaleToFit", "textAnchor", "verticalAnchor", "fill"]
  , $O = ["dx", "dy", "angle", "className", "breakAll"];
function Jo() {
    return Jo = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    Jo.apply(this, arguments)
}
function Ou(e, t) {
    if (e == null)
        return {};
    var n = LO(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function LO(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function wu(e, t) {
    return zO(e) || NO(e, t) || BO(e, t) || RO()
}
function RO() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function BO(e, t) {
    if (e) {
        if (typeof e == "string")
            return _u(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return _u(e, t)
    }
}
function _u(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
function NO(e, t) {
    var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
    if (n != null) {
        var r, i, a, o, s = [], l = !0, c = !1;
        try {
            if (a = (n = n.call(e)).next,
            t === 0) {
                if (Object(n) !== n)
                    return;
                l = !1
            } else
                for (; !(l = (r = a.call(n)).done) && (s.push(r.value),
                s.length !== t); l = !0)
                    ;
        } catch (u) {
            c = !0,
            i = u
        } finally {
            try {
                if (!l && n.return != null && (o = n.return(),
                Object(o) !== o))
                    return
            } finally {
                if (c)
                    throw i
            }
        }
        return s
    }
}
function zO(e) {
    if (Array.isArray(e))
        return e
}
var Fd = /[ \f\n\r\t\v\u2028\u2029]+/
  , Wd = function(t) {
    var n = t.children
      , r = t.breakAll
      , i = t.style;
    try {
        var a = [];
        X(n) || (r ? a = n.toString().split("") : a = n.toString().split(Fd));
        var o = a.map(function(l) {
            return {
                word: l,
                width: Or(l, i).width
            }
        })
          , s = r ? 0 : Or(" ", i).width;
        return {
            wordsWithComputedWidth: o,
            spaceWidth: s
        }
    } catch {
        return null
    }
}
  , FO = function(t, n, r, i, a) {
    var o = t.maxLines
      , s = t.children
      , l = t.style
      , c = t.breakAll
      , u = L(o)
      , f = s
      , h = function() {
        var T = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
        return T.reduce(function(j, $) {
            var R = $.word
              , B = $.width
              , W = j[j.length - 1];
            if (W && (i == null || a || W.width + B + r < Number(i)))
                W.words.push(R),
                W.width += B + r;
            else {
                var V = {
                    words: [R],
                    width: B
                };
                j.push(V)
            }
            return j
        }, [])
    }
      , d = h(n)
      , p = function(T) {
        return T.reduce(function(j, $) {
            return j.width > $.width ? j : $
        })
    };
    if (!u)
        return d;
    for (var g = "…", m = function(T) {
        var j = f.slice(0, T)
          , $ = Wd({
            breakAll: c,
            style: l,
            children: j + g
        }).wordsWithComputedWidth
          , R = h($)
          , B = R.length > o || p(R).width > Number(i);
        return [B, R]
    }, v = 0, b = f.length - 1, x = 0, w; v <= b && x <= f.length - 1; ) {
        var y = Math.floor((v + b) / 2)
          , O = y - 1
          , _ = m(O)
          , P = wu(_, 2)
          , S = P[0]
          , k = P[1]
          , E = m(y)
          , M = wu(E, 1)
          , C = M[0];
        if (!S && !C && (v = y + 1),
        S && C && (b = y - 1),
        !S && C) {
            w = k;
            break
        }
        x++
    }
    return w || d
}
  , Pu = function(t) {
    var n = X(t) ? [] : t.toString().split(Fd);
    return [{
        words: n
    }]
}
  , WO = function(t) {
    var n = t.width
      , r = t.scaleToFit
      , i = t.children
      , a = t.style
      , o = t.breakAll
      , s = t.maxLines;
    if ((n || r) && !de.isSsr) {
        var l, c, u = Wd({
            breakAll: o,
            children: i,
            style: a
        });
        if (u) {
            var f = u.wordsWithComputedWidth
              , h = u.spaceWidth;
            l = f,
            c = h
        } else
            return Pu(i);
        return FO({
            breakAll: o,
            children: i,
            maxLines: s,
            style: a
        }, l, c, n, r)
    }
    return Pu(i)
}
  , Au = "#808080"
  , Qe = function(t) {
    var n = t.x
      , r = n === void 0 ? 0 : n
      , i = t.y
      , a = i === void 0 ? 0 : i
      , o = t.lineHeight
      , s = o === void 0 ? "1em" : o
      , l = t.capHeight
      , c = l === void 0 ? "0.71em" : l
      , u = t.scaleToFit
      , f = u === void 0 ? !1 : u
      , h = t.textAnchor
      , d = h === void 0 ? "start" : h
      , p = t.verticalAnchor
      , g = p === void 0 ? "end" : p
      , m = t.fill
      , v = m === void 0 ? Au : m
      , b = Ou(t, IO)
      , x = N.useMemo(function() {
        return WO({
            breakAll: b.breakAll,
            children: b.children,
            maxLines: b.maxLines,
            scaleToFit: f,
            style: b.style,
            width: b.width
        })
    }, [b.breakAll, b.children, b.maxLines, f, b.style, b.width])
      , w = b.dx
      , y = b.dy
      , O = b.angle
      , _ = b.className
      , P = b.breakAll
      , S = Ou(b, $O);
    if (!bt(r) || !bt(a))
        return null;
    var k = r + (L(w) ? w : 0), E = a + (L(y) ? y : 0), M;
    switch (g) {
    case "start":
        M = Oo("calc(".concat(c, ")"));
        break;
    case "middle":
        M = Oo("calc(".concat((x.length - 1) / 2, " * -").concat(s, " + (").concat(c, " / 2))"));
        break;
    default:
        M = Oo("calc(".concat(x.length - 1, " * -").concat(s, ")"));
        break
    }
    var C = [];
    if (f) {
        var I = x[0].width
          , T = b.width;
        C.push("scale(".concat((L(T) ? T / I : 1) / I, ")"))
    }
    return O && C.push("rotate(".concat(O, ", ").concat(k, ", ").concat(E, ")")),
    C.length && (S.transform = C.join(" ")),
    A.createElement("text", Jo({}, F(S, !0), {
        x: k,
        y: E,
        className: U("recharts-text", _),
        textAnchor: d,
        fill: v.includes("url") ? Au : v
    }), x.map(function(j, $) {
        var R = j.words.join(P ? "" : " ");
        return A.createElement("tspan", {
            x: k,
            dy: $ === 0 ? M : s,
            key: "".concat(R, "-").concat($)
        }, R)
    }))
};
function VO(e) {
    return GO(e) || XO(e) || KO(e) || HO()
}
function HO() {
    throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function KO(e, t) {
    if (e) {
        if (typeof e == "string")
            return Qo(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return Qo(e, t)
    }
}
function XO(e) {
    if (typeof Symbol < "u" && Symbol.iterator in Object(e))
        return Array.from(e)
}
function GO(e) {
    if (Array.isArray(e))
        return Qo(e)
}
function Qo(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
var UO = function(t) {
    return t
}
  , Vd = {}
  , Hd = function(t) {
    return t === Vd
}
  , Su = function(t) {
    return function n() {
        return arguments.length === 0 || arguments.length === 1 && Hd(arguments.length <= 0 ? void 0 : arguments[0]) ? n : t.apply(void 0, arguments)
    }
}
  , YO = function e(t, n) {
    return t === 1 ? n : Su(function() {
        for (var r = arguments.length, i = new Array(r), a = 0; a < r; a++)
            i[a] = arguments[a];
        var o = i.filter(function(s) {
            return s !== Vd
        }).length;
        return o >= t ? n.apply(void 0, i) : e(t - o, Su(function() {
            for (var s = arguments.length, l = new Array(s), c = 0; c < s; c++)
                l[c] = arguments[c];
            var u = i.map(function(f) {
                return Hd(f) ? l.shift() : f
            });
            return n.apply(void 0, VO(u).concat(l))
        }))
    })
}
  , za = function(t) {
    return YO(t.length, t)
}
  , ts = function(t, n) {
    for (var r = [], i = t; i < n; ++i)
        r[i - t] = i;
    return r
}
  , qO = za(function(e, t) {
    return Array.isArray(t) ? t.map(e) : Object.keys(t).map(function(n) {
        return t[n]
    }).map(e)
})
  , ZO = function() {
    for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
        n[r] = arguments[r];
    if (!n.length)
        return UO;
    var i = n.reverse()
      , a = i[0]
      , o = i.slice(1);
    return function() {
        return o.reduce(function(s, l) {
            return l(s)
        }, a.apply(void 0, arguments))
    }
}
  , es = function(t) {
    return Array.isArray(t) ? t.reverse() : t.split("").reverse.join("")
}
  , Kd = function(t) {
    var n = null
      , r = null;
    return function() {
        for (var i = arguments.length, a = new Array(i), o = 0; o < i; o++)
            a[o] = arguments[o];
        return n && a.every(function(s, l) {
            return s === n[l]
        }) || (n = a,
        r = t.apply(void 0, a)),
        r
    }
};
function JO(e) {
    var t;
    return e === 0 ? t = 1 : t = Math.floor(new et(e).abs().log(10).toNumber()) + 1,
    t
}
function QO(e, t, n) {
    for (var r = new et(e), i = 0, a = []; r.lt(t) && i < 1e5; )
        a.push(r.toNumber()),
        r = r.add(n),
        i++;
    return a
}
var tw = za(function(e, t, n) {
    var r = +e
      , i = +t;
    return r + n * (i - r)
})
  , ew = za(function(e, t, n) {
    var r = t - +e;
    return r = r || 1 / 0,
    (n - e) / r
})
  , nw = za(function(e, t, n) {
    var r = t - +e;
    return r = r || 1 / 0,
    Math.max(0, Math.min(1, (n - e) / r))
});
const Fa = {
    rangeStep: QO,
    getDigitCount: JO,
    interpolateNumber: tw,
    uninterpolateNumber: ew,
    uninterpolateTruncation: nw
};
function ns(e) {
    return aw(e) || iw(e) || Xd(e) || rw()
}
function rw() {
    throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function iw(e) {
    if (typeof Symbol < "u" && Symbol.iterator in Object(e))
        return Array.from(e)
}
function aw(e) {
    if (Array.isArray(e))
        return rs(e)
}
function Fr(e, t) {
    return lw(e) || sw(e, t) || Xd(e, t) || ow()
}
function ow() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function Xd(e, t) {
    if (e) {
        if (typeof e == "string")
            return rs(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return rs(e, t)
    }
}
function rs(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
function sw(e, t) {
    if (!(typeof Symbol > "u" || !(Symbol.iterator in Object(e)))) {
        var n = []
          , r = !0
          , i = !1
          , a = void 0;
        try {
            for (var o = e[Symbol.iterator](), s; !(r = (s = o.next()).done) && (n.push(s.value),
            !(t && n.length === t)); r = !0)
                ;
        } catch (l) {
            i = !0,
            a = l
        } finally {
            try {
                !r && o.return != null && o.return()
            } finally {
                if (i)
                    throw a
            }
        }
        return n
    }
}
function lw(e) {
    if (Array.isArray(e))
        return e
}
function Gd(e) {
    var t = Fr(e, 2)
      , n = t[0]
      , r = t[1]
      , i = n
      , a = r;
    return n > r && (i = r,
    a = n),
    [i, a]
}
function Ud(e, t, n) {
    if (e.lte(0))
        return new et(0);
    var r = Fa.getDigitCount(e.toNumber())
      , i = new et(10).pow(r)
      , a = e.div(i)
      , o = r !== 1 ? .05 : .1
      , s = new et(Math.ceil(a.div(o).toNumber())).add(n).mul(o)
      , l = s.mul(i);
    return t ? l : new et(Math.ceil(l))
}
function cw(e, t, n) {
    var r = 1
      , i = new et(e);
    if (!i.isint() && n) {
        var a = Math.abs(e);
        a < 1 ? (r = new et(10).pow(Fa.getDigitCount(e) - 1),
        i = new et(Math.floor(i.div(r).toNumber())).mul(r)) : a > 1 && (i = new et(Math.floor(e)))
    } else
        e === 0 ? i = new et(Math.floor((t - 1) / 2)) : n || (i = new et(Math.floor(e)));
    var o = Math.floor((t - 1) / 2)
      , s = ZO(qO(function(l) {
        return i.add(new et(l - o).mul(r)).toNumber()
    }), ts);
    return s(0, t)
}
function Yd(e, t, n, r) {
    var i = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0;
    if (!Number.isFinite((t - e) / (n - 1)))
        return {
            step: new et(0),
            tickMin: new et(0),
            tickMax: new et(0)
        };
    var a = Ud(new et(t).sub(e).div(n - 1), r, i), o;
    e <= 0 && t >= 0 ? o = new et(0) : (o = new et(e).add(t).div(2),
    o = o.sub(new et(o).mod(a)));
    var s = Math.ceil(o.sub(e).div(a).toNumber())
      , l = Math.ceil(new et(t).sub(o).div(a).toNumber())
      , c = s + l + 1;
    return c > n ? Yd(e, t, n, r, i + 1) : (c < n && (l = t > 0 ? l + (n - c) : l,
    s = t > 0 ? s : s + (n - c)),
    {
        step: a,
        tickMin: o.sub(new et(s).mul(a)),
        tickMax: o.add(new et(l).mul(a))
    })
}
function uw(e) {
    var t = Fr(e, 2)
      , n = t[0]
      , r = t[1]
      , i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 6
      , a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0
      , o = Math.max(i, 2)
      , s = Gd([n, r])
      , l = Fr(s, 2)
      , c = l[0]
      , u = l[1];
    if (c === -1 / 0 || u === 1 / 0) {
        var f = u === 1 / 0 ? [c].concat(ns(ts(0, i - 1).map(function() {
            return 1 / 0
        }))) : [].concat(ns(ts(0, i - 1).map(function() {
            return -1 / 0
        })), [u]);
        return n > r ? es(f) : f
    }
    if (c === u)
        return cw(c, i, a);
    var h = Yd(c, u, o, a)
      , d = h.step
      , p = h.tickMin
      , g = h.tickMax
      , m = Fa.rangeStep(p, g.add(new et(.1).mul(d)), d);
    return n > r ? es(m) : m
}
function fw(e, t) {
    var n = Fr(e, 2)
      , r = n[0]
      , i = n[1]
      , a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0
      , o = Gd([r, i])
      , s = Fr(o, 2)
      , l = s[0]
      , c = s[1];
    if (l === -1 / 0 || c === 1 / 0)
        return [r, i];
    if (l === c)
        return [l];
    var u = Math.max(t, 2)
      , f = Ud(new et(c).sub(l).div(u - 1), a, 0)
      , h = [].concat(ns(Fa.rangeStep(new et(l), new et(c).sub(new et(.99).mul(f)), f)), [c]);
    return r > i ? es(h) : h
}
var hw = Kd(uw)
  , dw = Kd(fw)
  , pw = ["offset", "layout", "width", "dataKey", "data", "dataPointFormatter", "xAxis", "yAxis"];
function kn(e) {
    "@babel/helpers - typeof";
    return kn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    kn(e)
}
function na() {
    return na = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    na.apply(this, arguments)
}
function gw(e, t) {
    return bw(e) || vw(e, t) || yw(e, t) || mw()
}
function mw() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function yw(e, t) {
    if (e) {
        if (typeof e == "string")
            return ku(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return ku(e, t)
    }
}
function ku(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
function vw(e, t) {
    var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
    if (n != null) {
        var r, i, a, o, s = [], l = !0, c = !1;
        try {
            if (a = (n = n.call(e)).next,
            t !== 0)
                for (; !(l = (r = a.call(n)).done) && (s.push(r.value),
                s.length !== t); l = !0)
                    ;
        } catch (u) {
            c = !0,
            i = u
        } finally {
            try {
                if (!l && n.return != null && (o = n.return(),
                Object(o) !== o))
                    return
            } finally {
                if (c)
                    throw i
            }
        }
        return s
    }
}
function bw(e) {
    if (Array.isArray(e))
        return e
}
function xw(e, t) {
    if (e == null)
        return {};
    var n = Ow(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function Ow(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function ww(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function _w(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, Jd(r.key), r)
    }
}
function Pw(e, t, n) {
    return t && _w(e.prototype, t),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function Aw(e, t, n) {
    return t = ra(t),
    Sw(e, qd() ? Reflect.construct(t, n || [], ra(e).constructor) : t.apply(e, n))
}
function Sw(e, t) {
    if (t && (kn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return kw(e)
}
function kw(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function qd() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (qd = function() {
        return !!e
    }
    )()
}
function ra(e) {
    return ra = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    ra(e)
}
function Ew(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && is(e, t)
}
function is(e, t) {
    return is = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    is(e, t)
}
function Zd(e, t, n) {
    return t = Jd(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function Jd(e) {
    var t = Mw(e, "string");
    return kn(t) == "symbol" ? t : t + ""
}
function Mw(e, t) {
    if (kn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (kn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var Yn = function(e) {
    function t() {
        return ww(this, t),
        Aw(this, t, arguments)
    }
    return Ew(t, e),
    Pw(t, [{
        key: "render",
        value: function() {
            var r = this.props
              , i = r.offset
              , a = r.layout
              , o = r.width
              , s = r.dataKey
              , l = r.data
              , c = r.dataPointFormatter
              , u = r.xAxis
              , f = r.yAxis
              , h = xw(r, pw)
              , d = F(h, !1);
            this.props.direction === "x" && u.type !== "number" && qe();
            var p = l.map(function(g) {
                var m = c(g, s)
                  , v = m.x
                  , b = m.y
                  , x = m.value
                  , w = m.errorVal;
                if (!w)
                    return null;
                var y = [], O, _;
                if (Array.isArray(w)) {
                    var P = gw(w, 2);
                    O = P[0],
                    _ = P[1]
                } else
                    O = _ = w;
                if (a === "vertical") {
                    var S = u.scale
                      , k = b + i
                      , E = k + o
                      , M = k - o
                      , C = S(x - O)
                      , I = S(x + _);
                    y.push({
                        x1: I,
                        y1: E,
                        x2: I,
                        y2: M
                    }),
                    y.push({
                        x1: C,
                        y1: k,
                        x2: I,
                        y2: k
                    }),
                    y.push({
                        x1: C,
                        y1: E,
                        x2: C,
                        y2: M
                    })
                } else if (a === "horizontal") {
                    var T = f.scale
                      , j = v + i
                      , $ = j - o
                      , R = j + o
                      , B = T(x - O)
                      , W = T(x + _);
                    y.push({
                        x1: $,
                        y1: W,
                        x2: R,
                        y2: W
                    }),
                    y.push({
                        x1: j,
                        y1: B,
                        x2: j,
                        y2: W
                    }),
                    y.push({
                        x1: $,
                        y1: B,
                        x2: R,
                        y2: B
                    })
                }
                return A.createElement(q, na({
                    className: "recharts-errorBar",
                    key: "bar-".concat(y.map(function(V) {
                        return "".concat(V.x1, "-").concat(V.x2, "-").concat(V.y1, "-").concat(V.y2)
                    }))
                }, d), y.map(function(V) {
                    return A.createElement("line", na({}, V, {
                        key: "line-".concat(V.x1, "-").concat(V.x2, "-").concat(V.y1, "-").concat(V.y2)
                    }))
                }))
            });
            return A.createElement(q, {
                className: "recharts-errorBars"
            }, p)
        }
    }])
}(A.Component);
Zd(Yn, "defaultProps", {
    stroke: "black",
    strokeWidth: 1.5,
    width: 5,
    offset: 0,
    layout: "horizontal"
});
Zd(Yn, "displayName", "ErrorBar");
function Wr(e) {
    "@babel/helpers - typeof";
    return Wr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Wr(e)
}
function Eu(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function Be(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? Eu(Object(n), !0).forEach(function(r) {
            Tw(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Eu(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function Tw(e, t, n) {
    return t = jw(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function jw(e) {
    var t = Cw(e, "string");
    return Wr(t) == "symbol" ? t : t + ""
}
function Cw(e, t) {
    if (Wr(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Wr(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
var Qd = function(t) {
    var n = t.children
      , r = t.formattedGraphicalItems
      , i = t.legendWidth
      , a = t.legendContent
      , o = Lt(n, vn);
    if (!o)
        return null;
    var s = vn.defaultProps, l = s !== void 0 ? Be(Be({}, s), o.props) : {}, c;
    return o.props && o.props.payload ? c = o.props && o.props.payload : a === "children" ? c = (r || []).reduce(function(u, f) {
        var h = f.item
          , d = f.props
          , p = d.sectors || d.data || [];
        return u.concat(p.map(function(g) {
            return {
                type: o.props.iconType || h.props.legendType,
                value: g.name,
                color: g.fill,
                payload: g
            }
        }))
    }, []) : c = (r || []).map(function(u) {
        var f = u.item
          , h = f.type.defaultProps
          , d = h !== void 0 ? Be(Be({}, h), f.props) : {}
          , p = d.dataKey
          , g = d.name
          , m = d.legendType
          , v = d.hide;
        return {
            inactive: v,
            dataKey: p,
            type: l.iconType || m || "square",
            color: cl(f),
            value: g || p,
            payload: d
        }
    }),
    Be(Be(Be({}, l), vn.getWithHeight(o, i)), {}, {
        payload: c,
        item: o
    })
};
function Vr(e) {
    "@babel/helpers - typeof";
    return Vr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Vr(e)
}
function Mu(e) {
    return Lw(e) || $w(e) || Iw(e) || Dw()
}
function Dw() {
    throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function Iw(e, t) {
    if (e) {
        if (typeof e == "string")
            return as(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return as(e, t)
    }
}
function $w(e) {
    if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null)
        return Array.from(e)
}
function Lw(e) {
    if (Array.isArray(e))
        return as(e)
}
function as(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
function Tu(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function ht(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? Tu(Object(n), !0).forEach(function(r) {
            bn(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Tu(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function bn(e, t, n) {
    return t = Rw(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function Rw(e) {
    var t = Bw(e, "string");
    return Vr(t) == "symbol" ? t : t + ""
}
function Bw(e, t) {
    if (Vr(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Vr(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
function at(e, t, n) {
    return X(e) || X(t) ? n : bt(t) ? Bt(e, t, n) : K(t) ? t(e) : n
}
function wr(e, t, n, r) {
    var i = Cg(e, function(s) {
        return at(s, t)
    });
    if (n === "number") {
        var a = i.filter(function(s) {
            return L(s) || parseFloat(s)
        });
        return a.length ? [ja(a), me(a)] : [1 / 0, -1 / 0]
    }
    var o = r ? i.filter(function(s) {
        return !X(s)
    }) : i;
    return o.map(function(s) {
        return bt(s) || s instanceof Date ? s : ""
    })
}
var Nw = function(t) {
    var n, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [], i = arguments.length > 2 ? arguments[2] : void 0, a = arguments.length > 3 ? arguments[3] : void 0, o = -1, s = (n = r?.length) !== null && n !== void 0 ? n : 0;
    if (s <= 1)
        return 0;
    if (a && a.axisType === "angleAxis" && Math.abs(Math.abs(a.range[1] - a.range[0]) - 360) <= 1e-6)
        for (var l = a.range, c = 0; c < s; c++) {
            var u = c > 0 ? i[c - 1].coordinate : i[s - 1].coordinate
              , f = i[c].coordinate
              , h = c >= s - 1 ? i[0].coordinate : i[c + 1].coordinate
              , d = void 0;
            if (Et(f - u) !== Et(h - f)) {
                var p = [];
                if (Et(h - f) === Et(l[1] - l[0])) {
                    d = h;
                    var g = f + l[1] - l[0];
                    p[0] = Math.min(g, (g + u) / 2),
                    p[1] = Math.max(g, (g + u) / 2)
                } else {
                    d = u;
                    var m = h + l[1] - l[0];
                    p[0] = Math.min(f, (m + f) / 2),
                    p[1] = Math.max(f, (m + f) / 2)
                }
                var v = [Math.min(f, (d + f) / 2), Math.max(f, (d + f) / 2)];
                if (t > v[0] && t <= v[1] || t >= p[0] && t <= p[1]) {
                    o = i[c].index;
                    break
                }
            } else {
                var b = Math.min(u, h)
                  , x = Math.max(u, h);
                if (t > (b + f) / 2 && t <= (x + f) / 2) {
                    o = i[c].index;
                    break
                }
            }
        }
    else
        for (var w = 0; w < s; w++)
            if (w === 0 && t <= (r[w].coordinate + r[w + 1].coordinate) / 2 || w > 0 && w < s - 1 && t > (r[w].coordinate + r[w - 1].coordinate) / 2 && t <= (r[w].coordinate + r[w + 1].coordinate) / 2 || w === s - 1 && t > (r[w].coordinate + r[w - 1].coordinate) / 2) {
                o = r[w].index;
                break
            }
    return o
}
  , cl = function(t) {
    var n, r = t, i = r.type.displayName, a = (n = t.type) !== null && n !== void 0 && n.defaultProps ? ht(ht({}, t.type.defaultProps), t.props) : t.props, o = a.stroke, s = a.fill, l;
    switch (i) {
    case "Line":
        l = o;
        break;
    case "Area":
    case "Radar":
        l = o && o !== "none" ? o : s;
        break;
    default:
        l = s;
        break
    }
    return l
}
  , zw = function(t) {
    var n = t.barSize
      , r = t.totalSize
      , i = t.stackGroups
      , a = i === void 0 ? {} : i;
    if (!a)
        return {};
    for (var o = {}, s = Object.keys(a), l = 0, c = s.length; l < c; l++)
        for (var u = a[s[l]].stackGroups, f = Object.keys(u), h = 0, d = f.length; h < d; h++) {
            var p = u[f[h]]
              , g = p.items
              , m = p.cateAxisId
              , v = g.filter(function(_) {
                return ue(_.type).indexOf("Bar") >= 0
            });
            if (v && v.length) {
                var b = v[0].type.defaultProps
                  , x = b !== void 0 ? ht(ht({}, b), v[0].props) : v[0].props
                  , w = x.barSize
                  , y = x[m];
                o[y] || (o[y] = []);
                var O = X(w) ? n : w;
                o[y].push({
                    item: v[0],
                    stackList: v.slice(1),
                    barSize: X(O) ? void 0 : Mt(O, r, 0)
                })
            }
        }
    return o
}
  , Fw = function(t) {
    var n = t.barGap
      , r = t.barCategoryGap
      , i = t.bandSize
      , a = t.sizeList
      , o = a === void 0 ? [] : a
      , s = t.maxBarSize
      , l = o.length;
    if (l < 1)
        return null;
    var c = Mt(n, i, 0, !0), u, f = [];
    if (o[0].barSize === +o[0].barSize) {
        var h = !1
          , d = i / l
          , p = o.reduce(function(w, y) {
            return w + y.barSize || 0
        }, 0);
        p += (l - 1) * c,
        p >= i && (p -= (l - 1) * c,
        c = 0),
        p >= i && d > 0 && (h = !0,
        d *= .9,
        p = l * d);
        var g = (i - p) / 2 >> 0
          , m = {
            offset: g - c,
            size: 0
        };
        u = o.reduce(function(w, y) {
            var O = {
                item: y.item,
                position: {
                    offset: m.offset + m.size + c,
                    size: h ? d : y.barSize
                }
            }
              , _ = [].concat(Mu(w), [O]);
            return m = _[_.length - 1].position,
            y.stackList && y.stackList.length && y.stackList.forEach(function(P) {
                _.push({
                    item: P,
                    position: m
                })
            }),
            _
        }, f)
    } else {
        var v = Mt(r, i, 0, !0);
        i - 2 * v - (l - 1) * c <= 0 && (c = 0);
        var b = (i - 2 * v - (l - 1) * c) / l;
        b > 1 && (b >>= 0);
        var x = s === +s ? Math.min(b, s) : b;
        u = o.reduce(function(w, y, O) {
            var _ = [].concat(Mu(w), [{
                item: y.item,
                position: {
                    offset: v + (b + c) * O + (b - x) / 2,
                    size: x
                }
            }]);
            return y.stackList && y.stackList.length && y.stackList.forEach(function(P) {
                _.push({
                    item: P,
                    position: _[_.length - 1].position
                })
            }),
            _
        }, f)
    }
    return u
}
  , Ww = function(t, n, r, i) {
    var a = r.children
      , o = r.width
      , s = r.margin
      , l = o - (s.left || 0) - (s.right || 0)
      , c = Qd({
        children: a,
        legendWidth: l
    });
    if (c) {
        var u = i || {}
          , f = u.width
          , h = u.height
          , d = c.align
          , p = c.verticalAlign
          , g = c.layout;
        if ((g === "vertical" || g === "horizontal" && p === "middle") && d !== "center" && L(t[d]))
            return ht(ht({}, t), {}, bn({}, d, t[d] + (f || 0)));
        if ((g === "horizontal" || g === "vertical" && d === "center") && p !== "middle" && L(t[p]))
            return ht(ht({}, t), {}, bn({}, p, t[p] + (h || 0)))
    }
    return t
}
  , Vw = function(t, n, r) {
    return X(n) ? !0 : t === "horizontal" ? n === "yAxis" : t === "vertical" || r === "x" ? n === "xAxis" : r === "y" ? n === "yAxis" : !0
}
  , tp = function(t, n, r, i, a) {
    var o = n.props.children
      , s = Tt(o, Yn).filter(function(c) {
        return Vw(i, a, c.props.direction)
    });
    if (s && s.length) {
        var l = s.map(function(c) {
            return c.props.dataKey
        });
        return t.reduce(function(c, u) {
            var f = at(u, r);
            if (X(f))
                return c;
            var h = Array.isArray(f) ? [ja(f), me(f)] : [f, f]
              , d = l.reduce(function(p, g) {
                var m = at(u, g, 0)
                  , v = h[0] - Math.abs(Array.isArray(m) ? m[0] : m)
                  , b = h[1] + Math.abs(Array.isArray(m) ? m[1] : m);
                return [Math.min(v, p[0]), Math.max(b, p[1])]
            }, [1 / 0, -1 / 0]);
            return [Math.min(d[0], c[0]), Math.max(d[1], c[1])]
        }, [1 / 0, -1 / 0])
    }
    return null
}
  , Hw = function(t, n, r, i, a) {
    var o = n.map(function(s) {
        return tp(t, s, r, a, i)
    }).filter(function(s) {
        return !X(s)
    });
    return o && o.length ? o.reduce(function(s, l) {
        return [Math.min(s[0], l[0]), Math.max(s[1], l[1])]
    }, [1 / 0, -1 / 0]) : null
}
  , ep = function(t, n, r, i, a) {
    var o = n.map(function(l) {
        var c = l.props.dataKey;
        return r === "number" && c && tp(t, l, c, i) || wr(t, c, r, a)
    });
    if (r === "number")
        return o.reduce(function(l, c) {
            return [Math.min(l[0], c[0]), Math.max(l[1], c[1])]
        }, [1 / 0, -1 / 0]);
    var s = {};
    return o.reduce(function(l, c) {
        for (var u = 0, f = c.length; u < f; u++)
            s[c[u]] || (s[c[u]] = !0,
            l.push(c[u]));
        return l
    }, [])
}
  , np = function(t, n) {
    return t === "horizontal" && n === "xAxis" || t === "vertical" && n === "yAxis" || t === "centric" && n === "angleAxis" || t === "radial" && n === "radiusAxis"
}
  , rp = function(t, n, r, i) {
    if (i)
        return t.map(function(l) {
            return l.coordinate
        });
    var a, o, s = t.map(function(l) {
        return l.coordinate === n && (a = !0),
        l.coordinate === r && (o = !0),
        l.coordinate
    });
    return a || s.push(n),
    o || s.push(r),
    s
}
  , ce = function(t, n, r) {
    if (!t)
        return null;
    var i = t.scale
      , a = t.duplicateDomain
      , o = t.type
      , s = t.range
      , l = t.realScaleType === "scaleBand" ? i.bandwidth() / 2 : 2
      , c = (n || r) && o === "category" && i.bandwidth ? i.bandwidth() / l : 0;
    if (c = t.axisType === "angleAxis" && s?.length >= 2 ? Et(s[0] - s[1]) * 2 * c : c,
    n && (t.ticks || t.niceTicks)) {
        var u = (t.ticks || t.niceTicks).map(function(f) {
            var h = a ? a.indexOf(f) : f;
            return {
                coordinate: i(h) + c,
                value: f,
                offset: c
            }
        });
        return u.filter(function(f) {
            return !Gn(f.coordinate)
        })
    }
    return t.isCategorical && t.categoricalDomain ? t.categoricalDomain.map(function(f, h) {
        return {
            coordinate: i(f) + c,
            value: f,
            index: h,
            offset: c
        }
    }) : i.ticks && !r ? i.ticks(t.tickCount).map(function(f) {
        return {
            coordinate: i(f) + c,
            value: f,
            offset: c
        }
    }) : i.domain().map(function(f, h) {
        return {
            coordinate: i(f) + c,
            value: a ? a[f] : f,
            index: h,
            offset: c
        }
    })
}
  , wo = new WeakMap
  , Ti = function(t, n) {
    if (typeof n != "function")
        return t;
    wo.has(t) || wo.set(t, new WeakMap);
    var r = wo.get(t);
    if (r.has(n))
        return r.get(n);
    var i = function() {
        t.apply(void 0, arguments),
        n.apply(void 0, arguments)
    };
    return r.set(n, i),
    i
}
  , ip = function(t, n, r) {
    var i = t.scale
      , a = t.type
      , o = t.layout
      , s = t.axisType;
    if (i === "auto")
        return o === "radial" && s === "radiusAxis" ? {
            scale: _l(),
            realScaleType: "band"
        } : o === "radial" && s === "angleAxis" ? {
            scale: Pl(),
            realScaleType: "linear"
        } : a === "category" && n && (n.indexOf("LineChart") >= 0 || n.indexOf("AreaChart") >= 0 || n.indexOf("ComposedChart") >= 0 && !r) ? {
            scale: $i(),
            realScaleType: "point"
        } : a === "category" ? {
            scale: _l(),
            realScaleType: "band"
        } : {
            scale: Pl(),
            realScaleType: "linear"
        };
    if (Ye(i)) {
        var l = "scale".concat(Ta(i));
        return {
            scale: (Al[l] || $i)(),
            realScaleType: Al[l] ? l : "point"
        }
    }
    return K(i) ? {
        scale: i
    } : {
        scale: $i(),
        realScaleType: "point"
    }
}
  , ju = 1e-4
  , ap = function(t) {
    var n = t.domain();
    if (!(!n || n.length <= 2)) {
        var r = n.length
          , i = t.range()
          , a = Math.min(i[0], i[1]) - ju
          , o = Math.max(i[0], i[1]) + ju
          , s = t(n[0])
          , l = t(n[r - 1]);
        (s < a || s > o || l < a || l > o) && t.domain([n[0], n[r - 1]])
    }
}
  , Kw = function(t, n) {
    if (!t)
        return null;
    for (var r = 0, i = t.length; r < i; r++)
        if (t[r].item === n)
            return t[r].position;
    return null
}
  , Xw = function(t, n) {
    if (!n || n.length !== 2 || !L(n[0]) || !L(n[1]))
        return t;
    var r = Math.min(n[0], n[1])
      , i = Math.max(n[0], n[1])
      , a = [t[0], t[1]];
    return (!L(t[0]) || t[0] < r) && (a[0] = r),
    (!L(t[1]) || t[1] > i) && (a[1] = i),
    a[0] > i && (a[0] = i),
    a[1] < r && (a[1] = r),
    a
}
  , Gw = function(t) {
    var n = t.length;
    if (!(n <= 0))
        for (var r = 0, i = t[0].length; r < i; ++r)
            for (var a = 0, o = 0, s = 0; s < n; ++s) {
                var l = Gn(t[s][r][1]) ? t[s][r][0] : t[s][r][1];
                l >= 0 ? (t[s][r][0] = a,
                t[s][r][1] = a + l,
                a = t[s][r][1]) : (t[s][r][0] = o,
                t[s][r][1] = o + l,
                o = t[s][r][1])
            }
}
  , Uw = function(t) {
    var n = t.length;
    if (!(n <= 0))
        for (var r = 0, i = t[0].length; r < i; ++r)
            for (var a = 0, o = 0; o < n; ++o) {
                var s = Gn(t[o][r][1]) ? t[o][r][0] : t[o][r][1];
                s >= 0 ? (t[o][r][0] = a,
                t[o][r][1] = a + s,
                a = t[o][r][1]) : (t[o][r][0] = 0,
                t[o][r][1] = 0)
            }
}
  , Yw = {
    sign: Gw,
    expand: jg,
    none: Tg,
    silhouette: Mg,
    wiggle: Eg,
    positive: Uw
}
  , qw = function(t, n, r) {
    var i = n.map(function(s) {
        return s.props.dataKey
    })
      , a = Yw[r]
      , o = Sg().keys(i).value(function(s, l) {
        return +at(s, l, 0)
    }).order(kg).offset(a);
    return o(t)
}
  , Zw = function(t, n, r, i, a, o) {
    if (!t)
        return null;
    var s = o ? n.reverse() : n
      , l = {}
      , c = s.reduce(function(f, h) {
        var d, p = (d = h.type) !== null && d !== void 0 && d.defaultProps ? ht(ht({}, h.type.defaultProps), h.props) : h.props, g = p.stackId, m = p.hide;
        if (m)
            return f;
        var v = p[r]
          , b = f[v] || {
            hasStack: !1,
            stackGroups: {}
        };
        if (bt(g)) {
            var x = b.stackGroups[g] || {
                numericAxisId: r,
                cateAxisId: i,
                items: []
            };
            x.items.push(h),
            b.hasStack = !0,
            b.stackGroups[g] = x
        } else
            b.stackGroups[Ee("_stackId_")] = {
                numericAxisId: r,
                cateAxisId: i,
                items: [h]
            };
        return ht(ht({}, f), {}, bn({}, v, b))
    }, l)
      , u = {};
    return Object.keys(c).reduce(function(f, h) {
        var d = c[h];
        if (d.hasStack) {
            var p = {};
            d.stackGroups = Object.keys(d.stackGroups).reduce(function(g, m) {
                var v = d.stackGroups[m];
                return ht(ht({}, g), {}, bn({}, m, {
                    numericAxisId: r,
                    cateAxisId: i,
                    items: v.items,
                    stackedData: qw(t, v.items, a)
                }))
            }, p)
        }
        return ht(ht({}, f), {}, bn({}, h, d))
    }, u)
}
  , op = function(t, n) {
    var r = n.realScaleType
      , i = n.type
      , a = n.tickCount
      , o = n.originalDomain
      , s = n.allowDecimals
      , l = r || n.scale;
    if (l !== "auto" && l !== "linear")
        return null;
    if (a && i === "number" && o && (o[0] === "auto" || o[1] === "auto")) {
        var c = t.domain();
        if (!c.length)
            return null;
        var u = hw(c, a, s);
        return t.domain([ja(u), me(u)]),
        {
            niceTicks: u
        }
    }
    if (a && i === "number") {
        var f = t.domain()
          , h = dw(f, a, s);
        return {
            niceTicks: h
        }
    }
    return null
};
function En(e) {
    var t = e.axis
      , n = e.ticks
      , r = e.bandSize
      , i = e.entry
      , a = e.index
      , o = e.dataKey;
    if (t.type === "category") {
        if (!t.allowDuplicatedCategory && t.dataKey && !X(i[t.dataKey])) {
            var s = Yi(n, "value", i[t.dataKey]);
            if (s)
                return s.coordinate + r / 2
        }
        return n[a] ? n[a].coordinate + r / 2 : null
    }
    var l = at(i, X(o) ? t.dataKey : o);
    return X(l) ? null : t.scale(l)
}
var Cu = function(t) {
    var n = t.axis
      , r = t.ticks
      , i = t.offset
      , a = t.bandSize
      , o = t.entry
      , s = t.index;
    if (n.type === "category")
        return r[s] ? r[s].coordinate + i : null;
    var l = at(o, n.dataKey, n.domain[s]);
    return X(l) ? null : n.scale(l) - a / 2 + i
}
  , Jw = function(t) {
    var n = t.numericAxis
      , r = n.scale.domain();
    if (n.type === "number") {
        var i = Math.min(r[0], r[1])
          , a = Math.max(r[0], r[1]);
        return i <= 0 && a >= 0 ? 0 : a < 0 ? a : i
    }
    return r[0]
}
  , Qw = function(t, n) {
    var r, i = (r = t.type) !== null && r !== void 0 && r.defaultProps ? ht(ht({}, t.type.defaultProps), t.props) : t.props, a = i.stackId;
    if (bt(a)) {
        var o = n[a];
        if (o) {
            var s = o.items.indexOf(t);
            return s >= 0 ? o.stackedData[s] : null
        }
    }
    return null
}
  , t_ = function(t) {
    return t.reduce(function(n, r) {
        return [ja(r.concat([n[0]]).filter(L)), me(r.concat([n[1]]).filter(L))]
    }, [1 / 0, -1 / 0])
}
  , sp = function(t, n, r) {
    return Object.keys(t).reduce(function(i, a) {
        var o = t[a]
          , s = o.stackedData
          , l = s.reduce(function(c, u) {
            var f = t_(u.slice(n, r + 1));
            return [Math.min(c[0], f[0]), Math.max(c[1], f[1])]
        }, [1 / 0, -1 / 0]);
        return [Math.min(l[0], i[0]), Math.max(l[1], i[1])]
    }, [1 / 0, -1 / 0]).map(function(i) {
        return i === 1 / 0 || i === -1 / 0 ? 0 : i
    })
}
  , Du = /^dataMin[\s]*-[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/
  , Iu = /^dataMax[\s]*\+[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/
  , os = function(t, n, r) {
    if (K(t))
        return t(n, r);
    if (!Array.isArray(t))
        return n;
    var i = [];
    if (L(t[0]))
        i[0] = r ? t[0] : Math.min(t[0], n[0]);
    else if (Du.test(t[0])) {
        var a = +Du.exec(t[0])[1];
        i[0] = n[0] - a
    } else
        K(t[0]) ? i[0] = t[0](n[0]) : i[0] = n[0];
    if (L(t[1]))
        i[1] = r ? t[1] : Math.max(t[1], n[1]);
    else if (Iu.test(t[1])) {
        var o = +Iu.exec(t[1])[1];
        i[1] = n[1] + o
    } else
        K(t[1]) ? i[1] = t[1](n[1]) : i[1] = n[1];
    return i
}
  , ia = function(t, n, r) {
    if (t && t.scale && t.scale.bandwidth) {
        var i = t.scale.bandwidth();
        if (!r || i > 0)
            return i
    }
    if (t && n && n.length >= 2) {
        for (var a = Fs(n, function(f) {
            return f.coordinate
        }), o = 1 / 0, s = 1, l = a.length; s < l; s++) {
            var c = a[s]
              , u = a[s - 1];
            o = Math.min((c.coordinate || 0) - (u.coordinate || 0), o)
        }
        return o === 1 / 0 ? 0 : o
    }
    return r ? void 0 : 0
}
  , $u = function(t, n, r) {
    return !t || !t.length || we(t, Bt(r, "type.defaultProps.domain")) ? n : t
}
  , lp = function(t, n) {
    var r = t.type.defaultProps ? ht(ht({}, t.type.defaultProps), t.props) : t.props
      , i = r.dataKey
      , a = r.name
      , o = r.unit
      , s = r.formatter
      , l = r.tooltipType
      , c = r.chartType
      , u = r.hide;
    return ht(ht({}, F(t, !1)), {}, {
        dataKey: i,
        unit: o,
        formatter: s,
        name: a || i,
        color: cl(t),
        value: at(n, i),
        type: l,
        payload: n,
        chartType: c,
        hide: u
    })
};
function Hr(e) {
    "@babel/helpers - typeof";
    return Hr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Hr(e)
}
function Lu(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function ae(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? Lu(Object(n), !0).forEach(function(r) {
            cp(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Lu(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function cp(e, t, n) {
    return t = e_(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function e_(e) {
    var t = n_(e, "string");
    return Hr(t) == "symbol" ? t : t + ""
}
function n_(e, t) {
    if (Hr(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Hr(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
function r_(e, t) {
    return s_(e) || o_(e, t) || a_(e, t) || i_()
}
function i_() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function a_(e, t) {
    if (e) {
        if (typeof e == "string")
            return Ru(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return Ru(e, t)
    }
}
function Ru(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
function o_(e, t) {
    var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
    if (n != null) {
        var r, i, a, o, s = [], l = !0, c = !1;
        try {
            if (a = (n = n.call(e)).next,
            t !== 0)
                for (; !(l = (r = a.call(n)).done) && (s.push(r.value),
                s.length !== t); l = !0)
                    ;
        } catch (u) {
            c = !0,
            i = u
        } finally {
            try {
                if (!l && n.return != null && (o = n.return(),
                Object(o) !== o))
                    return
            } finally {
                if (c)
                    throw i
            }
        }
        return s
    }
}
function s_(e) {
    if (Array.isArray(e))
        return e
}
var aa = Math.PI / 180
  , l_ = function(t) {
    return t * 180 / Math.PI
}
  , it = function(t, n, r, i) {
    return {
        x: t + Math.cos(-aa * i) * r,
        y: n + Math.sin(-aa * i) * r
    }
}
  , up = function(t, n) {
    var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };
    return Math.min(Math.abs(t - (r.left || 0) - (r.right || 0)), Math.abs(n - (r.top || 0) - (r.bottom || 0))) / 2
}
  , c_ = function(t, n, r, i, a) {
    var o = t.width
      , s = t.height
      , l = t.startAngle
      , c = t.endAngle
      , u = Mt(t.cx, o, o / 2)
      , f = Mt(t.cy, s, s / 2)
      , h = up(o, s, r)
      , d = Mt(t.innerRadius, h, 0)
      , p = Mt(t.outerRadius, h, h * .8)
      , g = Object.keys(n);
    return g.reduce(function(m, v) {
        var b = n[v], x = b.domain, w = b.reversed, y;
        if (X(b.range))
            i === "angleAxis" ? y = [l, c] : i === "radiusAxis" && (y = [d, p]),
            w && (y = [y[1], y[0]]);
        else {
            y = b.range;
            var O = y
              , _ = r_(O, 2);
            l = _[0],
            c = _[1]
        }
        var P = ip(b, a)
          , S = P.realScaleType
          , k = P.scale;
        k.domain(x).range(y),
        ap(k);
        var E = op(k, ae(ae({}, b), {}, {
            realScaleType: S
        }))
          , M = ae(ae(ae({}, b), E), {}, {
            range: y,
            radius: p,
            realScaleType: S,
            scale: k,
            cx: u,
            cy: f,
            innerRadius: d,
            outerRadius: p,
            startAngle: l,
            endAngle: c
        });
        return ae(ae({}, m), {}, cp({}, v, M))
    }, {})
}
  , u_ = function(t, n) {
    var r = t.x
      , i = t.y
      , a = n.x
      , o = n.y;
    return Math.sqrt(Math.pow(r - a, 2) + Math.pow(i - o, 2))
}
  , f_ = function(t, n) {
    var r = t.x
      , i = t.y
      , a = n.cx
      , o = n.cy
      , s = u_({
        x: r,
        y: i
    }, {
        x: a,
        y: o
    });
    if (s <= 0)
        return {
            radius: s
        };
    var l = (r - a) / s
      , c = Math.acos(l);
    return i > o && (c = 2 * Math.PI - c),
    {
        radius: s,
        angle: l_(c),
        angleInRadian: c
    }
}
  , h_ = function(t) {
    var n = t.startAngle
      , r = t.endAngle
      , i = Math.floor(n / 360)
      , a = Math.floor(r / 360)
      , o = Math.min(i, a);
    return {
        startAngle: n - o * 360,
        endAngle: r - o * 360
    }
}
  , d_ = function(t, n) {
    var r = n.startAngle
      , i = n.endAngle
      , a = Math.floor(r / 360)
      , o = Math.floor(i / 360)
      , s = Math.min(a, o);
    return t + s * 360
}
  , Bu = function(t, n) {
    var r = t.x
      , i = t.y
      , a = f_({
        x: r,
        y: i
    }, n)
      , o = a.radius
      , s = a.angle
      , l = n.innerRadius
      , c = n.outerRadius;
    if (o < l || o > c)
        return !1;
    if (o === 0)
        return !0;
    var u = h_(n), f = u.startAngle, h = u.endAngle, d = s, p;
    if (f <= h) {
        for (; d > h; )
            d -= 360;
        for (; d < f; )
            d += 360;
        p = d >= f && d <= h
    } else {
        for (; d > f; )
            d -= 360;
        for (; d < h; )
            d += 360;
        p = d >= h && d <= f
    }
    return p ? ae(ae({}, n), {}, {
        radius: o,
        angle: d_(d, n)
    }) : null
}
  , fp = function(t) {
    return !N.isValidElement(t) && !K(t) && typeof t != "boolean" ? t.className : ""
};
function Kr(e) {
    "@babel/helpers - typeof";
    return Kr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Kr(e)
}
var p_ = ["offset"];
function g_(e) {
    return b_(e) || v_(e) || y_(e) || m_()
}
function m_() {
    throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function y_(e, t) {
    if (e) {
        if (typeof e == "string")
            return ss(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return ss(e, t)
    }
}
function v_(e) {
    if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null)
        return Array.from(e)
}
function b_(e) {
    if (Array.isArray(e))
        return ss(e)
}
function ss(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
function x_(e, t) {
    if (e == null)
        return {};
    var n = O_(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function O_(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function Nu(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function yt(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? Nu(Object(n), !0).forEach(function(r) {
            w_(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Nu(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function w_(e, t, n) {
    return t = __(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function __(e) {
    var t = P_(e, "string");
    return Kr(t) == "symbol" ? t : t + ""
}
function P_(e, t) {
    if (Kr(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Kr(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
function Xr() {
    return Xr = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    Xr.apply(this, arguments)
}
var A_ = function(t) {
    var n = t.value
      , r = t.formatter
      , i = X(t.children) ? n : t.children;
    return K(r) ? r(i) : i
}
  , S_ = function(t, n) {
    var r = Et(n - t)
      , i = Math.min(Math.abs(n - t), 360);
    return r * i
}
  , k_ = function(t, n, r) {
    var i = t.position, a = t.viewBox, o = t.offset, s = t.className, l = a, c = l.cx, u = l.cy, f = l.innerRadius, h = l.outerRadius, d = l.startAngle, p = l.endAngle, g = l.clockWise, m = (f + h) / 2, v = S_(d, p), b = v >= 0 ? 1 : -1, x, w;
    i === "insideStart" ? (x = d + b * o,
    w = g) : i === "insideEnd" ? (x = p - b * o,
    w = !g) : i === "end" && (x = p + b * o,
    w = g),
    w = v <= 0 ? w : !w;
    var y = it(c, u, m, x)
      , O = it(c, u, m, x + (w ? 1 : -1) * 359)
      , _ = "M".concat(y.x, ",").concat(y.y, `
    A`).concat(m, ",").concat(m, ",0,1,").concat(w ? 0 : 1, `,
    `).concat(O.x, ",").concat(O.y)
      , P = X(t.id) ? Ee("recharts-radial-line-") : t.id;
    return A.createElement("text", Xr({}, r, {
        dominantBaseline: "central",
        className: U("recharts-radial-bar-label", s)
    }), A.createElement("defs", null, A.createElement("path", {
        id: P,
        d: _
    })), A.createElement("textPath", {
        xlinkHref: "#".concat(P)
    }, n))
}
  , E_ = function(t) {
    var n = t.viewBox
      , r = t.offset
      , i = t.position
      , a = n
      , o = a.cx
      , s = a.cy
      , l = a.innerRadius
      , c = a.outerRadius
      , u = a.startAngle
      , f = a.endAngle
      , h = (u + f) / 2;
    if (i === "outside") {
        var d = it(o, s, c + r, h)
          , p = d.x
          , g = d.y;
        return {
            x: p,
            y: g,
            textAnchor: p >= o ? "start" : "end",
            verticalAnchor: "middle"
        }
    }
    if (i === "center")
        return {
            x: o,
            y: s,
            textAnchor: "middle",
            verticalAnchor: "middle"
        };
    if (i === "centerTop")
        return {
            x: o,
            y: s,
            textAnchor: "middle",
            verticalAnchor: "start"
        };
    if (i === "centerBottom")
        return {
            x: o,
            y: s,
            textAnchor: "middle",
            verticalAnchor: "end"
        };
    var m = (l + c) / 2
      , v = it(o, s, m, h)
      , b = v.x
      , x = v.y;
    return {
        x: b,
        y: x,
        textAnchor: "middle",
        verticalAnchor: "middle"
    }
}
  , M_ = function(t) {
    var n = t.viewBox
      , r = t.parentViewBox
      , i = t.offset
      , a = t.position
      , o = n
      , s = o.x
      , l = o.y
      , c = o.width
      , u = o.height
      , f = u >= 0 ? 1 : -1
      , h = f * i
      , d = f > 0 ? "end" : "start"
      , p = f > 0 ? "start" : "end"
      , g = c >= 0 ? 1 : -1
      , m = g * i
      , v = g > 0 ? "end" : "start"
      , b = g > 0 ? "start" : "end";
    if (a === "top") {
        var x = {
            x: s + c / 2,
            y: l - f * i,
            textAnchor: "middle",
            verticalAnchor: d
        };
        return yt(yt({}, x), r ? {
            height: Math.max(l - r.y, 0),
            width: c
        } : {})
    }
    if (a === "bottom") {
        var w = {
            x: s + c / 2,
            y: l + u + h,
            textAnchor: "middle",
            verticalAnchor: p
        };
        return yt(yt({}, w), r ? {
            height: Math.max(r.y + r.height - (l + u), 0),
            width: c
        } : {})
    }
    if (a === "left") {
        var y = {
            x: s - m,
            y: l + u / 2,
            textAnchor: v,
            verticalAnchor: "middle"
        };
        return yt(yt({}, y), r ? {
            width: Math.max(y.x - r.x, 0),
            height: u
        } : {})
    }
    if (a === "right") {
        var O = {
            x: s + c + m,
            y: l + u / 2,
            textAnchor: b,
            verticalAnchor: "middle"
        };
        return yt(yt({}, O), r ? {
            width: Math.max(r.x + r.width - O.x, 0),
            height: u
        } : {})
    }
    var _ = r ? {
        width: c,
        height: u
    } : {};
    return a === "insideLeft" ? yt({
        x: s + m,
        y: l + u / 2,
        textAnchor: b,
        verticalAnchor: "middle"
    }, _) : a === "insideRight" ? yt({
        x: s + c - m,
        y: l + u / 2,
        textAnchor: v,
        verticalAnchor: "middle"
    }, _) : a === "insideTop" ? yt({
        x: s + c / 2,
        y: l + h,
        textAnchor: "middle",
        verticalAnchor: p
    }, _) : a === "insideBottom" ? yt({
        x: s + c / 2,
        y: l + u - h,
        textAnchor: "middle",
        verticalAnchor: d
    }, _) : a === "insideTopLeft" ? yt({
        x: s + m,
        y: l + h,
        textAnchor: b,
        verticalAnchor: p
    }, _) : a === "insideTopRight" ? yt({
        x: s + c - m,
        y: l + h,
        textAnchor: v,
        verticalAnchor: p
    }, _) : a === "insideBottomLeft" ? yt({
        x: s + m,
        y: l + u - h,
        textAnchor: b,
        verticalAnchor: d
    }, _) : a === "insideBottomRight" ? yt({
        x: s + c - m,
        y: l + u - h,
        textAnchor: v,
        verticalAnchor: d
    }, _) : Un(a) && (L(a.x) || He(a.x)) && (L(a.y) || He(a.y)) ? yt({
        x: s + Mt(a.x, c),
        y: l + Mt(a.y, u),
        textAnchor: "end",
        verticalAnchor: "end"
    }, _) : yt({
        x: s + c / 2,
        y: l + u / 2,
        textAnchor: "middle",
        verticalAnchor: "middle"
    }, _)
}
  , T_ = function(t) {
    return "cx"in t && L(t.cx)
};
function xt(e) {
    var t = e.offset
      , n = t === void 0 ? 5 : t
      , r = x_(e, p_)
      , i = yt({
        offset: n
    }, r)
      , a = i.viewBox
      , o = i.position
      , s = i.value
      , l = i.children
      , c = i.content
      , u = i.className
      , f = u === void 0 ? "" : u
      , h = i.textBreakAll;
    if (!a || X(s) && X(l) && !N.isValidElement(c) && !K(c))
        return null;
    if (N.isValidElement(c))
        return N.cloneElement(c, i);
    var d;
    if (K(c)) {
        if (d = N.createElement(c, i),
        N.isValidElement(d))
            return d
    } else
        d = A_(i);
    var p = T_(a)
      , g = F(i, !0);
    if (p && (o === "insideStart" || o === "insideEnd" || o === "end"))
        return k_(i, d, g);
    var m = p ? E_(i) : M_(i);
    return A.createElement(Qe, Xr({
        className: U("recharts-label", f)
    }, g, m, {
        breakAll: h
    }), d)
}
xt.displayName = "Label";
var hp = function(t) {
    var n = t.cx
      , r = t.cy
      , i = t.angle
      , a = t.startAngle
      , o = t.endAngle
      , s = t.r
      , l = t.radius
      , c = t.innerRadius
      , u = t.outerRadius
      , f = t.x
      , h = t.y
      , d = t.top
      , p = t.left
      , g = t.width
      , m = t.height
      , v = t.clockWise
      , b = t.labelViewBox;
    if (b)
        return b;
    if (L(g) && L(m)) {
        if (L(f) && L(h))
            return {
                x: f,
                y: h,
                width: g,
                height: m
            };
        if (L(d) && L(p))
            return {
                x: d,
                y: p,
                width: g,
                height: m
            }
    }
    return L(f) && L(h) ? {
        x: f,
        y: h,
        width: 0,
        height: 0
    } : L(n) && L(r) ? {
        cx: n,
        cy: r,
        startAngle: a || i || 0,
        endAngle: o || i || 0,
        innerRadius: c || 0,
        outerRadius: u || l || s || 0,
        clockWise: v
    } : t.viewBox ? t.viewBox : {}
}
  , j_ = function(t, n) {
    return t ? t === !0 ? A.createElement(xt, {
        key: "label-implicit",
        viewBox: n
    }) : bt(t) ? A.createElement(xt, {
        key: "label-implicit",
        viewBox: n,
        value: t
    }) : N.isValidElement(t) ? t.type === xt ? N.cloneElement(t, {
        key: "label-implicit",
        viewBox: n
    }) : A.createElement(xt, {
        key: "label-implicit",
        content: t,
        viewBox: n
    }) : K(t) ? A.createElement(xt, {
        key: "label-implicit",
        content: t,
        viewBox: n
    }) : Un(t) ? A.createElement(xt, Xr({
        viewBox: n
    }, t, {
        key: "label-implicit"
    })) : null : null
}
  , C_ = function(t, n) {
    var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
    if (!t || !t.children && r && !t.label)
        return null;
    var i = t.children
      , a = hp(t)
      , o = Tt(i, xt).map(function(l, c) {
        return N.cloneElement(l, {
            viewBox: n || a,
            key: "label-".concat(c)
        })
    });
    if (!r)
        return o;
    var s = j_(t.label, n || a);
    return [s].concat(g_(o))
};
xt.parseViewBox = hp;
xt.renderCallByParent = C_;
function Gr(e) {
    "@babel/helpers - typeof";
    return Gr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Gr(e)
}
var D_ = ["valueAccessor"]
  , I_ = ["data", "dataKey", "clockWise", "id", "textBreakAll"];
function $_(e) {
    return N_(e) || B_(e) || R_(e) || L_()
}
function L_() {
    throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function R_(e, t) {
    if (e) {
        if (typeof e == "string")
            return ls(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return ls(e, t)
    }
}
function B_(e) {
    if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null)
        return Array.from(e)
}
function N_(e) {
    if (Array.isArray(e))
        return ls(e)
}
function ls(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
function oa() {
    return oa = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    oa.apply(this, arguments)
}
function zu(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function Fu(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? zu(Object(n), !0).forEach(function(r) {
            z_(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : zu(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function z_(e, t, n) {
    return t = F_(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function F_(e) {
    var t = W_(e, "string");
    return Gr(t) == "symbol" ? t : t + ""
}
function W_(e, t) {
    if (Gr(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Gr(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
function Wu(e, t) {
    if (e == null)
        return {};
    var n = V_(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function V_(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
var H_ = function(t) {
    return Array.isArray(t.value) ? Dg(t.value) : t.value
};
function Ut(e) {
    var t = e.valueAccessor
      , n = t === void 0 ? H_ : t
      , r = Wu(e, D_)
      , i = r.data
      , a = r.dataKey
      , o = r.clockWise
      , s = r.id
      , l = r.textBreakAll
      , c = Wu(r, I_);
    return !i || !i.length ? null : A.createElement(q, {
        className: "recharts-label-list"
    }, i.map(function(u, f) {
        var h = X(a) ? n(u, f) : at(u && u.payload, a)
          , d = X(s) ? {} : {
            id: "".concat(s, "-").concat(f)
        };
        return A.createElement(xt, oa({}, F(u, !0), c, d, {
            parentViewBox: u.parentViewBox,
            value: h,
            textBreakAll: l,
            viewBox: xt.parseViewBox(X(o) ? u : Fu(Fu({}, u), {}, {
                clockWise: o
            })),
            key: "label-".concat(f),
            index: f
        }))
    }))
}
Ut.displayName = "LabelList";
function K_(e, t) {
    return e ? e === !0 ? A.createElement(Ut, {
        key: "labelList-implicit",
        data: t
    }) : A.isValidElement(e) || K(e) ? A.createElement(Ut, {
        key: "labelList-implicit",
        data: t,
        content: e
    }) : Un(e) ? A.createElement(Ut, oa({
        data: t
    }, e, {
        key: "labelList-implicit"
    })) : null : null
}
function X_(e, t) {
    var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
    if (!e || !e.children && n && !e.label)
        return null;
    var r = e.children
      , i = Tt(r, Ut).map(function(o, s) {
        return N.cloneElement(o, {
            data: t,
            key: "labelList-".concat(s)
        })
    });
    if (!n)
        return i;
    var a = K_(e.label, t);
    return [a].concat($_(i))
}
Ut.renderCallByParent = X_;
function Ur(e) {
    "@babel/helpers - typeof";
    return Ur = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Ur(e)
}
function cs() {
    return cs = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    cs.apply(this, arguments)
}
function Vu(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function Hu(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? Vu(Object(n), !0).forEach(function(r) {
            G_(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Vu(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function G_(e, t, n) {
    return t = U_(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function U_(e) {
    var t = Y_(e, "string");
    return Ur(t) == "symbol" ? t : t + ""
}
function Y_(e, t) {
    if (Ur(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Ur(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
var q_ = function(t, n) {
    var r = Et(n - t)
      , i = Math.min(Math.abs(n - t), 359.999);
    return r * i
}
  , ji = function(t) {
    var n = t.cx
      , r = t.cy
      , i = t.radius
      , a = t.angle
      , o = t.sign
      , s = t.isExternal
      , l = t.cornerRadius
      , c = t.cornerIsExternal
      , u = l * (s ? 1 : -1) + i
      , f = Math.asin(l / u) / aa
      , h = c ? a : a + o * f
      , d = it(n, r, u, h)
      , p = it(n, r, i, h)
      , g = c ? a - o * f : a
      , m = it(n, r, u * Math.cos(f * aa), g);
    return {
        center: d,
        circleTangency: p,
        lineTangency: m,
        theta: f
    }
}
  , dp = function(t) {
    var n = t.cx
      , r = t.cy
      , i = t.innerRadius
      , a = t.outerRadius
      , o = t.startAngle
      , s = t.endAngle
      , l = q_(o, s)
      , c = o + l
      , u = it(n, r, a, o)
      , f = it(n, r, a, c)
      , h = "M ".concat(u.x, ",").concat(u.y, `
    A `).concat(a, ",").concat(a, `,0,
    `).concat(+(Math.abs(l) > 180), ",").concat(+(o > c), `,
    `).concat(f.x, ",").concat(f.y, `
  `);
    if (i > 0) {
        var d = it(n, r, i, o)
          , p = it(n, r, i, c);
        h += "L ".concat(p.x, ",").concat(p.y, `
            A `).concat(i, ",").concat(i, `,0,
            `).concat(+(Math.abs(l) > 180), ",").concat(+(o <= c), `,
            `).concat(d.x, ",").concat(d.y, " Z")
    } else
        h += "L ".concat(n, ",").concat(r, " Z");
    return h
}
  , Z_ = function(t) {
    var n = t.cx
      , r = t.cy
      , i = t.innerRadius
      , a = t.outerRadius
      , o = t.cornerRadius
      , s = t.forceCornerRadius
      , l = t.cornerIsExternal
      , c = t.startAngle
      , u = t.endAngle
      , f = Et(u - c)
      , h = ji({
        cx: n,
        cy: r,
        radius: a,
        angle: c,
        sign: f,
        cornerRadius: o,
        cornerIsExternal: l
    })
      , d = h.circleTangency
      , p = h.lineTangency
      , g = h.theta
      , m = ji({
        cx: n,
        cy: r,
        radius: a,
        angle: u,
        sign: -f,
        cornerRadius: o,
        cornerIsExternal: l
    })
      , v = m.circleTangency
      , b = m.lineTangency
      , x = m.theta
      , w = l ? Math.abs(c - u) : Math.abs(c - u) - g - x;
    if (w < 0)
        return s ? "M ".concat(p.x, ",").concat(p.y, `
        a`).concat(o, ",").concat(o, ",0,0,1,").concat(o * 2, `,0
        a`).concat(o, ",").concat(o, ",0,0,1,").concat(-o * 2, `,0
      `) : dp({
            cx: n,
            cy: r,
            innerRadius: i,
            outerRadius: a,
            startAngle: c,
            endAngle: u
        });
    var y = "M ".concat(p.x, ",").concat(p.y, `
    A`).concat(o, ",").concat(o, ",0,0,").concat(+(f < 0), ",").concat(d.x, ",").concat(d.y, `
    A`).concat(a, ",").concat(a, ",0,").concat(+(w > 180), ",").concat(+(f < 0), ",").concat(v.x, ",").concat(v.y, `
    A`).concat(o, ",").concat(o, ",0,0,").concat(+(f < 0), ",").concat(b.x, ",").concat(b.y, `
  `);
    if (i > 0) {
        var O = ji({
            cx: n,
            cy: r,
            radius: i,
            angle: c,
            sign: f,
            isExternal: !0,
            cornerRadius: o,
            cornerIsExternal: l
        })
          , _ = O.circleTangency
          , P = O.lineTangency
          , S = O.theta
          , k = ji({
            cx: n,
            cy: r,
            radius: i,
            angle: u,
            sign: -f,
            isExternal: !0,
            cornerRadius: o,
            cornerIsExternal: l
        })
          , E = k.circleTangency
          , M = k.lineTangency
          , C = k.theta
          , I = l ? Math.abs(c - u) : Math.abs(c - u) - S - C;
        if (I < 0 && o === 0)
            return "".concat(y, "L").concat(n, ",").concat(r, "Z");
        y += "L".concat(M.x, ",").concat(M.y, `
      A`).concat(o, ",").concat(o, ",0,0,").concat(+(f < 0), ",").concat(E.x, ",").concat(E.y, `
      A`).concat(i, ",").concat(i, ",0,").concat(+(I > 180), ",").concat(+(f > 0), ",").concat(_.x, ",").concat(_.y, `
      A`).concat(o, ",").concat(o, ",0,0,").concat(+(f < 0), ",").concat(P.x, ",").concat(P.y, "Z")
    } else
        y += "L".concat(n, ",").concat(r, "Z");
    return y
}
  , J_ = {
    cx: 0,
    cy: 0,
    innerRadius: 0,
    outerRadius: 0,
    startAngle: 0,
    endAngle: 0,
    cornerRadius: 0,
    forceCornerRadius: !1,
    cornerIsExternal: !1
}
  , pp = function(t) {
    var n = Hu(Hu({}, J_), t)
      , r = n.cx
      , i = n.cy
      , a = n.innerRadius
      , o = n.outerRadius
      , s = n.cornerRadius
      , l = n.forceCornerRadius
      , c = n.cornerIsExternal
      , u = n.startAngle
      , f = n.endAngle
      , h = n.className;
    if (o < a || u === f)
        return null;
    var d = U("recharts-sector", h), p = o - a, g = Mt(s, p, 0, !0), m;
    return g > 0 && Math.abs(u - f) < 360 ? m = Z_({
        cx: r,
        cy: i,
        innerRadius: a,
        outerRadius: o,
        cornerRadius: Math.min(g, p / 2),
        forceCornerRadius: l,
        cornerIsExternal: c,
        startAngle: u,
        endAngle: f
    }) : m = dp({
        cx: r,
        cy: i,
        innerRadius: a,
        outerRadius: o,
        startAngle: u,
        endAngle: f
    }),
    A.createElement("path", cs({}, F(n, !0), {
        className: d,
        d: m,
        role: "img"
    }))
};
function Yr(e) {
    "@babel/helpers - typeof";
    return Yr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Yr(e)
}
function us() {
    return us = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    us.apply(this, arguments)
}
function Ku(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function Xu(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? Ku(Object(n), !0).forEach(function(r) {
            Q_(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ku(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function Q_(e, t, n) {
    return t = tP(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function tP(e) {
    var t = eP(e, "string");
    return Yr(t) == "symbol" ? t : t + ""
}
function eP(e, t) {
    if (Yr(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Yr(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
var Gu = {
    curveBasisClosed: Xg,
    curveBasisOpen: Kg,
    curveBasis: Hg,
    curveBumpX: Vg,
    curveBumpY: Wg,
    curveLinearClosed: Fg,
    curveLinear: rh,
    curveMonotoneX: zg,
    curveMonotoneY: Ng,
    curveNatural: Bg,
    curveStep: Rg,
    curveStepAfter: Lg,
    curveStepBefore: $g
}
  , Ci = function(t) {
    return t.x === +t.x && t.y === +t.y
}
  , fr = function(t) {
    return t.x
}
  , hr = function(t) {
    return t.y
}
  , nP = function(t, n) {
    if (K(t))
        return t;
    var r = "curve".concat(Ta(t));
    return (r === "curveMonotone" || r === "curveBump") && n ? Gu["".concat(r).concat(n === "vertical" ? "Y" : "X")] : Gu[r] || rh
}
  , rP = function(t) {
    var n = t.type, r = n === void 0 ? "linear" : n, i = t.points, a = i === void 0 ? [] : i, o = t.baseLine, s = t.layout, l = t.connectNulls, c = l === void 0 ? !1 : l, u = nP(r, s), f = c ? a.filter(function(g) {
        return Ci(g)
    }) : a, h;
    if (Array.isArray(o)) {
        var d = c ? o.filter(function(g) {
            return Ci(g)
        }) : o
          , p = f.map(function(g, m) {
            return Xu(Xu({}, g), {}, {
                base: d[m]
            })
        });
        return s === "vertical" ? h = gi().y(hr).x1(fr).x0(function(g) {
            return g.base.x
        }) : h = gi().x(fr).y1(hr).y0(function(g) {
            return g.base.y
        }),
        h.defined(Ci).curve(u),
        h(p)
    }
    return s === "vertical" && L(o) ? h = gi().y(hr).x1(fr).x0(o) : L(o) ? h = gi().x(fr).y1(hr).y0(o) : h = Ig().x(fr).y(hr),
    h.defined(Ci).curve(u),
    h(f)
}
  , Oe = function(t) {
    var n = t.className
      , r = t.points
      , i = t.path
      , a = t.pathRef;
    if ((!r || !r.length) && !i)
        return null;
    var o = r && r.length ? rP(t) : i;
    return A.createElement("path", us({}, F(t, !1), qi(t), {
        className: U("recharts-curve", n),
        d: o,
        ref: a
    }))
};
function qr(e) {
    "@babel/helpers - typeof";
    return qr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    qr(e)
}
function sa() {
    return sa = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    sa.apply(this, arguments)
}
function iP(e, t) {
    return lP(e) || sP(e, t) || oP(e, t) || aP()
}
function aP() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function oP(e, t) {
    if (e) {
        if (typeof e == "string")
            return Uu(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return Uu(e, t)
    }
}
function Uu(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
function sP(e, t) {
    var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
    if (n != null) {
        var r, i, a, o, s = [], l = !0, c = !1;
        try {
            if (a = (n = n.call(e)).next,
            t !== 0)
                for (; !(l = (r = a.call(n)).done) && (s.push(r.value),
                s.length !== t); l = !0)
                    ;
        } catch (u) {
            c = !0,
            i = u
        } finally {
            try {
                if (!l && n.return != null && (o = n.return(),
                Object(o) !== o))
                    return
            } finally {
                if (c)
                    throw i
            }
        }
        return s
    }
}
function lP(e) {
    if (Array.isArray(e))
        return e
}
function Yu(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function qu(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? Yu(Object(n), !0).forEach(function(r) {
            cP(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Yu(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function cP(e, t, n) {
    return t = uP(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function uP(e) {
    var t = fP(e, "string");
    return qr(t) == "symbol" ? t : t + ""
}
function fP(e, t) {
    if (qr(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (qr(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
var Zu = function(t, n, r, i, a) {
    var o = Math.min(Math.abs(r) / 2, Math.abs(i) / 2), s = i >= 0 ? 1 : -1, l = r >= 0 ? 1 : -1, c = i >= 0 && r >= 0 || i < 0 && r < 0 ? 1 : 0, u;
    if (o > 0 && a instanceof Array) {
        for (var f = [0, 0, 0, 0], h = 0, d = 4; h < d; h++)
            f[h] = a[h] > o ? o : a[h];
        u = "M".concat(t, ",").concat(n + s * f[0]),
        f[0] > 0 && (u += "A ".concat(f[0], ",").concat(f[0], ",0,0,").concat(c, ",").concat(t + l * f[0], ",").concat(n)),
        u += "L ".concat(t + r - l * f[1], ",").concat(n),
        f[1] > 0 && (u += "A ".concat(f[1], ",").concat(f[1], ",0,0,").concat(c, `,
        `).concat(t + r, ",").concat(n + s * f[1])),
        u += "L ".concat(t + r, ",").concat(n + i - s * f[2]),
        f[2] > 0 && (u += "A ".concat(f[2], ",").concat(f[2], ",0,0,").concat(c, `,
        `).concat(t + r - l * f[2], ",").concat(n + i)),
        u += "L ".concat(t + l * f[3], ",").concat(n + i),
        f[3] > 0 && (u += "A ".concat(f[3], ",").concat(f[3], ",0,0,").concat(c, `,
        `).concat(t, ",").concat(n + i - s * f[3])),
        u += "Z"
    } else if (o > 0 && a === +a && a > 0) {
        var p = Math.min(o, a);
        u = "M ".concat(t, ",").concat(n + s * p, `
            A `).concat(p, ",").concat(p, ",0,0,").concat(c, ",").concat(t + l * p, ",").concat(n, `
            L `).concat(t + r - l * p, ",").concat(n, `
            A `).concat(p, ",").concat(p, ",0,0,").concat(c, ",").concat(t + r, ",").concat(n + s * p, `
            L `).concat(t + r, ",").concat(n + i - s * p, `
            A `).concat(p, ",").concat(p, ",0,0,").concat(c, ",").concat(t + r - l * p, ",").concat(n + i, `
            L `).concat(t + l * p, ",").concat(n + i, `
            A `).concat(p, ",").concat(p, ",0,0,").concat(c, ",").concat(t, ",").concat(n + i - s * p, " Z")
    } else
        u = "M ".concat(t, ",").concat(n, " h ").concat(r, " v ").concat(i, " h ").concat(-r, " Z");
    return u
}
  , hP = function(t, n) {
    if (!t || !n)
        return !1;
    var r = t.x
      , i = t.y
      , a = n.x
      , o = n.y
      , s = n.width
      , l = n.height;
    if (Math.abs(s) > 0 && Math.abs(l) > 0) {
        var c = Math.min(a, a + s)
          , u = Math.max(a, a + s)
          , f = Math.min(o, o + l)
          , h = Math.max(o, o + l);
        return r >= c && r <= u && i >= f && i <= h
    }
    return !1
}
  , dP = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    radius: 0,
    isAnimationActive: !1,
    isUpdateAnimationActive: !1,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: "ease"
}
  , ul = function(t) {
    var n = qu(qu({}, dP), t)
      , r = N.useRef()
      , i = N.useState(-1)
      , a = iP(i, 2)
      , o = a[0]
      , s = a[1];
    N.useEffect(function() {
        if (r.current && r.current.getTotalLength)
            try {
                var w = r.current.getTotalLength();
                w && s(w)
            } catch {}
    }, []);
    var l = n.x
      , c = n.y
      , u = n.width
      , f = n.height
      , h = n.radius
      , d = n.className
      , p = n.animationEasing
      , g = n.animationDuration
      , m = n.animationBegin
      , v = n.isAnimationActive
      , b = n.isUpdateAnimationActive;
    if (l !== +l || c !== +c || u !== +u || f !== +f || u === 0 || f === 0)
        return null;
    var x = U("recharts-rectangle", d);
    return b ? A.createElement(fe, {
        canBegin: o > 0,
        from: {
            width: u,
            height: f,
            x: l,
            y: c
        },
        to: {
            width: u,
            height: f,
            x: l,
            y: c
        },
        duration: g,
        animationEasing: p,
        isActive: b
    }, function(w) {
        var y = w.width
          , O = w.height
          , _ = w.x
          , P = w.y;
        return A.createElement(fe, {
            canBegin: o > 0,
            from: "0px ".concat(o === -1 ? 1 : o, "px"),
            to: "".concat(o, "px 0px"),
            attributeName: "strokeDasharray",
            begin: m,
            duration: g,
            isActive: v,
            easing: p
        }, A.createElement("path", sa({}, F(n, !0), {
            className: x,
            d: Zu(_, P, y, O, h),
            ref: r
        })))
    }) : A.createElement("path", sa({}, F(n, !0), {
        className: x,
        d: Zu(l, c, u, f, h)
    }))
}
  , pP = ["points", "className", "baseLinePoints", "connectNulls"];
function hn() {
    return hn = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    hn.apply(this, arguments)
}
function gP(e, t) {
    if (e == null)
        return {};
    var n = mP(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function mP(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function Ju(e) {
    return xP(e) || bP(e) || vP(e) || yP()
}
function yP() {
    throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function vP(e, t) {
    if (e) {
        if (typeof e == "string")
            return fs(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return fs(e, t)
    }
}
function bP(e) {
    if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null)
        return Array.from(e)
}
function xP(e) {
    if (Array.isArray(e))
        return fs(e)
}
function fs(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
var Qu = function(t) {
    return t && t.x === +t.x && t.y === +t.y
}
  , OP = function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : []
      , n = [[]];
    return t.forEach(function(r) {
        Qu(r) ? n[n.length - 1].push(r) : n[n.length - 1].length > 0 && n.push([])
    }),
    Qu(t[0]) && n[n.length - 1].push(t[0]),
    n[n.length - 1].length <= 0 && (n = n.slice(0, -1)),
    n
}
  , _r = function(t, n) {
    var r = OP(t);
    n && (r = [r.reduce(function(a, o) {
        return [].concat(Ju(a), Ju(o))
    }, [])]);
    var i = r.map(function(a) {
        return a.reduce(function(o, s, l) {
            return "".concat(o).concat(l === 0 ? "M" : "L").concat(s.x, ",").concat(s.y)
        }, "")
    }).join("");
    return r.length === 1 ? "".concat(i, "Z") : i
}
  , wP = function(t, n, r) {
    var i = _r(t, r);
    return "".concat(i.slice(-1) === "Z" ? i.slice(0, -1) : i, "L").concat(_r(n.reverse(), r).slice(1))
}
  , _P = function(t) {
    var n = t.points
      , r = t.className
      , i = t.baseLinePoints
      , a = t.connectNulls
      , o = gP(t, pP);
    if (!n || !n.length)
        return null;
    var s = U("recharts-polygon", r);
    if (i && i.length) {
        var l = o.stroke && o.stroke !== "none"
          , c = wP(n, i, a);
        return A.createElement("g", {
            className: s
        }, A.createElement("path", hn({}, F(o, !0), {
            fill: c.slice(-1) === "Z" ? o.fill : "none",
            stroke: "none",
            d: c
        })), l ? A.createElement("path", hn({}, F(o, !0), {
            fill: "none",
            d: _r(n, a)
        })) : null, l ? A.createElement("path", hn({}, F(o, !0), {
            fill: "none",
            d: _r(i, a)
        })) : null)
    }
    var u = _r(n, a);
    return A.createElement("path", hn({}, F(o, !0), {
        fill: u.slice(-1) === "Z" ? o.fill : "none",
        className: s,
        d: u
    }))
};
function hs() {
    return hs = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    hs.apply(this, arguments)
}
var fi = function(t) {
    var n = t.cx
      , r = t.cy
      , i = t.r
      , a = t.className
      , o = U("recharts-dot", a);
    return n === +n && r === +r && i === +i ? A.createElement("circle", hs({}, F(t, !1), qi(t), {
        className: o,
        cx: n,
        cy: r,
        r: i
    })) : null
};
function Zr(e) {
    "@babel/helpers - typeof";
    return Zr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Zr(e)
}
var PP = ["x", "y", "top", "left", "width", "height", "className"];
function ds() {
    return ds = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    ds.apply(this, arguments)
}
function tf(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function AP(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? tf(Object(n), !0).forEach(function(r) {
            SP(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : tf(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function SP(e, t, n) {
    return t = kP(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function kP(e) {
    var t = EP(e, "string");
    return Zr(t) == "symbol" ? t : t + ""
}
function EP(e, t) {
    if (Zr(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Zr(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
function MP(e, t) {
    if (e == null)
        return {};
    var n = TP(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function TP(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
var jP = function(t, n, r, i, a, o) {
    return "M".concat(t, ",").concat(a, "v").concat(i, "M").concat(o, ",").concat(n, "h").concat(r)
}
  , CP = function(t) {
    var n = t.x
      , r = n === void 0 ? 0 : n
      , i = t.y
      , a = i === void 0 ? 0 : i
      , o = t.top
      , s = o === void 0 ? 0 : o
      , l = t.left
      , c = l === void 0 ? 0 : l
      , u = t.width
      , f = u === void 0 ? 0 : u
      , h = t.height
      , d = h === void 0 ? 0 : h
      , p = t.className
      , g = MP(t, PP)
      , m = AP({
        x: r,
        y: a,
        top: s,
        left: c,
        width: f,
        height: d
    }, g);
    return !L(r) || !L(a) || !L(f) || !L(d) || !L(s) || !L(c) ? null : A.createElement("path", ds({}, F(m, !0), {
        className: U("recharts-cross", p),
        d: jP(r, a, f, d, s, c)
    }))
}
  , DP = ["cx", "cy", "angle", "ticks", "axisLine"]
  , IP = ["ticks", "tick", "angle", "tickFormatter", "stroke"];
function Mn(e) {
    "@babel/helpers - typeof";
    return Mn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Mn(e)
}
function Pr() {
    return Pr = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    Pr.apply(this, arguments)
}
function ef(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function Ne(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? ef(Object(n), !0).forEach(function(r) {
            Wa(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ef(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function nf(e, t) {
    if (e == null)
        return {};
    var n = $P(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function $P(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function LP(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function rf(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, mp(r.key), r)
    }
}
function RP(e, t, n) {
    return t && rf(e.prototype, t),
    n && rf(e, n),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function BP(e, t, n) {
    return t = la(t),
    NP(e, gp() ? Reflect.construct(t, n || [], la(e).constructor) : t.apply(e, n))
}
function NP(e, t) {
    if (t && (Mn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return zP(e)
}
function zP(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function gp() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (gp = function() {
        return !!e
    }
    )()
}
function la(e) {
    return la = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    la(e)
}
function FP(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && ps(e, t)
}
function ps(e, t) {
    return ps = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    ps(e, t)
}
function Wa(e, t, n) {
    return t = mp(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function mp(e) {
    var t = WP(e, "string");
    return Mn(t) == "symbol" ? t : t + ""
}
function WP(e, t) {
    if (Mn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Mn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var Va = function(e) {
    function t() {
        return LP(this, t),
        BP(this, t, arguments)
    }
    return FP(t, e),
    RP(t, [{
        key: "getTickValueCoord",
        value: function(r) {
            var i = r.coordinate
              , a = this.props
              , o = a.angle
              , s = a.cx
              , l = a.cy;
            return it(s, l, i, o)
        }
    }, {
        key: "getTickTextAnchor",
        value: function() {
            var r = this.props.orientation, i;
            switch (r) {
            case "left":
                i = "end";
                break;
            case "right":
                i = "start";
                break;
            default:
                i = "middle";
                break
            }
            return i
        }
    }, {
        key: "getViewBox",
        value: function() {
            var r = this.props
              , i = r.cx
              , a = r.cy
              , o = r.angle
              , s = r.ticks
              , l = Gg(s, function(u) {
                return u.coordinate || 0
            })
              , c = Ug(s, function(u) {
                return u.coordinate || 0
            });
            return {
                cx: i,
                cy: a,
                startAngle: o,
                endAngle: o,
                innerRadius: c.coordinate || 0,
                outerRadius: l.coordinate || 0
            }
        }
    }, {
        key: "renderAxisLine",
        value: function() {
            var r = this.props
              , i = r.cx
              , a = r.cy
              , o = r.angle
              , s = r.ticks
              , l = r.axisLine
              , c = nf(r, DP)
              , u = s.reduce(function(p, g) {
                return [Math.min(p[0], g.coordinate), Math.max(p[1], g.coordinate)]
            }, [1 / 0, -1 / 0])
              , f = it(i, a, u[0], o)
              , h = it(i, a, u[1], o)
              , d = Ne(Ne(Ne({}, F(c, !1)), {}, {
                fill: "none"
            }, F(l, !1)), {}, {
                x1: f.x,
                y1: f.y,
                x2: h.x,
                y2: h.y
            });
            return A.createElement("line", Pr({
                className: "recharts-polar-radius-axis-line"
            }, d))
        }
    }, {
        key: "renderTicks",
        value: function() {
            var r = this
              , i = this.props
              , a = i.ticks
              , o = i.tick
              , s = i.angle
              , l = i.tickFormatter
              , c = i.stroke
              , u = nf(i, IP)
              , f = this.getTickTextAnchor()
              , h = F(u, !1)
              , d = F(o, !1)
              , p = a.map(function(g, m) {
                var v = r.getTickValueCoord(g)
                  , b = Ne(Ne(Ne(Ne({
                    textAnchor: f,
                    transform: "rotate(".concat(90 - s, ", ").concat(v.x, ", ").concat(v.y, ")")
                }, h), {}, {
                    stroke: "none",
                    fill: c
                }, d), {}, {
                    index: m
                }, v), {}, {
                    payload: g
                });
                return A.createElement(q, Pr({
                    className: U("recharts-polar-radius-axis-tick", fp(o)),
                    key: "tick-".concat(g.coordinate)
                }, Ae(r.props, g, m)), t.renderTickItem(o, b, l ? l(g.value, m) : g.value))
            });
            return A.createElement(q, {
                className: "recharts-polar-radius-axis-ticks"
            }, p)
        }
    }, {
        key: "render",
        value: function() {
            var r = this.props
              , i = r.ticks
              , a = r.axisLine
              , o = r.tick;
            return !i || !i.length ? null : A.createElement(q, {
                className: U("recharts-polar-radius-axis", this.props.className)
            }, a && this.renderAxisLine(), o && this.renderTicks(), xt.renderCallByParent(this.props, this.getViewBox()))
        }
    }], [{
        key: "renderTickItem",
        value: function(r, i, a) {
            var o;
            return A.isValidElement(r) ? o = A.cloneElement(r, i) : K(r) ? o = r(i) : o = A.createElement(Qe, Pr({}, i, {
                className: "recharts-polar-radius-axis-tick-value"
            }), a),
            o
        }
    }])
}(N.PureComponent);
Wa(Va, "displayName", "PolarRadiusAxis");
Wa(Va, "axisType", "radiusAxis");
Wa(Va, "defaultProps", {
    type: "number",
    radiusAxisId: 0,
    cx: 0,
    cy: 0,
    angle: 0,
    orientation: "right",
    stroke: "#ccc",
    axisLine: !0,
    tick: !0,
    tickCount: 5,
    allowDataOverflow: !1,
    scale: "auto",
    allowDuplicatedCategory: !0
});
function Tn(e) {
    "@babel/helpers - typeof";
    return Tn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Tn(e)
}
function Ve() {
    return Ve = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    Ve.apply(this, arguments)
}
function af(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function ze(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? af(Object(n), !0).forEach(function(r) {
            Ha(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : af(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function VP(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function of(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, vp(r.key), r)
    }
}
function HP(e, t, n) {
    return t && of(e.prototype, t),
    n && of(e, n),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function KP(e, t, n) {
    return t = ca(t),
    XP(e, yp() ? Reflect.construct(t, n || [], ca(e).constructor) : t.apply(e, n))
}
function XP(e, t) {
    if (t && (Tn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return GP(e)
}
function GP(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function yp() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (yp = function() {
        return !!e
    }
    )()
}
function ca(e) {
    return ca = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    ca(e)
}
function UP(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && gs(e, t)
}
function gs(e, t) {
    return gs = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    gs(e, t)
}
function Ha(e, t, n) {
    return t = vp(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function vp(e) {
    var t = YP(e, "string");
    return Tn(t) == "symbol" ? t : t + ""
}
function YP(e, t) {
    if (Tn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Tn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var qP = Math.PI / 180
  , ZP = 1e-5
  , Ka = function(e) {
    function t() {
        return VP(this, t),
        KP(this, t, arguments)
    }
    return UP(t, e),
    HP(t, [{
        key: "getTickLineCoord",
        value: function(r) {
            var i = this.props
              , a = i.cx
              , o = i.cy
              , s = i.radius
              , l = i.orientation
              , c = i.tickSize
              , u = c || 8
              , f = it(a, o, s, r.coordinate)
              , h = it(a, o, s + (l === "inner" ? -1 : 1) * u, r.coordinate);
            return {
                x1: f.x,
                y1: f.y,
                x2: h.x,
                y2: h.y
            }
        }
    }, {
        key: "getTickTextAnchor",
        value: function(r) {
            var i = this.props.orientation, a = Math.cos(-r.coordinate * qP), o;
            return a > ZP ? o = i === "outer" ? "start" : "end" : a < -1e-5 ? o = i === "outer" ? "end" : "start" : o = "middle",
            o
        }
    }, {
        key: "renderAxisLine",
        value: function() {
            var r = this.props
              , i = r.cx
              , a = r.cy
              , o = r.radius
              , s = r.axisLine
              , l = r.axisLineType
              , c = ze(ze({}, F(this.props, !1)), {}, {
                fill: "none"
            }, F(s, !1));
            if (l === "circle")
                return A.createElement(fi, Ve({
                    className: "recharts-polar-angle-axis-line"
                }, c, {
                    cx: i,
                    cy: a,
                    r: o
                }));
            var u = this.props.ticks
              , f = u.map(function(h) {
                return it(i, a, o, h.coordinate)
            });
            return A.createElement(_P, Ve({
                className: "recharts-polar-angle-axis-line"
            }, c, {
                points: f
            }))
        }
    }, {
        key: "renderTicks",
        value: function() {
            var r = this
              , i = this.props
              , a = i.ticks
              , o = i.tick
              , s = i.tickLine
              , l = i.tickFormatter
              , c = i.stroke
              , u = F(this.props, !1)
              , f = F(o, !1)
              , h = ze(ze({}, u), {}, {
                fill: "none"
            }, F(s, !1))
              , d = a.map(function(p, g) {
                var m = r.getTickLineCoord(p)
                  , v = r.getTickTextAnchor(p)
                  , b = ze(ze(ze({
                    textAnchor: v
                }, u), {}, {
                    stroke: "none",
                    fill: c
                }, f), {}, {
                    index: g,
                    payload: p,
                    x: m.x2,
                    y: m.y2
                });
                return A.createElement(q, Ve({
                    className: U("recharts-polar-angle-axis-tick", fp(o)),
                    key: "tick-".concat(p.coordinate)
                }, Ae(r.props, p, g)), s && A.createElement("line", Ve({
                    className: "recharts-polar-angle-axis-tick-line"
                }, h, m)), o && t.renderTickItem(o, b, l ? l(p.value, g) : p.value))
            });
            return A.createElement(q, {
                className: "recharts-polar-angle-axis-ticks"
            }, d)
        }
    }, {
        key: "render",
        value: function() {
            var r = this.props
              , i = r.ticks
              , a = r.radius
              , o = r.axisLine;
            return a <= 0 || !i || !i.length ? null : A.createElement(q, {
                className: U("recharts-polar-angle-axis", this.props.className)
            }, o && this.renderAxisLine(), this.renderTicks())
        }
    }], [{
        key: "renderTickItem",
        value: function(r, i, a) {
            var o;
            return A.isValidElement(r) ? o = A.cloneElement(r, i) : K(r) ? o = r(i) : o = A.createElement(Qe, Ve({}, i, {
                className: "recharts-polar-angle-axis-tick-value"
            }), a),
            o
        }
    }])
}(N.PureComponent);
Ha(Ka, "displayName", "PolarAngleAxis");
Ha(Ka, "axisType", "angleAxis");
Ha(Ka, "defaultProps", {
    type: "category",
    angleAxisId: 0,
    scale: "auto",
    cx: 0,
    cy: 0,
    orientation: "outer",
    axisLine: !0,
    tickLine: !0,
    tickSize: 8,
    tick: !0,
    hide: !1,
    allowDuplicatedCategory: !0
});
function Jr(e) {
    "@babel/helpers - typeof";
    return Jr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Jr(e)
}
function ua() {
    return ua = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    ua.apply(this, arguments)
}
function JP(e, t) {
    return nA(e) || eA(e, t) || tA(e, t) || QP()
}
function QP() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function tA(e, t) {
    if (e) {
        if (typeof e == "string")
            return sf(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return sf(e, t)
    }
}
function sf(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
function eA(e, t) {
    var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
    if (n != null) {
        var r, i, a, o, s = [], l = !0, c = !1;
        try {
            if (a = (n = n.call(e)).next,
            t !== 0)
                for (; !(l = (r = a.call(n)).done) && (s.push(r.value),
                s.length !== t); l = !0)
                    ;
        } catch (u) {
            c = !0,
            i = u
        } finally {
            try {
                if (!l && n.return != null && (o = n.return(),
                Object(o) !== o))
                    return
            } finally {
                if (c)
                    throw i
            }
        }
        return s
    }
}
function nA(e) {
    if (Array.isArray(e))
        return e
}
function lf(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function cf(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? lf(Object(n), !0).forEach(function(r) {
            rA(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : lf(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function rA(e, t, n) {
    return t = iA(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function iA(e) {
    var t = aA(e, "string");
    return Jr(t) == "symbol" ? t : t + ""
}
function aA(e, t) {
    if (Jr(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Jr(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
var uf = function(t, n, r, i, a) {
    var o = r - i, s;
    return s = "M ".concat(t, ",").concat(n),
    s += "L ".concat(t + r, ",").concat(n),
    s += "L ".concat(t + r - o / 2, ",").concat(n + a),
    s += "L ".concat(t + r - o / 2 - i, ",").concat(n + a),
    s += "L ".concat(t, ",").concat(n, " Z"),
    s
}
  , oA = {
    x: 0,
    y: 0,
    upperWidth: 0,
    lowerWidth: 0,
    height: 0,
    isUpdateAnimationActive: !1,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: "ease"
}
  , sA = function(t) {
    var n = cf(cf({}, oA), t)
      , r = N.useRef()
      , i = N.useState(-1)
      , a = JP(i, 2)
      , o = a[0]
      , s = a[1];
    N.useEffect(function() {
        if (r.current && r.current.getTotalLength)
            try {
                var x = r.current.getTotalLength();
                x && s(x)
            } catch {}
    }, []);
    var l = n.x
      , c = n.y
      , u = n.upperWidth
      , f = n.lowerWidth
      , h = n.height
      , d = n.className
      , p = n.animationEasing
      , g = n.animationDuration
      , m = n.animationBegin
      , v = n.isUpdateAnimationActive;
    if (l !== +l || c !== +c || u !== +u || f !== +f || h !== +h || u === 0 && f === 0 || h === 0)
        return null;
    var b = U("recharts-trapezoid", d);
    return v ? A.createElement(fe, {
        canBegin: o > 0,
        from: {
            upperWidth: 0,
            lowerWidth: 0,
            height: h,
            x: l,
            y: c
        },
        to: {
            upperWidth: u,
            lowerWidth: f,
            height: h,
            x: l,
            y: c
        },
        duration: g,
        animationEasing: p,
        isActive: v
    }, function(x) {
        var w = x.upperWidth
          , y = x.lowerWidth
          , O = x.height
          , _ = x.x
          , P = x.y;
        return A.createElement(fe, {
            canBegin: o > 0,
            from: "0px ".concat(o === -1 ? 1 : o, "px"),
            to: "".concat(o, "px 0px"),
            attributeName: "strokeDasharray",
            begin: m,
            duration: g,
            easing: p
        }, A.createElement("path", ua({}, F(n, !0), {
            className: b,
            d: uf(_, P, w, y, O),
            ref: r
        })))
    }) : A.createElement("g", null, A.createElement("path", ua({}, F(n, !0), {
        className: b,
        d: uf(l, c, u, f, h)
    })))
}
  , lA = ["option", "shapeType", "propTransformer", "activeClassName", "isActive"];
function Qr(e) {
    "@babel/helpers - typeof";
    return Qr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Qr(e)
}
function cA(e, t) {
    if (e == null)
        return {};
    var n = uA(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function uA(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function ff(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function fa(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? ff(Object(n), !0).forEach(function(r) {
            fA(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ff(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function fA(e, t, n) {
    return t = hA(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function hA(e) {
    var t = dA(e, "string");
    return Qr(t) == "symbol" ? t : t + ""
}
function dA(e, t) {
    if (Qr(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Qr(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
function pA(e, t) {
    return fa(fa({}, t), e)
}
function gA(e, t) {
    return e === "symbols"
}
function hf(e) {
    var t = e.shapeType
      , n = e.elementProps;
    switch (t) {
    case "rectangle":
        return A.createElement(ul, n);
    case "trapezoid":
        return A.createElement(sA, n);
    case "sector":
        return A.createElement(pp, n);
    case "symbols":
        if (gA(t))
            return A.createElement(Ra, n);
        break;
    default:
        return null
    }
}
function mA(e) {
    return N.isValidElement(e) ? e.props : e
}
function ha(e) {
    var t = e.option, n = e.shapeType, r = e.propTransformer, i = r === void 0 ? pA : r, a = e.activeClassName, o = a === void 0 ? "recharts-active-shape" : a, s = e.isActive, l = cA(e, lA), c;
    if (N.isValidElement(t))
        c = N.cloneElement(t, fa(fa({}, l), mA(t)));
    else if (K(t))
        c = t(l);
    else if (Yg(t) && !qg(t)) {
        var u = i(t, l);
        c = A.createElement(hf, {
            shapeType: n,
            elementProps: u
        })
    } else {
        var f = l;
        c = A.createElement(hf, {
            shapeType: n,
            elementProps: f
        })
    }
    return s ? A.createElement(q, {
        className: o
    }, c) : c
}
function Xa(e, t) {
    return t != null && "trapezoids"in e.props
}
function Ga(e, t) {
    return t != null && "sectors"in e.props
}
function ti(e, t) {
    return t != null && "points"in e.props
}
function yA(e, t) {
    var n, r, i = e.x === (t == null || (n = t.labelViewBox) === null || n === void 0 ? void 0 : n.x) || e.x === t.x, a = e.y === (t == null || (r = t.labelViewBox) === null || r === void 0 ? void 0 : r.y) || e.y === t.y;
    return i && a
}
function vA(e, t) {
    var n = e.endAngle === t.endAngle
      , r = e.startAngle === t.startAngle;
    return n && r
}
function bA(e, t) {
    var n = e.x === t.x
      , r = e.y === t.y
      , i = e.z === t.z;
    return n && r && i
}
function xA(e, t) {
    var n;
    return Xa(e, t) ? n = yA : Ga(e, t) ? n = vA : ti(e, t) && (n = bA),
    n
}
function OA(e, t) {
    var n;
    return Xa(e, t) ? n = "trapezoids" : Ga(e, t) ? n = "sectors" : ti(e, t) && (n = "points"),
    n
}
function wA(e, t) {
    if (Xa(e, t)) {
        var n;
        return (n = t.tooltipPayload) === null || n === void 0 || (n = n[0]) === null || n === void 0 || (n = n.payload) === null || n === void 0 ? void 0 : n.payload
    }
    if (Ga(e, t)) {
        var r;
        return (r = t.tooltipPayload) === null || r === void 0 || (r = r[0]) === null || r === void 0 || (r = r.payload) === null || r === void 0 ? void 0 : r.payload
    }
    return ti(e, t) ? t.payload : {}
}
function _A(e) {
    var t = e.activeTooltipItem
      , n = e.graphicalItem
      , r = e.itemData
      , i = OA(n, t)
      , a = wA(n, t)
      , o = r.filter(function(l, c) {
        var u = we(a, l)
          , f = n.props[i].filter(function(p) {
            var g = xA(n, t);
            return g(p, t)
        })
          , h = n.props[i].indexOf(f[f.length - 1])
          , d = c === h;
        return u && d
    })
      , s = r.indexOf(o[o.length - 1]);
    return s
}
var Bi;
function jn(e) {
    "@babel/helpers - typeof";
    return jn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    jn(e)
}
function dn() {
    return dn = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    dn.apply(this, arguments)
}
function df(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function nt(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? df(Object(n), !0).forEach(function(r) {
            Ft(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : df(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function PA(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function pf(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, xp(r.key), r)
    }
}
function AA(e, t, n) {
    return t && pf(e.prototype, t),
    n && pf(e, n),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function SA(e, t, n) {
    return t = da(t),
    kA(e, bp() ? Reflect.construct(t, n || [], da(e).constructor) : t.apply(e, n))
}
function kA(e, t) {
    if (t && (jn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return EA(e)
}
function EA(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function bp() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (bp = function() {
        return !!e
    }
    )()
}
function da(e) {
    return da = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    da(e)
}
function MA(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && ms(e, t)
}
function ms(e, t) {
    return ms = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    ms(e, t)
}
function Ft(e, t, n) {
    return t = xp(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function xp(e) {
    var t = TA(e, "string");
    return jn(t) == "symbol" ? t : t + ""
}
function TA(e, t) {
    if (jn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (jn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var Me = function(e) {
    function t(n) {
        var r;
        return PA(this, t),
        r = SA(this, t, [n]),
        Ft(r, "pieRef", null),
        Ft(r, "sectorRefs", []),
        Ft(r, "id", Ee("recharts-pie-")),
        Ft(r, "handleAnimationEnd", function() {
            var i = r.props.onAnimationEnd;
            r.setState({
                isAnimationFinished: !0
            }),
            K(i) && i()
        }),
        Ft(r, "handleAnimationStart", function() {
            var i = r.props.onAnimationStart;
            r.setState({
                isAnimationFinished: !1
            }),
            K(i) && i()
        }),
        r.state = {
            isAnimationFinished: !n.isAnimationActive,
            prevIsAnimationActive: n.isAnimationActive,
            prevAnimationId: n.animationId,
            sectorToFocus: 0
        },
        r
    }
    return MA(t, e),
    AA(t, [{
        key: "isActiveIndex",
        value: function(r) {
            var i = this.props.activeIndex;
            return Array.isArray(i) ? i.indexOf(r) !== -1 : r === i
        }
    }, {
        key: "hasActiveIndex",
        value: function() {
            var r = this.props.activeIndex;
            return Array.isArray(r) ? r.length !== 0 : r || r === 0
        }
    }, {
        key: "renderLabels",
        value: function(r) {
            var i = this.props.isAnimationActive;
            if (i && !this.state.isAnimationFinished)
                return null;
            var a = this.props
              , o = a.label
              , s = a.labelLine
              , l = a.dataKey
              , c = a.valueKey
              , u = F(this.props, !1)
              , f = F(o, !1)
              , h = F(s, !1)
              , d = o && o.offsetRadius || 20
              , p = r.map(function(g, m) {
                var v = (g.startAngle + g.endAngle) / 2
                  , b = it(g.cx, g.cy, g.outerRadius + d, v)
                  , x = nt(nt(nt(nt({}, u), g), {}, {
                    stroke: "none"
                }, f), {}, {
                    index: m,
                    textAnchor: t.getTextAnchor(b.x, g.cx)
                }, b)
                  , w = nt(nt(nt(nt({}, u), g), {}, {
                    fill: "none",
                    stroke: g.fill
                }, h), {}, {
                    index: m,
                    points: [it(g.cx, g.cy, g.outerRadius, v), b]
                })
                  , y = l;
                return X(l) && X(c) ? y = "value" : X(l) && (y = c),
                A.createElement(q, {
                    key: "label-".concat(g.startAngle, "-").concat(g.endAngle, "-").concat(g.midAngle, "-").concat(m)
                }, s && t.renderLabelLineItem(s, w, "line"), t.renderLabelItem(o, x, at(g, y)))
            });
            return A.createElement(q, {
                className: "recharts-pie-labels"
            }, p)
        }
    }, {
        key: "renderSectorsStatically",
        value: function(r) {
            var i = this
              , a = this.props
              , o = a.activeShape
              , s = a.blendStroke
              , l = a.inactiveShape;
            return r.map(function(c, u) {
                if (c?.startAngle === 0 && c?.endAngle === 0 && r.length !== 1)
                    return null;
                var f = i.isActiveIndex(u)
                  , h = l && i.hasActiveIndex() ? l : null
                  , d = f ? o : h
                  , p = nt(nt({}, c), {}, {
                    stroke: s ? c.fill : c.stroke,
                    tabIndex: -1
                });
                return A.createElement(q, dn({
                    ref: function(m) {
                        m && !i.sectorRefs.includes(m) && i.sectorRefs.push(m)
                    },
                    tabIndex: -1,
                    className: "recharts-pie-sector"
                }, Ae(i.props, c, u), {
                    key: "sector-".concat(c?.startAngle, "-").concat(c?.endAngle, "-").concat(c.midAngle, "-").concat(u)
                }), A.createElement(ha, dn({
                    option: d,
                    isActive: f,
                    shapeType: "sector"
                }, p)))
            })
        }
    }, {
        key: "renderSectorsWithAnimation",
        value: function() {
            var r = this
              , i = this.props
              , a = i.sectors
              , o = i.isAnimationActive
              , s = i.animationBegin
              , l = i.animationDuration
              , c = i.animationEasing
              , u = i.animationId
              , f = this.state
              , h = f.prevSectors
              , d = f.prevIsAnimationActive;
            return A.createElement(fe, {
                begin: s,
                duration: l,
                isActive: o,
                easing: c,
                from: {
                    t: 0
                },
                to: {
                    t: 1
                },
                key: "pie-".concat(u, "-").concat(d),
                onAnimationStart: this.handleAnimationStart,
                onAnimationEnd: this.handleAnimationEnd
            }, function(p) {
                var g = p.t
                  , m = []
                  , v = a && a[0]
                  , b = v.startAngle;
                return a.forEach(function(x, w) {
                    var y = h && h[w]
                      , O = w > 0 ? Bt(x, "paddingAngle", 0) : 0;
                    if (y) {
                        var _ = ft(y.endAngle - y.startAngle, x.endAngle - x.startAngle)
                          , P = nt(nt({}, x), {}, {
                            startAngle: b + O,
                            endAngle: b + _(g) + O
                        });
                        m.push(P),
                        b = P.endAngle
                    } else {
                        var S = x.endAngle
                          , k = x.startAngle
                          , E = ft(0, S - k)
                          , M = E(g)
                          , C = nt(nt({}, x), {}, {
                            startAngle: b + O,
                            endAngle: b + M + O
                        });
                        m.push(C),
                        b = C.endAngle
                    }
                }),
                A.createElement(q, null, r.renderSectorsStatically(m))
            })
        }
    }, {
        key: "attachKeyboardHandlers",
        value: function(r) {
            var i = this;
            r.onkeydown = function(a) {
                if (!a.altKey)
                    switch (a.key) {
                    case "ArrowLeft":
                        {
                            var o = ++i.state.sectorToFocus % i.sectorRefs.length;
                            i.sectorRefs[o].focus(),
                            i.setState({
                                sectorToFocus: o
                            });
                            break
                        }
                    case "ArrowRight":
                        {
                            var s = --i.state.sectorToFocus < 0 ? i.sectorRefs.length - 1 : i.state.sectorToFocus % i.sectorRefs.length;
                            i.sectorRefs[s].focus(),
                            i.setState({
                                sectorToFocus: s
                            });
                            break
                        }
                    case "Escape":
                        {
                            i.sectorRefs[i.state.sectorToFocus].blur(),
                            i.setState({
                                sectorToFocus: 0
                            });
                            break
                        }
                    }
            }
        }
    }, {
        key: "renderSectors",
        value: function() {
            var r = this.props
              , i = r.sectors
              , a = r.isAnimationActive
              , o = this.state.prevSectors;
            return a && i && i.length && (!o || !we(o, i)) ? this.renderSectorsWithAnimation() : this.renderSectorsStatically(i)
        }
    }, {
        key: "componentDidMount",
        value: function() {
            this.pieRef && this.attachKeyboardHandlers(this.pieRef)
        }
    }, {
        key: "render",
        value: function() {
            var r = this
              , i = this.props
              , a = i.hide
              , o = i.sectors
              , s = i.className
              , l = i.label
              , c = i.cx
              , u = i.cy
              , f = i.innerRadius
              , h = i.outerRadius
              , d = i.isAnimationActive
              , p = this.state.isAnimationFinished;
            if (a || !o || !o.length || !L(c) || !L(u) || !L(f) || !L(h))
                return null;
            var g = U("recharts-pie", s);
            return A.createElement(q, {
                tabIndex: this.props.rootTabIndex,
                className: g,
                ref: function(v) {
                    r.pieRef = v
                }
            }, this.renderSectors(), l && this.renderLabels(o), xt.renderCallByParent(this.props, null, !1), (!d || p) && Ut.renderCallByParent(this.props, o, !1))
        }
    }], [{
        key: "getDerivedStateFromProps",
        value: function(r, i) {
            return i.prevIsAnimationActive !== r.isAnimationActive ? {
                prevIsAnimationActive: r.isAnimationActive,
                prevAnimationId: r.animationId,
                curSectors: r.sectors,
                prevSectors: [],
                isAnimationFinished: !0
            } : r.isAnimationActive && r.animationId !== i.prevAnimationId ? {
                prevAnimationId: r.animationId,
                curSectors: r.sectors,
                prevSectors: i.curSectors,
                isAnimationFinished: !0
            } : r.sectors !== i.curSectors ? {
                curSectors: r.sectors,
                isAnimationFinished: !0
            } : null
        }
    }, {
        key: "getTextAnchor",
        value: function(r, i) {
            return r > i ? "start" : r < i ? "end" : "middle"
        }
    }, {
        key: "renderLabelLineItem",
        value: function(r, i, a) {
            if (A.isValidElement(r))
                return A.cloneElement(r, i);
            if (K(r))
                return r(i);
            var o = U("recharts-pie-label-line", typeof r != "boolean" ? r.className : "");
            return A.createElement(Oe, dn({}, i, {
                key: a,
                type: "linear",
                className: o
            }))
        }
    }, {
        key: "renderLabelItem",
        value: function(r, i, a) {
            if (A.isValidElement(r))
                return A.cloneElement(r, i);
            var o = a;
            if (K(r) && (o = r(i),
            A.isValidElement(o)))
                return o;
            var s = U("recharts-pie-label-text", typeof r != "boolean" && !K(r) ? r.className : "");
            return A.createElement(Qe, dn({}, i, {
                alignmentBaseline: "middle",
                className: s
            }), o)
        }
    }])
}(N.PureComponent);
Bi = Me;
Ft(Me, "displayName", "Pie");
Ft(Me, "defaultProps", {
    stroke: "#fff",
    fill: "#808080",
    legendType: "rect",
    cx: "50%",
    cy: "50%",
    startAngle: 0,
    endAngle: 360,
    innerRadius: 0,
    outerRadius: "80%",
    paddingAngle: 0,
    labelLine: !0,
    hide: !1,
    minAngle: 0,
    isAnimationActive: !de.isSsr,
    animationBegin: 400,
    animationDuration: 1500,
    animationEasing: "ease",
    nameKey: "name",
    blendStroke: !1,
    rootTabIndex: 0
});
Ft(Me, "parseDeltaAngle", function(e, t) {
    var n = Et(t - e)
      , r = Math.min(Math.abs(t - e), 360);
    return n * r
});
Ft(Me, "getRealPieData", function(e) {
    var t = e.data
      , n = e.children
      , r = F(e, !1)
      , i = Tt(n, Na);
    return t && t.length ? t.map(function(a, o) {
        return nt(nt(nt({
            payload: a
        }, r), a), i && i[o] && i[o].props)
    }) : i && i.length ? i.map(function(a) {
        return nt(nt({}, r), a.props)
    }) : []
});
Ft(Me, "parseCoordinateOfPie", function(e, t) {
    var n = t.top
      , r = t.left
      , i = t.width
      , a = t.height
      , o = up(i, a)
      , s = r + Mt(e.cx, i, i / 2)
      , l = n + Mt(e.cy, a, a / 2)
      , c = Mt(e.innerRadius, o, 0)
      , u = Mt(e.outerRadius, o, o * .8)
      , f = e.maxRadius || Math.sqrt(i * i + a * a) / 2;
    return {
        cx: s,
        cy: l,
        innerRadius: c,
        outerRadius: u,
        maxRadius: f
    }
});
Ft(Me, "getComposedData", function(e) {
    var t = e.item
      , n = e.offset
      , r = t.type.defaultProps !== void 0 ? nt(nt({}, t.type.defaultProps), t.props) : t.props
      , i = Bi.getRealPieData(r);
    if (!i || !i.length)
        return null;
    var a = r.cornerRadius
      , o = r.startAngle
      , s = r.endAngle
      , l = r.paddingAngle
      , c = r.dataKey
      , u = r.nameKey
      , f = r.valueKey
      , h = r.tooltipType
      , d = Math.abs(r.minAngle)
      , p = Bi.parseCoordinateOfPie(r, n)
      , g = Bi.parseDeltaAngle(o, s)
      , m = Math.abs(g)
      , v = c;
    X(c) && X(f) ? (Gt(!1, `Use "dataKey" to specify the value of pie,
      the props "valueKey" will be deprecated in 1.1.0`),
    v = "value") : X(c) && (Gt(!1, `Use "dataKey" to specify the value of pie,
      the props "valueKey" will be deprecated in 1.1.0`),
    v = f);
    var b = i.filter(function(P) {
        return at(P, v, 0) !== 0
    }).length, x = (m >= 360 ? b : b - 1) * l, w = m - b * d - x, y = i.reduce(function(P, S) {
        var k = at(S, v, 0);
        return P + (L(k) ? k : 0)
    }, 0), O;
    if (y > 0) {
        var _;
        O = i.map(function(P, S) {
            var k = at(P, v, 0), E = at(P, u, S), M = (L(k) ? k : 0) / y, C;
            S ? C = _.endAngle + Et(g) * l * (k !== 0 ? 1 : 0) : C = o;
            var I = C + Et(g) * ((k !== 0 ? d : 0) + M * w)
              , T = (C + I) / 2
              , j = (p.innerRadius + p.outerRadius) / 2
              , $ = [{
                name: E,
                value: k,
                payload: P,
                dataKey: v,
                type: h
            }]
              , R = it(p.cx, p.cy, j, T);
            return _ = nt(nt(nt({
                percent: M,
                cornerRadius: a,
                name: E,
                tooltipPayload: $,
                midAngle: T,
                middleRadius: j,
                tooltipPosition: R
            }, P), p), {}, {
                value: at(P, v),
                startAngle: C,
                endAngle: I,
                payload: P,
                paddingAngle: Et(g) * l
            }),
            _
        })
    }
    return nt(nt({}, p), {}, {
        sectors: O,
        data: i
    })
});
function ei(e) {
    "@babel/helpers - typeof";
    return ei = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    ei(e)
}
function gf(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function mf(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? gf(Object(n), !0).forEach(function(r) {
            Op(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : gf(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function Op(e, t, n) {
    return t = jA(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function jA(e) {
    var t = CA(e, "string");
    return ei(t) == "symbol" ? t : t + ""
}
function CA(e, t) {
    if (ei(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (ei(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
var DA = ["Webkit", "Moz", "O", "ms"]
  , IA = function(t, n) {
    var r = t.replace(/(\w)/, function(a) {
        return a.toUpperCase()
    })
      , i = DA.reduce(function(a, o) {
        return mf(mf({}, a), {}, Op({}, o + r, n))
    }, {});
    return i[t] = n,
    i
};
function Cn(e) {
    "@babel/helpers - typeof";
    return Cn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Cn(e)
}
function pa() {
    return pa = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    pa.apply(this, arguments)
}
function yf(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function _o(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? yf(Object(n), !0).forEach(function(r) {
            $t(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : yf(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function $A(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function vf(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, _p(r.key), r)
    }
}
function LA(e, t, n) {
    return t && vf(e.prototype, t),
    n && vf(e, n),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function RA(e, t, n) {
    return t = ga(t),
    BA(e, wp() ? Reflect.construct(t, n || [], ga(e).constructor) : t.apply(e, n))
}
function BA(e, t) {
    if (t && (Cn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return NA(e)
}
function NA(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function wp() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (wp = function() {
        return !!e
    }
    )()
}
function ga(e) {
    return ga = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    ga(e)
}
function zA(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && ys(e, t)
}
function ys(e, t) {
    return ys = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    ys(e, t)
}
function $t(e, t, n) {
    return t = _p(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function _p(e) {
    var t = FA(e, "string");
    return Cn(t) == "symbol" ? t : t + ""
}
function FA(e, t) {
    if (Cn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Cn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var WA = function(t) {
    var n = t.data
      , r = t.startIndex
      , i = t.endIndex
      , a = t.x
      , o = t.width
      , s = t.travellerWidth;
    if (!n || !n.length)
        return {};
    var l = n.length
      , c = $i().domain(Ni(0, l)).range([a, a + o - s])
      , u = c.domain().map(function(f) {
        return c(f)
    });
    return {
        isTextActive: !1,
        isSlideMoving: !1,
        isTravellerMoving: !1,
        isTravellerFocused: !1,
        startX: c(r),
        endX: c(i),
        scale: c,
        scaleValues: u
    }
}
  , bf = function(t) {
    return t.changedTouches && !!t.changedTouches.length
}
  , Dn = function(e) {
    function t(n) {
        var r;
        return $A(this, t),
        r = RA(this, t, [n]),
        $t(r, "handleDrag", function(i) {
            r.leaveTimer && (clearTimeout(r.leaveTimer),
            r.leaveTimer = null),
            r.state.isTravellerMoving ? r.handleTravellerMove(i) : r.state.isSlideMoving && r.handleSlideDrag(i)
        }),
        $t(r, "handleTouchMove", function(i) {
            i.changedTouches != null && i.changedTouches.length > 0 && r.handleDrag(i.changedTouches[0])
        }),
        $t(r, "handleDragEnd", function() {
            r.setState({
                isTravellerMoving: !1,
                isSlideMoving: !1
            }, function() {
                var i = r.props
                  , a = i.endIndex
                  , o = i.onDragEnd
                  , s = i.startIndex;
                o?.({
                    endIndex: a,
                    startIndex: s
                })
            }),
            r.detachDragEndListener()
        }),
        $t(r, "handleLeaveWrapper", function() {
            (r.state.isTravellerMoving || r.state.isSlideMoving) && (r.leaveTimer = window.setTimeout(r.handleDragEnd, r.props.leaveTimeOut))
        }),
        $t(r, "handleEnterSlideOrTraveller", function() {
            r.setState({
                isTextActive: !0
            })
        }),
        $t(r, "handleLeaveSlideOrTraveller", function() {
            r.setState({
                isTextActive: !1
            })
        }),
        $t(r, "handleSlideDragStart", function(i) {
            var a = bf(i) ? i.changedTouches[0] : i;
            r.setState({
                isTravellerMoving: !1,
                isSlideMoving: !0,
                slideMoveStartX: a.pageX
            }),
            r.attachDragEndListener()
        }),
        r.travellerDragStartHandlers = {
            startX: r.handleTravellerDragStart.bind(r, "startX"),
            endX: r.handleTravellerDragStart.bind(r, "endX")
        },
        r.state = {},
        r
    }
    return zA(t, e),
    LA(t, [{
        key: "componentWillUnmount",
        value: function() {
            this.leaveTimer && (clearTimeout(this.leaveTimer),
            this.leaveTimer = null),
            this.detachDragEndListener()
        }
    }, {
        key: "getIndex",
        value: function(r) {
            var i = r.startX
              , a = r.endX
              , o = this.state.scaleValues
              , s = this.props
              , l = s.gap
              , c = s.data
              , u = c.length - 1
              , f = Math.min(i, a)
              , h = Math.max(i, a)
              , d = t.getIndexInRange(o, f)
              , p = t.getIndexInRange(o, h);
            return {
                startIndex: d - d % l,
                endIndex: p === u ? u : p - p % l
            }
        }
    }, {
        key: "getTextOfTick",
        value: function(r) {
            var i = this.props
              , a = i.data
              , o = i.tickFormatter
              , s = i.dataKey
              , l = at(a[r], s, r);
            return K(o) ? o(l, r) : l
        }
    }, {
        key: "attachDragEndListener",
        value: function() {
            window.addEventListener("mouseup", this.handleDragEnd, !0),
            window.addEventListener("touchend", this.handleDragEnd, !0),
            window.addEventListener("mousemove", this.handleDrag, !0)
        }
    }, {
        key: "detachDragEndListener",
        value: function() {
            window.removeEventListener("mouseup", this.handleDragEnd, !0),
            window.removeEventListener("touchend", this.handleDragEnd, !0),
            window.removeEventListener("mousemove", this.handleDrag, !0)
        }
    }, {
        key: "handleSlideDrag",
        value: function(r) {
            var i = this.state
              , a = i.slideMoveStartX
              , o = i.startX
              , s = i.endX
              , l = this.props
              , c = l.x
              , u = l.width
              , f = l.travellerWidth
              , h = l.startIndex
              , d = l.endIndex
              , p = l.onChange
              , g = r.pageX - a;
            g > 0 ? g = Math.min(g, c + u - f - s, c + u - f - o) : g < 0 && (g = Math.max(g, c - o, c - s));
            var m = this.getIndex({
                startX: o + g,
                endX: s + g
            });
            (m.startIndex !== h || m.endIndex !== d) && p && p(m),
            this.setState({
                startX: o + g,
                endX: s + g,
                slideMoveStartX: r.pageX
            })
        }
    }, {
        key: "handleTravellerDragStart",
        value: function(r, i) {
            var a = bf(i) ? i.changedTouches[0] : i;
            this.setState({
                isSlideMoving: !1,
                isTravellerMoving: !0,
                movingTravellerId: r,
                brushMoveStartX: a.pageX
            }),
            this.attachDragEndListener()
        }
    }, {
        key: "handleTravellerMove",
        value: function(r) {
            var i = this.state
              , a = i.brushMoveStartX
              , o = i.movingTravellerId
              , s = i.endX
              , l = i.startX
              , c = this.state[o]
              , u = this.props
              , f = u.x
              , h = u.width
              , d = u.travellerWidth
              , p = u.onChange
              , g = u.gap
              , m = u.data
              , v = {
                startX: this.state.startX,
                endX: this.state.endX
            }
              , b = r.pageX - a;
            b > 0 ? b = Math.min(b, f + h - d - c) : b < 0 && (b = Math.max(b, f - c)),
            v[o] = c + b;
            var x = this.getIndex(v)
              , w = x.startIndex
              , y = x.endIndex
              , O = function() {
                var P = m.length - 1;
                return o === "startX" && (s > l ? w % g === 0 : y % g === 0) || s < l && y === P || o === "endX" && (s > l ? y % g === 0 : w % g === 0) || s > l && y === P
            };
            this.setState($t($t({}, o, c + b), "brushMoveStartX", r.pageX), function() {
                p && O() && p(x)
            })
        }
    }, {
        key: "handleTravellerMoveKeyboard",
        value: function(r, i) {
            var a = this
              , o = this.state
              , s = o.scaleValues
              , l = o.startX
              , c = o.endX
              , u = this.state[i]
              , f = s.indexOf(u);
            if (f !== -1) {
                var h = f + r;
                if (!(h === -1 || h >= s.length)) {
                    var d = s[h];
                    i === "startX" && d >= c || i === "endX" && d <= l || this.setState($t({}, i, d), function() {
                        a.props.onChange(a.getIndex({
                            startX: a.state.startX,
                            endX: a.state.endX
                        }))
                    })
                }
            }
        }
    }, {
        key: "renderBackground",
        value: function() {
            var r = this.props
              , i = r.x
              , a = r.y
              , o = r.width
              , s = r.height
              , l = r.fill
              , c = r.stroke;
            return A.createElement("rect", {
                stroke: c,
                fill: l,
                x: i,
                y: a,
                width: o,
                height: s
            })
        }
    }, {
        key: "renderPanorama",
        value: function() {
            var r = this.props
              , i = r.x
              , a = r.y
              , o = r.width
              , s = r.height
              , l = r.data
              , c = r.children
              , u = r.padding
              , f = N.Children.only(c);
            return f ? A.cloneElement(f, {
                x: i,
                y: a,
                width: o,
                height: s,
                margin: u,
                compact: !0,
                data: l
            }) : null
        }
    }, {
        key: "renderTravellerLayer",
        value: function(r, i) {
            var a, o, s = this, l = this.props, c = l.y, u = l.travellerWidth, f = l.height, h = l.traveller, d = l.ariaLabel, p = l.data, g = l.startIndex, m = l.endIndex, v = Math.max(r, this.props.x), b = _o(_o({}, F(this.props, !1)), {}, {
                x: v,
                y: c,
                width: u,
                height: f
            }), x = d || "Min value: ".concat((a = p[g]) === null || a === void 0 ? void 0 : a.name, ", Max value: ").concat((o = p[m]) === null || o === void 0 ? void 0 : o.name);
            return A.createElement(q, {
                tabIndex: 0,
                role: "slider",
                "aria-label": x,
                "aria-valuenow": r,
                className: "recharts-brush-traveller",
                onMouseEnter: this.handleEnterSlideOrTraveller,
                onMouseLeave: this.handleLeaveSlideOrTraveller,
                onMouseDown: this.travellerDragStartHandlers[i],
                onTouchStart: this.travellerDragStartHandlers[i],
                onKeyDown: function(y) {
                    ["ArrowLeft", "ArrowRight"].includes(y.key) && (y.preventDefault(),
                    y.stopPropagation(),
                    s.handleTravellerMoveKeyboard(y.key === "ArrowRight" ? 1 : -1, i))
                },
                onFocus: function() {
                    s.setState({
                        isTravellerFocused: !0
                    })
                },
                onBlur: function() {
                    s.setState({
                        isTravellerFocused: !1
                    })
                },
                style: {
                    cursor: "col-resize"
                }
            }, t.renderTraveller(h, b))
        }
    }, {
        key: "renderSlide",
        value: function(r, i) {
            var a = this.props
              , o = a.y
              , s = a.height
              , l = a.stroke
              , c = a.travellerWidth
              , u = Math.min(r, i) + c
              , f = Math.max(Math.abs(i - r) - c, 0);
            return A.createElement("rect", {
                className: "recharts-brush-slide",
                onMouseEnter: this.handleEnterSlideOrTraveller,
                onMouseLeave: this.handleLeaveSlideOrTraveller,
                onMouseDown: this.handleSlideDragStart,
                onTouchStart: this.handleSlideDragStart,
                style: {
                    cursor: "move"
                },
                stroke: "none",
                fill: l,
                fillOpacity: .2,
                x: u,
                y: o,
                width: f,
                height: s
            })
        }
    }, {
        key: "renderText",
        value: function() {
            var r = this.props
              , i = r.startIndex
              , a = r.endIndex
              , o = r.y
              , s = r.height
              , l = r.travellerWidth
              , c = r.stroke
              , u = this.state
              , f = u.startX
              , h = u.endX
              , d = 5
              , p = {
                pointerEvents: "none",
                fill: c
            };
            return A.createElement(q, {
                className: "recharts-brush-texts"
            }, A.createElement(Qe, pa({
                textAnchor: "end",
                verticalAnchor: "middle",
                x: Math.min(f, h) - d,
                y: o + s / 2
            }, p), this.getTextOfTick(i)), A.createElement(Qe, pa({
                textAnchor: "start",
                verticalAnchor: "middle",
                x: Math.max(f, h) + l + d,
                y: o + s / 2
            }, p), this.getTextOfTick(a)))
        }
    }, {
        key: "render",
        value: function() {
            var r = this.props
              , i = r.data
              , a = r.className
              , o = r.children
              , s = r.x
              , l = r.y
              , c = r.width
              , u = r.height
              , f = r.alwaysShowText
              , h = this.state
              , d = h.startX
              , p = h.endX
              , g = h.isTextActive
              , m = h.isSlideMoving
              , v = h.isTravellerMoving
              , b = h.isTravellerFocused;
            if (!i || !i.length || !L(s) || !L(l) || !L(c) || !L(u) || c <= 0 || u <= 0)
                return null;
            var x = U("recharts-brush", a)
              , w = A.Children.count(o) === 1
              , y = IA("userSelect", "none");
            return A.createElement(q, {
                className: x,
                onMouseLeave: this.handleLeaveWrapper,
                onTouchMove: this.handleTouchMove,
                style: y
            }, this.renderBackground(), w && this.renderPanorama(), this.renderSlide(d, p), this.renderTravellerLayer(d, "startX"), this.renderTravellerLayer(p, "endX"), (g || m || v || b || f) && this.renderText())
        }
    }], [{
        key: "renderDefaultTraveller",
        value: function(r) {
            var i = r.x
              , a = r.y
              , o = r.width
              , s = r.height
              , l = r.stroke
              , c = Math.floor(a + s / 2) - 1;
            return A.createElement(A.Fragment, null, A.createElement("rect", {
                x: i,
                y: a,
                width: o,
                height: s,
                fill: l,
                stroke: "none"
            }), A.createElement("line", {
                x1: i + 1,
                y1: c,
                x2: i + o - 1,
                y2: c,
                fill: "none",
                stroke: "#fff"
            }), A.createElement("line", {
                x1: i + 1,
                y1: c + 2,
                x2: i + o - 1,
                y2: c + 2,
                fill: "none",
                stroke: "#fff"
            }))
        }
    }, {
        key: "renderTraveller",
        value: function(r, i) {
            var a;
            return A.isValidElement(r) ? a = A.cloneElement(r, i) : K(r) ? a = r(i) : a = t.renderDefaultTraveller(i),
            a
        }
    }, {
        key: "getDerivedStateFromProps",
        value: function(r, i) {
            var a = r.data
              , o = r.width
              , s = r.x
              , l = r.travellerWidth
              , c = r.updateId
              , u = r.startIndex
              , f = r.endIndex;
            if (a !== i.prevData || c !== i.prevUpdateId)
                return _o({
                    prevData: a,
                    prevTravellerWidth: l,
                    prevUpdateId: c,
                    prevX: s,
                    prevWidth: o
                }, a && a.length ? WA({
                    data: a,
                    width: o,
                    x: s,
                    travellerWidth: l,
                    startIndex: u,
                    endIndex: f
                }) : {
                    scale: null,
                    scaleValues: null
                });
            if (i.scale && (o !== i.prevWidth || s !== i.prevX || l !== i.prevTravellerWidth)) {
                i.scale.range([s, s + o - l]);
                var h = i.scale.domain().map(function(d) {
                    return i.scale(d)
                });
                return {
                    prevData: a,
                    prevTravellerWidth: l,
                    prevUpdateId: c,
                    prevX: s,
                    prevWidth: o,
                    startX: i.scale(r.startIndex),
                    endX: i.scale(r.endIndex),
                    scaleValues: h
                }
            }
            return null
        }
    }, {
        key: "getIndexInRange",
        value: function(r, i) {
            for (var a = r.length, o = 0, s = a - 1; s - o > 1; ) {
                var l = Math.floor((o + s) / 2);
                r[l] > i ? s = l : o = l
            }
            return i >= r[s] ? s : o
        }
    }])
}(N.PureComponent);
$t(Dn, "displayName", "Brush");
$t(Dn, "defaultProps", {
    height: 40,
    travellerWidth: 5,
    gap: 1,
    fill: "#fff",
    stroke: "#666",
    padding: {
        top: 1,
        right: 1,
        bottom: 1,
        left: 1
    },
    leaveTimeOut: 1e3,
    alwaysShowText: !1
});
var Qt = function(t, n) {
    var r = t.alwaysShow
      , i = t.ifOverflow;
    return r && (i = "extendDomain"),
    i === n
}
  , VA = ["x", "y"];
function ni(e) {
    "@babel/helpers - typeof";
    return ni = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    ni(e)
}
function vs() {
    return vs = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    vs.apply(this, arguments)
}
function xf(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function dr(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? xf(Object(n), !0).forEach(function(r) {
            HA(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : xf(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function HA(e, t, n) {
    return t = KA(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function KA(e) {
    var t = XA(e, "string");
    return ni(t) == "symbol" ? t : t + ""
}
function XA(e, t) {
    if (ni(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (ni(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
function GA(e, t) {
    if (e == null)
        return {};
    var n = UA(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function UA(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function YA(e, t) {
    var n = e.x
      , r = e.y
      , i = GA(e, VA)
      , a = "".concat(n)
      , o = parseInt(a, 10)
      , s = "".concat(r)
      , l = parseInt(s, 10)
      , c = "".concat(t.height || i.height)
      , u = parseInt(c, 10)
      , f = "".concat(t.width || i.width)
      , h = parseInt(f, 10);
    return dr(dr(dr(dr(dr({}, t), i), o ? {
        x: o
    } : {}), l ? {
        y: l
    } : {}), {}, {
        height: u,
        width: h,
        name: t.name,
        radius: t.radius
    })
}
function Of(e) {
    return A.createElement(ha, vs({
        shapeType: "rectangle",
        propTransformer: YA,
        activeClassName: "recharts-active-bar"
    }, e))
}
var qA = function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
    return function(r, i) {
        if (typeof t == "number")
            return t;
        var a = typeof r == "number";
        return a ? t(r, i) : (a || qe(),
        n)
    }
}, ZA = ["value", "background"], Pp;
function In(e) {
    "@babel/helpers - typeof";
    return In = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    In(e)
}
function JA(e, t) {
    if (e == null)
        return {};
    var n = QA(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function QA(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function ma() {
    return ma = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    ma.apply(this, arguments)
}
function wf(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function gt(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? wf(Object(n), !0).forEach(function(r) {
            be(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : wf(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function tS(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function _f(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, Sp(r.key), r)
    }
}
function eS(e, t, n) {
    return t && _f(e.prototype, t),
    n && _f(e, n),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function nS(e, t, n) {
    return t = ya(t),
    rS(e, Ap() ? Reflect.construct(t, n || [], ya(e).constructor) : t.apply(e, n))
}
function rS(e, t) {
    if (t && (In(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return iS(e)
}
function iS(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function Ap() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (Ap = function() {
        return !!e
    }
    )()
}
function ya(e) {
    return ya = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    ya(e)
}
function aS(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && bs(e, t)
}
function bs(e, t) {
    return bs = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    bs(e, t)
}
function be(e, t, n) {
    return t = Sp(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function Sp(e) {
    var t = oS(e, "string");
    return In(t) == "symbol" ? t : t + ""
}
function oS(e, t) {
    if (In(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (In(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var qn = function(e) {
    function t() {
        var n;
        tS(this, t);
        for (var r = arguments.length, i = new Array(r), a = 0; a < r; a++)
            i[a] = arguments[a];
        return n = nS(this, t, [].concat(i)),
        be(n, "state", {
            isAnimationFinished: !1
        }),
        be(n, "id", Ee("recharts-bar-")),
        be(n, "handleAnimationEnd", function() {
            var o = n.props.onAnimationEnd;
            n.setState({
                isAnimationFinished: !0
            }),
            o && o()
        }),
        be(n, "handleAnimationStart", function() {
            var o = n.props.onAnimationStart;
            n.setState({
                isAnimationFinished: !1
            }),
            o && o()
        }),
        n
    }
    return aS(t, e),
    eS(t, [{
        key: "renderRectanglesStatically",
        value: function(r) {
            var i = this
              , a = this.props
              , o = a.shape
              , s = a.dataKey
              , l = a.activeIndex
              , c = a.activeBar
              , u = F(this.props, !1);
            return r && r.map(function(f, h) {
                var d = h === l
                  , p = d ? c : o
                  , g = gt(gt(gt({}, u), f), {}, {
                    isActive: d,
                    option: p,
                    index: h,
                    dataKey: s,
                    onAnimationStart: i.handleAnimationStart,
                    onAnimationEnd: i.handleAnimationEnd
                });
                return A.createElement(q, ma({
                    className: "recharts-bar-rectangle"
                }, Ae(i.props, f, h), {
                    key: "rectangle-".concat(f?.x, "-").concat(f?.y, "-").concat(f?.value, "-").concat(h)
                }), A.createElement(Of, g))
            })
        }
    }, {
        key: "renderRectanglesWithAnimation",
        value: function() {
            var r = this
              , i = this.props
              , a = i.data
              , o = i.layout
              , s = i.isAnimationActive
              , l = i.animationBegin
              , c = i.animationDuration
              , u = i.animationEasing
              , f = i.animationId
              , h = this.state.prevData;
            return A.createElement(fe, {
                begin: l,
                duration: c,
                isActive: s,
                easing: u,
                from: {
                    t: 0
                },
                to: {
                    t: 1
                },
                key: "bar-".concat(f),
                onAnimationEnd: this.handleAnimationEnd,
                onAnimationStart: this.handleAnimationStart
            }, function(d) {
                var p = d.t
                  , g = a.map(function(m, v) {
                    var b = h && h[v];
                    if (b) {
                        var x = ft(b.x, m.x)
                          , w = ft(b.y, m.y)
                          , y = ft(b.width, m.width)
                          , O = ft(b.height, m.height);
                        return gt(gt({}, m), {}, {
                            x: x(p),
                            y: w(p),
                            width: y(p),
                            height: O(p)
                        })
                    }
                    if (o === "horizontal") {
                        var _ = ft(0, m.height)
                          , P = _(p);
                        return gt(gt({}, m), {}, {
                            y: m.y + m.height - P,
                            height: P
                        })
                    }
                    var S = ft(0, m.width)
                      , k = S(p);
                    return gt(gt({}, m), {}, {
                        width: k
                    })
                });
                return A.createElement(q, null, r.renderRectanglesStatically(g))
            })
        }
    }, {
        key: "renderRectangles",
        value: function() {
            var r = this.props
              , i = r.data
              , a = r.isAnimationActive
              , o = this.state.prevData;
            return a && i && i.length && (!o || !we(o, i)) ? this.renderRectanglesWithAnimation() : this.renderRectanglesStatically(i)
        }
    }, {
        key: "renderBackground",
        value: function() {
            var r = this
              , i = this.props
              , a = i.data
              , o = i.dataKey
              , s = i.activeIndex
              , l = F(this.props.background, !1);
            return a.map(function(c, u) {
                c.value;
                var f = c.background
                  , h = JA(c, ZA);
                if (!f)
                    return null;
                var d = gt(gt(gt(gt(gt({}, h), {}, {
                    fill: "#eee"
                }, f), l), Ae(r.props, c, u)), {}, {
                    onAnimationStart: r.handleAnimationStart,
                    onAnimationEnd: r.handleAnimationEnd,
                    dataKey: o,
                    index: u,
                    className: "recharts-bar-background-rectangle"
                });
                return A.createElement(Of, ma({
                    key: "background-bar-".concat(u),
                    option: r.props.background,
                    isActive: u === s
                }, d))
            })
        }
    }, {
        key: "renderErrorBar",
        value: function(r, i) {
            if (this.props.isAnimationActive && !this.state.isAnimationFinished)
                return null;
            var a = this.props
              , o = a.data
              , s = a.xAxis
              , l = a.yAxis
              , c = a.layout
              , u = a.children
              , f = Tt(u, Yn);
            if (!f)
                return null;
            var h = c === "vertical" ? o[0].height / 2 : o[0].width / 2
              , d = function(m, v) {
                var b = Array.isArray(m.value) ? m.value[1] : m.value;
                return {
                    x: m.x,
                    y: m.y,
                    value: b,
                    errorVal: at(m, v)
                }
            }
              , p = {
                clipPath: r ? "url(#clipPath-".concat(i, ")") : null
            };
            return A.createElement(q, p, f.map(function(g) {
                return A.cloneElement(g, {
                    key: "error-bar-".concat(i, "-").concat(g.props.dataKey),
                    data: o,
                    xAxis: s,
                    yAxis: l,
                    layout: c,
                    offset: h,
                    dataPointFormatter: d
                })
            }))
        }
    }, {
        key: "render",
        value: function() {
            var r = this.props
              , i = r.hide
              , a = r.data
              , o = r.className
              , s = r.xAxis
              , l = r.yAxis
              , c = r.left
              , u = r.top
              , f = r.width
              , h = r.height
              , d = r.isAnimationActive
              , p = r.background
              , g = r.id;
            if (i || !a || !a.length)
                return null;
            var m = this.state.isAnimationFinished
              , v = U("recharts-bar", o)
              , b = s && s.allowDataOverflow
              , x = l && l.allowDataOverflow
              , w = b || x
              , y = X(g) ? this.id : g;
            return A.createElement(q, {
                className: v
            }, b || x ? A.createElement("defs", null, A.createElement("clipPath", {
                id: "clipPath-".concat(y)
            }, A.createElement("rect", {
                x: b ? c : c - f / 2,
                y: x ? u : u - h / 2,
                width: b ? f : f * 2,
                height: x ? h : h * 2
            }))) : null, A.createElement(q, {
                className: "recharts-bar-rectangles",
                clipPath: w ? "url(#clipPath-".concat(y, ")") : null
            }, p ? this.renderBackground() : null, this.renderRectangles()), this.renderErrorBar(w, y), (!d || m) && Ut.renderCallByParent(this.props, a))
        }
    }], [{
        key: "getDerivedStateFromProps",
        value: function(r, i) {
            return r.animationId !== i.prevAnimationId ? {
                prevAnimationId: r.animationId,
                curData: r.data,
                prevData: i.curData
            } : r.data !== i.curData ? {
                curData: r.data
            } : null
        }
    }])
}(N.PureComponent);
Pp = qn;
be(qn, "displayName", "Bar");
be(qn, "defaultProps", {
    xAxisId: 0,
    yAxisId: 0,
    legendType: "rect",
    minPointSize: 0,
    hide: !1,
    data: [],
    layout: "vertical",
    activeBar: !1,
    isAnimationActive: !de.isSsr,
    animationBegin: 0,
    animationDuration: 400,
    animationEasing: "ease"
});
be(qn, "getComposedData", function(e) {
    var t = e.props
      , n = e.item
      , r = e.barPosition
      , i = e.bandSize
      , a = e.xAxis
      , o = e.yAxis
      , s = e.xAxisTicks
      , l = e.yAxisTicks
      , c = e.stackedData
      , u = e.dataStartIndex
      , f = e.displayedData
      , h = e.offset
      , d = Kw(r, n);
    if (!d)
        return null;
    var p = t.layout
      , g = n.type.defaultProps
      , m = g !== void 0 ? gt(gt({}, g), n.props) : n.props
      , v = m.dataKey
      , b = m.children
      , x = m.minPointSize
      , w = p === "horizontal" ? o : a
      , y = c ? w.scale.domain() : null
      , O = Jw({
        numericAxis: w
    })
      , _ = Tt(b, Na)
      , P = f.map(function(S, k) {
        var E, M, C, I, T, j;
        c ? E = Xw(c[u + k], y) : (E = at(S, v),
        Array.isArray(E) || (E = [O, E]));
        var $ = qA(x, Pp.defaultProps.minPointSize)(E[1], k);
        if (p === "horizontal") {
            var R, B = [o.scale(E[0]), o.scale(E[1])], W = B[0], V = B[1];
            M = Cu({
                axis: a,
                ticks: s,
                bandSize: i,
                offset: d.offset,
                entry: S,
                index: k
            }),
            C = (R = V ?? W) !== null && R !== void 0 ? R : void 0,
            I = d.size;
            var z = W - V;
            if (T = Number.isNaN(z) ? 0 : z,
            j = {
                x: M,
                y: o.y,
                width: I,
                height: o.height
            },
            Math.abs($) > 0 && Math.abs(T) < Math.abs($)) {
                var H = Et(T || $) * (Math.abs($) - Math.abs(T));
                C -= H,
                T += H
            }
        } else {
            var Q = [a.scale(E[0]), a.scale(E[1])]
              , ct = Q[0]
              , mt = Q[1];
            if (M = ct,
            C = Cu({
                axis: o,
                ticks: l,
                bandSize: i,
                offset: d.offset,
                entry: S,
                index: k
            }),
            I = mt - ct,
            T = d.size,
            j = {
                x: a.x,
                y: C,
                width: a.width,
                height: T
            },
            Math.abs($) > 0 && Math.abs(I) < Math.abs($)) {
                var tr = Et(I || $) * (Math.abs($) - Math.abs(I));
                I += tr
            }
        }
        return gt(gt(gt({}, S), {}, {
            x: M,
            y: C,
            width: I,
            height: T,
            value: c ? E : E[1],
            payload: S,
            background: j
        }, _ && _[k] && _[k].props), {}, {
            tooltipPayload: [lp(n, S)],
            tooltipPosition: {
                x: M + I / 2,
                y: C + T / 2
            }
        })
    });
    return gt({
        data: P,
        layout: p
    }, h)
});
function ri(e) {
    "@babel/helpers - typeof";
    return ri = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    ri(e)
}
function sS(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function Pf(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, kp(r.key), r)
    }
}
function lS(e, t, n) {
    return t && Pf(e.prototype, t),
    n && Pf(e, n),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function Af(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function Ht(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? Af(Object(n), !0).forEach(function(r) {
            Ua(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Af(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function Ua(e, t, n) {
    return t = kp(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function kp(e) {
    var t = cS(e, "string");
    return ri(t) == "symbol" ? t : t + ""
}
function cS(e, t) {
    if (ri(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (ri(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
var Ya = function(t, n, r, i, a) {
    var o = t.width
      , s = t.height
      , l = t.layout
      , c = t.children
      , u = Object.keys(n)
      , f = {
        left: r.left,
        leftMirror: r.left,
        right: o - r.right,
        rightMirror: o - r.right,
        top: r.top,
        topMirror: r.top,
        bottom: s - r.bottom,
        bottomMirror: s - r.bottom
    }
      , h = !!Lt(c, qn);
    return u.reduce(function(d, p) {
        var g = n[p], m = g.orientation, v = g.domain, b = g.padding, x = b === void 0 ? {} : b, w = g.mirror, y = g.reversed, O = "".concat(m).concat(w ? "Mirror" : ""), _, P, S, k, E;
        if (g.type === "number" && (g.padding === "gap" || g.padding === "no-gap")) {
            var M = v[1] - v[0]
              , C = 1 / 0
              , I = g.categoricalDomain.sort(kx);
            if (I.forEach(function(Q, ct) {
                ct > 0 && (C = Math.min((Q || 0) - (I[ct - 1] || 0), C))
            }),
            Number.isFinite(C)) {
                var T = C / M
                  , j = g.layout === "vertical" ? r.height : r.width;
                if (g.padding === "gap" && (_ = T * j / 2),
                g.padding === "no-gap") {
                    var $ = Mt(t.barCategoryGap, T * j)
                      , R = T * j / 2;
                    _ = R - $ - (R - $) / j * $
                }
            }
        }
        i === "xAxis" ? P = [r.left + (x.left || 0) + (_ || 0), r.left + r.width - (x.right || 0) - (_ || 0)] : i === "yAxis" ? P = l === "horizontal" ? [r.top + r.height - (x.bottom || 0), r.top + (x.top || 0)] : [r.top + (x.top || 0) + (_ || 0), r.top + r.height - (x.bottom || 0) - (_ || 0)] : P = g.range,
        y && (P = [P[1], P[0]]);
        var B = ip(g, a, h)
          , W = B.scale
          , V = B.realScaleType;
        W.domain(v).range(P),
        ap(W);
        var z = op(W, Ht(Ht({}, g), {}, {
            realScaleType: V
        }));
        i === "xAxis" ? (E = m === "top" && !w || m === "bottom" && w,
        S = r.left,
        k = f[O] - E * g.height) : i === "yAxis" && (E = m === "left" && !w || m === "right" && w,
        S = f[O] - E * g.width,
        k = r.top);
        var H = Ht(Ht(Ht({}, g), z), {}, {
            realScaleType: V,
            x: S,
            y: k,
            scale: W,
            width: i === "xAxis" ? r.width : g.width,
            height: i === "yAxis" ? r.height : g.height
        });
        return H.bandSize = ia(H, z),
        !g.hide && i === "xAxis" ? f[O] += (E ? -1 : 1) * H.height : g.hide || (f[O] += (E ? -1 : 1) * H.width),
        Ht(Ht({}, d), {}, Ua({}, p, H))
    }, {})
}
  , Ep = function(t, n) {
    var r = t.x
      , i = t.y
      , a = n.x
      , o = n.y;
    return {
        x: Math.min(r, a),
        y: Math.min(i, o),
        width: Math.abs(a - r),
        height: Math.abs(o - i)
    }
}
  , uS = function(t) {
    var n = t.x1
      , r = t.y1
      , i = t.x2
      , a = t.y2;
    return Ep({
        x: n,
        y: r
    }, {
        x: i,
        y: a
    })
}
  , Mp = function() {
    function e(t) {
        sS(this, e),
        this.scale = t
    }
    return lS(e, [{
        key: "domain",
        get: function() {
            return this.scale.domain
        }
    }, {
        key: "range",
        get: function() {
            return this.scale.range
        }
    }, {
        key: "rangeMin",
        get: function() {
            return this.range()[0]
        }
    }, {
        key: "rangeMax",
        get: function() {
            return this.range()[1]
        }
    }, {
        key: "bandwidth",
        get: function() {
            return this.scale.bandwidth
        }
    }, {
        key: "apply",
        value: function(n) {
            var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}
              , i = r.bandAware
              , a = r.position;
            if (n !== void 0) {
                if (a)
                    switch (a) {
                    case "start":
                        return this.scale(n);
                    case "middle":
                        {
                            var o = this.bandwidth ? this.bandwidth() / 2 : 0;
                            return this.scale(n) + o
                        }
                    case "end":
                        {
                            var s = this.bandwidth ? this.bandwidth() : 0;
                            return this.scale(n) + s
                        }
                    default:
                        return this.scale(n)
                    }
                if (i) {
                    var l = this.bandwidth ? this.bandwidth() / 2 : 0;
                    return this.scale(n) + l
                }
                return this.scale(n)
            }
        }
    }, {
        key: "isInRange",
        value: function(n) {
            var r = this.range()
              , i = r[0]
              , a = r[r.length - 1];
            return i <= a ? n >= i && n <= a : n >= a && n <= i
        }
    }], [{
        key: "create",
        value: function(n) {
            return new e(n)
        }
    }])
}();
Ua(Mp, "EPS", 1e-4);
var fl = function(t) {
    var n = Object.keys(t).reduce(function(r, i) {
        return Ht(Ht({}, r), {}, Ua({}, i, Mp.create(t[i])))
    }, {});
    return Ht(Ht({}, n), {}, {
        apply: function(i) {
            var a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}
              , o = a.bandAware
              , s = a.position;
            return Zg(i, function(l, c) {
                return n[c].apply(l, {
                    bandAware: o,
                    position: s
                })
            })
        },
        isInRange: function(i) {
            return ih(i, function(a, o) {
                return n[o].isInRange(a)
            })
        }
    })
};
function fS(e) {
    return (e % 180 + 180) % 180
}
var hS = function(t) {
    var n = t.width
      , r = t.height
      , i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0
      , a = fS(i)
      , o = a * Math.PI / 180
      , s = Math.atan(r / n)
      , l = o > s && o < Math.PI - s ? r / Math.sin(o) : n / Math.cos(o);
    return Math.abs(l)
}
  , dS = Jg(function(e) {
    return {
        x: e.left,
        y: e.top,
        width: e.width,
        height: e.height
    }
}, function(e) {
    return ["l", e.left, "t", e.top, "w", e.width, "h", e.height].join("")
})
  , hl = N.createContext(void 0)
  , dl = N.createContext(void 0)
  , Tp = N.createContext(void 0)
  , jp = N.createContext({})
  , Cp = N.createContext(void 0)
  , Dp = N.createContext(0)
  , Ip = N.createContext(0)
  , Sf = function(t) {
    var n = t.state
      , r = n.xAxisMap
      , i = n.yAxisMap
      , a = n.offset
      , o = t.clipPathId
      , s = t.children
      , l = t.width
      , c = t.height
      , u = dS(a);
    return A.createElement(hl.Provider, {
        value: r
    }, A.createElement(dl.Provider, {
        value: i
    }, A.createElement(jp.Provider, {
        value: a
    }, A.createElement(Tp.Provider, {
        value: u
    }, A.createElement(Cp.Provider, {
        value: o
    }, A.createElement(Dp.Provider, {
        value: c
    }, A.createElement(Ip.Provider, {
        value: l
    }, s)))))))
}
  , pS = function() {
    return N.useContext(Cp)
}
  , $p = function(t) {
    var n = N.useContext(hl);
    n == null && qe();
    var r = n[t];
    return r == null && qe(),
    r
}
  , gS = function() {
    var t = N.useContext(hl);
    return ge(t)
}
  , mS = function() {
    var t = N.useContext(dl)
      , n = Qg(t, function(r) {
        return ih(r.domain, Number.isFinite)
    });
    return n || ge(t)
}
  , Lp = function(t) {
    var n = N.useContext(dl);
    n == null && qe();
    var r = n[t];
    return r == null && qe(),
    r
}
  , yS = function() {
    var t = N.useContext(Tp);
    return t
}
  , vS = function() {
    return N.useContext(jp)
}
  , pl = function() {
    return N.useContext(Ip)
}
  , gl = function() {
    return N.useContext(Dp)
};
function $n(e) {
    "@babel/helpers - typeof";
    return $n = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    $n(e)
}
function bS(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function xS(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, Bp(r.key), r)
    }
}
function OS(e, t, n) {
    return t && xS(e.prototype, t),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function wS(e, t, n) {
    return t = va(t),
    _S(e, Rp() ? Reflect.construct(t, n || [], va(e).constructor) : t.apply(e, n))
}
function _S(e, t) {
    if (t && ($n(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return PS(e)
}
function PS(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function Rp() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (Rp = function() {
        return !!e
    }
    )()
}
function va(e) {
    return va = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    va(e)
}
function AS(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && xs(e, t)
}
function xs(e, t) {
    return xs = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    xs(e, t)
}
function kf(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function Ef(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? kf(Object(n), !0).forEach(function(r) {
            ml(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : kf(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function ml(e, t, n) {
    return t = Bp(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function Bp(e) {
    var t = SS(e, "string");
    return $n(t) == "symbol" ? t : t + ""
}
function SS(e, t) {
    if ($n(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if ($n(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
function kS(e, t) {
    return jS(e) || TS(e, t) || MS(e, t) || ES()
}
function ES() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function MS(e, t) {
    if (e) {
        if (typeof e == "string")
            return Mf(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return Mf(e, t)
    }
}
function Mf(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
function TS(e, t) {
    var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
    if (n != null) {
        var r, i, a, o, s = [], l = !0, c = !1;
        try {
            if (a = (n = n.call(e)).next,
            t !== 0)
                for (; !(l = (r = a.call(n)).done) && (s.push(r.value),
                s.length !== t); l = !0)
                    ;
        } catch (u) {
            c = !0,
            i = u
        } finally {
            try {
                if (!l && n.return != null && (o = n.return(),
                Object(o) !== o))
                    return
            } finally {
                if (c)
                    throw i
            }
        }
        return s
    }
}
function jS(e) {
    if (Array.isArray(e))
        return e
}
function Os() {
    return Os = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    Os.apply(this, arguments)
}
var CS = function(t, n) {
    var r;
    return A.isValidElement(t) ? r = A.cloneElement(t, n) : K(t) ? r = t(n) : r = A.createElement("line", Os({}, n, {
        className: "recharts-reference-line-line"
    })),
    r
}
  , DS = function(t, n, r, i, a, o, s, l, c) {
    var u = a.x
      , f = a.y
      , h = a.width
      , d = a.height;
    if (r) {
        var p = c.y
          , g = t.y.apply(p, {
            position: o
        });
        if (Qt(c, "discard") && !t.y.isInRange(g))
            return null;
        var m = [{
            x: u + h,
            y: g
        }, {
            x: u,
            y: g
        }];
        return l === "left" ? m.reverse() : m
    }
    if (n) {
        var v = c.x
          , b = t.x.apply(v, {
            position: o
        });
        if (Qt(c, "discard") && !t.x.isInRange(b))
            return null;
        var x = [{
            x: b,
            y: f + d
        }, {
            x: b,
            y: f
        }];
        return s === "top" ? x.reverse() : x
    }
    if (i) {
        var w = c.segment
          , y = w.map(function(O) {
            return t.apply(O, {
                position: o
            })
        });
        return Qt(c, "discard") && tm(y, function(O) {
            return !t.isInRange(O)
        }) ? null : y
    }
    return null
};
function IS(e) {
    var t = e.x
      , n = e.y
      , r = e.segment
      , i = e.xAxisId
      , a = e.yAxisId
      , o = e.shape
      , s = e.className
      , l = e.alwaysShow
      , c = pS()
      , u = $p(i)
      , f = Lp(a)
      , h = yS();
    if (!c || !h)
        return null;
    Gt(l === void 0, 'The alwaysShow prop is deprecated. Please use ifOverflow="extendDomain" instead.');
    var d = fl({
        x: u.scale,
        y: f.scale
    })
      , p = bt(t)
      , g = bt(n)
      , m = r && r.length === 2
      , v = DS(d, p, g, m, h, e.position, u.orientation, f.orientation, e);
    if (!v)
        return null;
    var b = kS(v, 2)
      , x = b[0]
      , w = x.x
      , y = x.y
      , O = b[1]
      , _ = O.x
      , P = O.y
      , S = Qt(e, "hidden") ? "url(#".concat(c, ")") : void 0
      , k = Ef(Ef({
        clipPath: S
    }, F(e, !0)), {}, {
        x1: w,
        y1: y,
        x2: _,
        y2: P
    });
    return A.createElement(q, {
        className: U("recharts-reference-line", s)
    }, CS(o, k), xt.renderCallByParent(e, uS({
        x1: w,
        y1: y,
        x2: _,
        y2: P
    })))
}
var yl = function(e) {
    function t() {
        return bS(this, t),
        wS(this, t, arguments)
    }
    return AS(t, e),
    OS(t, [{
        key: "render",
        value: function() {
            return A.createElement(IS, this.props)
        }
    }])
}(A.Component);
ml(yl, "displayName", "ReferenceLine");
ml(yl, "defaultProps", {
    isFront: !1,
    ifOverflow: "discard",
    xAxisId: 0,
    yAxisId: 0,
    fill: "none",
    stroke: "#ccc",
    fillOpacity: 1,
    strokeWidth: 1,
    position: "middle"
});
function ws() {
    return ws = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    ws.apply(this, arguments)
}
function Ln(e) {
    "@babel/helpers - typeof";
    return Ln = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Ln(e)
}
function Tf(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function jf(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? Tf(Object(n), !0).forEach(function(r) {
            qa(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Tf(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function $S(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function LS(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, zp(r.key), r)
    }
}
function RS(e, t, n) {
    return t && LS(e.prototype, t),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function BS(e, t, n) {
    return t = ba(t),
    NS(e, Np() ? Reflect.construct(t, n || [], ba(e).constructor) : t.apply(e, n))
}
function NS(e, t) {
    if (t && (Ln(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return zS(e)
}
function zS(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function Np() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (Np = function() {
        return !!e
    }
    )()
}
function ba(e) {
    return ba = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    ba(e)
}
function FS(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && _s(e, t)
}
function _s(e, t) {
    return _s = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    _s(e, t)
}
function qa(e, t, n) {
    return t = zp(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function zp(e) {
    var t = WS(e, "string");
    return Ln(t) == "symbol" ? t : t + ""
}
function WS(e, t) {
    if (Ln(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Ln(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var VS = function(t) {
    var n = t.x
      , r = t.y
      , i = t.xAxis
      , a = t.yAxis
      , o = fl({
        x: i.scale,
        y: a.scale
    })
      , s = o.apply({
        x: n,
        y: r
    }, {
        bandAware: !0
    });
    return Qt(t, "discard") && !o.isInRange(s) ? null : s
}
  , Za = function(e) {
    function t() {
        return $S(this, t),
        BS(this, t, arguments)
    }
    return FS(t, e),
    RS(t, [{
        key: "render",
        value: function() {
            var r = this.props
              , i = r.x
              , a = r.y
              , o = r.r
              , s = r.alwaysShow
              , l = r.clipPathId
              , c = bt(i)
              , u = bt(a);
            if (Gt(s === void 0, 'The alwaysShow prop is deprecated. Please use ifOverflow="extendDomain" instead.'),
            !c || !u)
                return null;
            var f = VS(this.props);
            if (!f)
                return null;
            var h = f.x
              , d = f.y
              , p = this.props
              , g = p.shape
              , m = p.className
              , v = Qt(this.props, "hidden") ? "url(#".concat(l, ")") : void 0
              , b = jf(jf({
                clipPath: v
            }, F(this.props, !0)), {}, {
                cx: h,
                cy: d
            });
            return A.createElement(q, {
                className: U("recharts-reference-dot", m)
            }, t.renderDot(g, b), xt.renderCallByParent(this.props, {
                x: h - o,
                y: d - o,
                width: 2 * o,
                height: 2 * o
            }))
        }
    }])
}(A.Component);
qa(Za, "displayName", "ReferenceDot");
qa(Za, "defaultProps", {
    isFront: !1,
    ifOverflow: "discard",
    xAxisId: 0,
    yAxisId: 0,
    r: 10,
    fill: "#fff",
    stroke: "#ccc",
    fillOpacity: 1,
    strokeWidth: 1
});
qa(Za, "renderDot", function(e, t) {
    var n;
    return A.isValidElement(e) ? n = A.cloneElement(e, t) : K(e) ? n = e(t) : n = A.createElement(fi, ws({}, t, {
        cx: t.cx,
        cy: t.cy,
        className: "recharts-reference-dot-dot"
    })),
    n
});
function Ps() {
    return Ps = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    Ps.apply(this, arguments)
}
function Rn(e) {
    "@babel/helpers - typeof";
    return Rn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Rn(e)
}
function Cf(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function Df(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? Cf(Object(n), !0).forEach(function(r) {
            Ja(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Cf(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function HS(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function KS(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, Wp(r.key), r)
    }
}
function XS(e, t, n) {
    return t && KS(e.prototype, t),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function GS(e, t, n) {
    return t = xa(t),
    US(e, Fp() ? Reflect.construct(t, n || [], xa(e).constructor) : t.apply(e, n))
}
function US(e, t) {
    if (t && (Rn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return YS(e)
}
function YS(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function Fp() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (Fp = function() {
        return !!e
    }
    )()
}
function xa(e) {
    return xa = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    xa(e)
}
function qS(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && As(e, t)
}
function As(e, t) {
    return As = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    As(e, t)
}
function Ja(e, t, n) {
    return t = Wp(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function Wp(e) {
    var t = ZS(e, "string");
    return Rn(t) == "symbol" ? t : t + ""
}
function ZS(e, t) {
    if (Rn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Rn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var JS = function(t, n, r, i, a) {
    var o = a.x1
      , s = a.x2
      , l = a.y1
      , c = a.y2
      , u = a.xAxis
      , f = a.yAxis;
    if (!u || !f)
        return null;
    var h = fl({
        x: u.scale,
        y: f.scale
    })
      , d = {
        x: t ? h.x.apply(o, {
            position: "start"
        }) : h.x.rangeMin,
        y: r ? h.y.apply(l, {
            position: "start"
        }) : h.y.rangeMin
    }
      , p = {
        x: n ? h.x.apply(s, {
            position: "end"
        }) : h.x.rangeMax,
        y: i ? h.y.apply(c, {
            position: "end"
        }) : h.y.rangeMax
    };
    return Qt(a, "discard") && (!h.isInRange(d) || !h.isInRange(p)) ? null : Ep(d, p)
}
  , Qa = function(e) {
    function t() {
        return HS(this, t),
        GS(this, t, arguments)
    }
    return qS(t, e),
    XS(t, [{
        key: "render",
        value: function() {
            var r = this.props
              , i = r.x1
              , a = r.x2
              , o = r.y1
              , s = r.y2
              , l = r.className
              , c = r.alwaysShow
              , u = r.clipPathId;
            Gt(c === void 0, 'The alwaysShow prop is deprecated. Please use ifOverflow="extendDomain" instead.');
            var f = bt(i)
              , h = bt(a)
              , d = bt(o)
              , p = bt(s)
              , g = this.props.shape;
            if (!f && !h && !d && !p && !g)
                return null;
            var m = JS(f, h, d, p, this.props);
            if (!m && !g)
                return null;
            var v = Qt(this.props, "hidden") ? "url(#".concat(u, ")") : void 0;
            return A.createElement(q, {
                className: U("recharts-reference-area", l)
            }, t.renderRect(g, Df(Df({
                clipPath: v
            }, F(this.props, !0)), m)), xt.renderCallByParent(this.props, m))
        }
    }])
}(A.Component);
Ja(Qa, "displayName", "ReferenceArea");
Ja(Qa, "defaultProps", {
    isFront: !1,
    ifOverflow: "discard",
    xAxisId: 0,
    yAxisId: 0,
    r: 10,
    fill: "#ccc",
    fillOpacity: .5,
    stroke: "none",
    strokeWidth: 1
});
Ja(Qa, "renderRect", function(e, t) {
    var n;
    return A.isValidElement(e) ? n = A.cloneElement(e, t) : K(e) ? n = e(t) : n = A.createElement(ul, Ps({}, t, {
        className: "recharts-reference-area-rect"
    })),
    n
});
function Vp(e, t, n) {
    if (t < 1)
        return [];
    if (t === 1 && n === void 0)
        return e;
    for (var r = [], i = 0; i < e.length; i += t)
        r.push(e[i]);
    return r
}
function QS(e, t, n) {
    var r = {
        width: e.width + t.width,
        height: e.height + t.height
    };
    return hS(r, n)
}
function tk(e, t, n) {
    var r = n === "width"
      , i = e.x
      , a = e.y
      , o = e.width
      , s = e.height;
    return t === 1 ? {
        start: r ? i : a,
        end: r ? i + o : a + s
    } : {
        start: r ? i + o : a + s,
        end: r ? i : a
    }
}
function Oa(e, t, n, r, i) {
    if (e * t < e * r || e * t > e * i)
        return !1;
    var a = n();
    return e * (t - e * a / 2 - r) >= 0 && e * (t + e * a / 2 - i) <= 0
}
function ek(e, t) {
    return Vp(e, t + 1)
}
function nk(e, t, n, r, i) {
    for (var a = (r || []).slice(), o = t.start, s = t.end, l = 0, c = 1, u = o, f = function() {
        var p = r?.[l];
        if (p === void 0)
            return {
                v: Vp(r, c)
            };
        var g = l, m, v = function() {
            return m === void 0 && (m = n(p, g)),
            m
        }, b = p.coordinate, x = l === 0 || Oa(e, b, v, u, s);
        x || (l = 0,
        u = o,
        c += 1),
        x && (u = b + e * (v() / 2 + i),
        l += c)
    }, h; c <= a.length; )
        if (h = f(),
        h)
            return h.v;
    return []
}
function ii(e) {
    "@babel/helpers - typeof";
    return ii = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    ii(e)
}
function If(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function Pt(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? If(Object(n), !0).forEach(function(r) {
            rk(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : If(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function rk(e, t, n) {
    return t = ik(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function ik(e) {
    var t = ak(e, "string");
    return ii(t) == "symbol" ? t : t + ""
}
function ak(e, t) {
    if (ii(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (ii(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
function ok(e, t, n, r, i) {
    for (var a = (r || []).slice(), o = a.length, s = t.start, l = t.end, c = function(h) {
        var d = a[h], p, g = function() {
            return p === void 0 && (p = n(d, h)),
            p
        };
        if (h === o - 1) {
            var m = e * (d.coordinate + e * g() / 2 - l);
            a[h] = d = Pt(Pt({}, d), {}, {
                tickCoord: m > 0 ? d.coordinate - m * e : d.coordinate
            })
        } else
            a[h] = d = Pt(Pt({}, d), {}, {
                tickCoord: d.coordinate
            });
        var v = Oa(e, d.tickCoord, g, s, l);
        v && (l = d.tickCoord - e * (g() / 2 + i),
        a[h] = Pt(Pt({}, d), {}, {
            isShow: !0
        }))
    }, u = o - 1; u >= 0; u--)
        c(u);
    return a
}
function sk(e, t, n, r, i, a) {
    var o = (r || []).slice()
      , s = o.length
      , l = t.start
      , c = t.end;
    if (a) {
        var u = r[s - 1]
          , f = n(u, s - 1)
          , h = e * (u.coordinate + e * f / 2 - c);
        o[s - 1] = u = Pt(Pt({}, u), {}, {
            tickCoord: h > 0 ? u.coordinate - h * e : u.coordinate
        });
        var d = Oa(e, u.tickCoord, function() {
            return f
        }, l, c);
        d && (c = u.tickCoord - e * (f / 2 + i),
        o[s - 1] = Pt(Pt({}, u), {}, {
            isShow: !0
        }))
    }
    for (var p = a ? s - 1 : s, g = function(b) {
        var x = o[b], w, y = function() {
            return w === void 0 && (w = n(x, b)),
            w
        };
        if (b === 0) {
            var O = e * (x.coordinate - e * y() / 2 - l);
            o[b] = x = Pt(Pt({}, x), {}, {
                tickCoord: O < 0 ? x.coordinate - O * e : x.coordinate
            })
        } else
            o[b] = x = Pt(Pt({}, x), {}, {
                tickCoord: x.coordinate
            });
        var _ = Oa(e, x.tickCoord, y, l, c);
        _ && (l = x.tickCoord + e * (y() / 2 + i),
        o[b] = Pt(Pt({}, x), {}, {
            isShow: !0
        }))
    }, m = 0; m < p; m++)
        g(m);
    return o
}
function vl(e, t, n) {
    var r = e.tick
      , i = e.ticks
      , a = e.viewBox
      , o = e.minTickGap
      , s = e.orientation
      , l = e.interval
      , c = e.tickFormatter
      , u = e.unit
      , f = e.angle;
    if (!i || !i.length || !r)
        return [];
    if (L(l) || de.isSsr)
        return ek(i, typeof l == "number" && L(l) ? l : 0);
    var h = []
      , d = s === "top" || s === "bottom" ? "width" : "height"
      , p = u && d === "width" ? Or(u, {
        fontSize: t,
        letterSpacing: n
    }) : {
        width: 0,
        height: 0
    }
      , g = function(x, w) {
        var y = K(c) ? c(x.value, w) : x.value;
        return d === "width" ? QS(Or(y, {
            fontSize: t,
            letterSpacing: n
        }), p, f) : Or(y, {
            fontSize: t,
            letterSpacing: n
        })[d]
    }
      , m = i.length >= 2 ? Et(i[1].coordinate - i[0].coordinate) : 1
      , v = tk(a, m, d);
    return l === "equidistantPreserveStart" ? nk(m, v, g, i, o) : (l === "preserveStart" || l === "preserveStartEnd" ? h = sk(m, v, g, i, o, l === "preserveStartEnd") : h = ok(m, v, g, i, o),
    h.filter(function(b) {
        return b.isShow
    }))
}
var lk = ["viewBox"]
  , ck = ["viewBox"]
  , uk = ["ticks"];
function Bn(e) {
    "@babel/helpers - typeof";
    return Bn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Bn(e)
}
function pn() {
    return pn = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    pn.apply(this, arguments)
}
function $f(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function kt(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? $f(Object(n), !0).forEach(function(r) {
            bl(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : $f(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function Po(e, t) {
    if (e == null)
        return {};
    var n = fk(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function fk(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function hk(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function Lf(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, Kp(r.key), r)
    }
}
function dk(e, t, n) {
    return t && Lf(e.prototype, t),
    n && Lf(e, n),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function pk(e, t, n) {
    return t = wa(t),
    gk(e, Hp() ? Reflect.construct(t, n || [], wa(e).constructor) : t.apply(e, n))
}
function gk(e, t) {
    if (t && (Bn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return mk(e)
}
function mk(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function Hp() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (Hp = function() {
        return !!e
    }
    )()
}
function wa(e) {
    return wa = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    wa(e)
}
function yk(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && Ss(e, t)
}
function Ss(e, t) {
    return Ss = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    Ss(e, t)
}
function bl(e, t, n) {
    return t = Kp(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function Kp(e) {
    var t = vk(e, "string");
    return Bn(t) == "symbol" ? t : t + ""
}
function vk(e, t) {
    if (Bn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Bn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var Zn = function(e) {
    function t(n) {
        var r;
        return hk(this, t),
        r = pk(this, t, [n]),
        r.state = {
            fontSize: "",
            letterSpacing: ""
        },
        r
    }
    return yk(t, e),
    dk(t, [{
        key: "shouldComponentUpdate",
        value: function(r, i) {
            var a = r.viewBox
              , o = Po(r, lk)
              , s = this.props
              , l = s.viewBox
              , c = Po(s, ck);
            return !yn(a, l) || !yn(o, c) || !yn(i, this.state)
        }
    }, {
        key: "componentDidMount",
        value: function() {
            var r = this.layerReference;
            if (r) {
                var i = r.getElementsByClassName("recharts-cartesian-axis-tick-value")[0];
                i && this.setState({
                    fontSize: window.getComputedStyle(i).fontSize,
                    letterSpacing: window.getComputedStyle(i).letterSpacing
                })
            }
        }
    }, {
        key: "getTickLineCoord",
        value: function(r) {
            var i = this.props, a = i.x, o = i.y, s = i.width, l = i.height, c = i.orientation, u = i.tickSize, f = i.mirror, h = i.tickMargin, d, p, g, m, v, b, x = f ? -1 : 1, w = r.tickSize || u, y = L(r.tickCoord) ? r.tickCoord : r.coordinate;
            switch (c) {
            case "top":
                d = p = r.coordinate,
                m = o + +!f * l,
                g = m - x * w,
                b = g - x * h,
                v = y;
                break;
            case "left":
                g = m = r.coordinate,
                p = a + +!f * s,
                d = p - x * w,
                v = d - x * h,
                b = y;
                break;
            case "right":
                g = m = r.coordinate,
                p = a + +f * s,
                d = p + x * w,
                v = d + x * h,
                b = y;
                break;
            default:
                d = p = r.coordinate,
                m = o + +f * l,
                g = m + x * w,
                b = g + x * h,
                v = y;
                break
            }
            return {
                line: {
                    x1: d,
                    y1: g,
                    x2: p,
                    y2: m
                },
                tick: {
                    x: v,
                    y: b
                }
            }
        }
    }, {
        key: "getTickTextAnchor",
        value: function() {
            var r = this.props, i = r.orientation, a = r.mirror, o;
            switch (i) {
            case "left":
                o = a ? "start" : "end";
                break;
            case "right":
                o = a ? "end" : "start";
                break;
            default:
                o = "middle";
                break
            }
            return o
        }
    }, {
        key: "getTickVerticalAnchor",
        value: function() {
            var r = this.props
              , i = r.orientation
              , a = r.mirror
              , o = "end";
            switch (i) {
            case "left":
            case "right":
                o = "middle";
                break;
            case "top":
                o = a ? "start" : "end";
                break;
            default:
                o = a ? "end" : "start";
                break
            }
            return o
        }
    }, {
        key: "renderAxisLine",
        value: function() {
            var r = this.props
              , i = r.x
              , a = r.y
              , o = r.width
              , s = r.height
              , l = r.orientation
              , c = r.mirror
              , u = r.axisLine
              , f = kt(kt(kt({}, F(this.props, !1)), F(u, !1)), {}, {
                fill: "none"
            });
            if (l === "top" || l === "bottom") {
                var h = +(l === "top" && !c || l === "bottom" && c);
                f = kt(kt({}, f), {}, {
                    x1: i,
                    y1: a + h * s,
                    x2: i + o,
                    y2: a + h * s
                })
            } else {
                var d = +(l === "left" && !c || l === "right" && c);
                f = kt(kt({}, f), {}, {
                    x1: i + d * o,
                    y1: a,
                    x2: i + d * o,
                    y2: a + s
                })
            }
            return A.createElement("line", pn({}, f, {
                className: U("recharts-cartesian-axis-line", Bt(u, "className"))
            }))
        }
    }, {
        key: "renderTicks",
        value: function(r, i, a) {
            var o = this
              , s = this.props
              , l = s.tickLine
              , c = s.stroke
              , u = s.tick
              , f = s.tickFormatter
              , h = s.unit
              , d = vl(kt(kt({}, this.props), {}, {
                ticks: r
            }), i, a)
              , p = this.getTickTextAnchor()
              , g = this.getTickVerticalAnchor()
              , m = F(this.props, !1)
              , v = F(u, !1)
              , b = kt(kt({}, m), {}, {
                fill: "none"
            }, F(l, !1))
              , x = d.map(function(w, y) {
                var O = o.getTickLineCoord(w)
                  , _ = O.line
                  , P = O.tick
                  , S = kt(kt(kt(kt({
                    textAnchor: p,
                    verticalAnchor: g
                }, m), {}, {
                    stroke: "none",
                    fill: c
                }, v), P), {}, {
                    index: y,
                    payload: w,
                    visibleTicksCount: d.length,
                    tickFormatter: f
                });
                return A.createElement(q, pn({
                    className: "recharts-cartesian-axis-tick",
                    key: "tick-".concat(w.value, "-").concat(w.coordinate, "-").concat(w.tickCoord)
                }, Ae(o.props, w, y)), l && A.createElement("line", pn({}, b, _, {
                    className: U("recharts-cartesian-axis-tick-line", Bt(l, "className"))
                })), u && t.renderTickItem(u, S, "".concat(K(f) ? f(w.value, y) : w.value).concat(h || "")))
            });
            return A.createElement("g", {
                className: "recharts-cartesian-axis-ticks"
            }, x)
        }
    }, {
        key: "render",
        value: function() {
            var r = this
              , i = this.props
              , a = i.axisLine
              , o = i.width
              , s = i.height
              , l = i.ticksGenerator
              , c = i.className
              , u = i.hide;
            if (u)
                return null;
            var f = this.props
              , h = f.ticks
              , d = Po(f, uk)
              , p = h;
            return K(l) && (p = h && h.length > 0 ? l(this.props) : l(d)),
            o <= 0 || s <= 0 || !p || !p.length ? null : A.createElement(q, {
                className: U("recharts-cartesian-axis", c),
                ref: function(m) {
                    r.layerReference = m
                }
            }, a && this.renderAxisLine(), this.renderTicks(p, this.state.fontSize, this.state.letterSpacing), xt.renderCallByParent(this.props))
        }
    }], [{
        key: "renderTickItem",
        value: function(r, i, a) {
            var o;
            return A.isValidElement(r) ? o = A.cloneElement(r, i) : K(r) ? o = r(i) : o = A.createElement(Qe, pn({}, i, {
                className: "recharts-cartesian-axis-tick-value"
            }), a),
            o
        }
    }])
}(N.Component);
bl(Zn, "displayName", "CartesianAxis");
bl(Zn, "defaultProps", {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    viewBox: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    orientation: "bottom",
    ticks: [],
    stroke: "#666",
    tickLine: !0,
    axisLine: !0,
    tick: !0,
    mirror: !1,
    minTickGap: 5,
    tickSize: 6,
    tickMargin: 2,
    interval: "preserveEnd"
});
var bk = ["x1", "y1", "x2", "y2", "key"]
  , xk = ["offset"];
function tn(e) {
    "@babel/helpers - typeof";
    return tn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    tn(e)
}
function Rf(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function At(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? Rf(Object(n), !0).forEach(function(r) {
            Ok(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Rf(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function Ok(e, t, n) {
    return t = wk(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function wk(e) {
    var t = _k(e, "string");
    return tn(t) == "symbol" ? t : t + ""
}
function _k(e, t) {
    if (tn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (tn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
function Ke() {
    return Ke = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    Ke.apply(this, arguments)
}
function Bf(e, t) {
    if (e == null)
        return {};
    var n = Pk(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function Pk(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
var Ak = function(t) {
    var n = t.fill;
    if (!n || n === "none")
        return null;
    var r = t.fillOpacity
      , i = t.x
      , a = t.y
      , o = t.width
      , s = t.height
      , l = t.ry;
    return A.createElement("rect", {
        x: i,
        y: a,
        ry: l,
        width: o,
        height: s,
        stroke: "none",
        fill: n,
        fillOpacity: r,
        className: "recharts-cartesian-grid-bg"
    })
};
function Xp(e, t) {
    var n;
    if (A.isValidElement(e))
        n = A.cloneElement(e, t);
    else if (K(e))
        n = e(t);
    else {
        var r = t.x1
          , i = t.y1
          , a = t.x2
          , o = t.y2
          , s = t.key
          , l = Bf(t, bk)
          , c = F(l, !1);
        c.offset;
        var u = Bf(c, xk);
        n = A.createElement("line", Ke({}, u, {
            x1: r,
            y1: i,
            x2: a,
            y2: o,
            fill: "none",
            key: s
        }))
    }
    return n
}
function Sk(e) {
    var t = e.x
      , n = e.width
      , r = e.horizontal
      , i = r === void 0 ? !0 : r
      , a = e.horizontalPoints;
    if (!i || !a || !a.length)
        return null;
    var o = a.map(function(s, l) {
        var c = At(At({}, e), {}, {
            x1: t,
            y1: s,
            x2: t + n,
            y2: s,
            key: "line-".concat(l),
            index: l
        });
        return Xp(i, c)
    });
    return A.createElement("g", {
        className: "recharts-cartesian-grid-horizontal"
    }, o)
}
function kk(e) {
    var t = e.y
      , n = e.height
      , r = e.vertical
      , i = r === void 0 ? !0 : r
      , a = e.verticalPoints;
    if (!i || !a || !a.length)
        return null;
    var o = a.map(function(s, l) {
        var c = At(At({}, e), {}, {
            x1: s,
            y1: t,
            x2: s,
            y2: t + n,
            key: "line-".concat(l),
            index: l
        });
        return Xp(i, c)
    });
    return A.createElement("g", {
        className: "recharts-cartesian-grid-vertical"
    }, o)
}
function Ek(e) {
    var t = e.horizontalFill
      , n = e.fillOpacity
      , r = e.x
      , i = e.y
      , a = e.width
      , o = e.height
      , s = e.horizontalPoints
      , l = e.horizontal
      , c = l === void 0 ? !0 : l;
    if (!c || !t || !t.length)
        return null;
    var u = s.map(function(h) {
        return Math.round(h + i - i)
    }).sort(function(h, d) {
        return h - d
    });
    i !== u[0] && u.unshift(0);
    var f = u.map(function(h, d) {
        var p = !u[d + 1]
          , g = p ? i + o - h : u[d + 1] - h;
        if (g <= 0)
            return null;
        var m = d % t.length;
        return A.createElement("rect", {
            key: "react-".concat(d),
            y: h,
            x: r,
            height: g,
            width: a,
            stroke: "none",
            fill: t[m],
            fillOpacity: n,
            className: "recharts-cartesian-grid-bg"
        })
    });
    return A.createElement("g", {
        className: "recharts-cartesian-gridstripes-horizontal"
    }, f)
}
function Mk(e) {
    var t = e.vertical
      , n = t === void 0 ? !0 : t
      , r = e.verticalFill
      , i = e.fillOpacity
      , a = e.x
      , o = e.y
      , s = e.width
      , l = e.height
      , c = e.verticalPoints;
    if (!n || !r || !r.length)
        return null;
    var u = c.map(function(h) {
        return Math.round(h + a - a)
    }).sort(function(h, d) {
        return h - d
    });
    a !== u[0] && u.unshift(0);
    var f = u.map(function(h, d) {
        var p = !u[d + 1]
          , g = p ? a + s - h : u[d + 1] - h;
        if (g <= 0)
            return null;
        var m = d % r.length;
        return A.createElement("rect", {
            key: "react-".concat(d),
            x: h,
            y: o,
            width: g,
            height: l,
            stroke: "none",
            fill: r[m],
            fillOpacity: i,
            className: "recharts-cartesian-grid-bg"
        })
    });
    return A.createElement("g", {
        className: "recharts-cartesian-gridstripes-vertical"
    }, f)
}
var Tk = function(t, n) {
    var r = t.xAxis
      , i = t.width
      , a = t.height
      , o = t.offset;
    return rp(vl(At(At(At({}, Zn.defaultProps), r), {}, {
        ticks: ce(r, !0),
        viewBox: {
            x: 0,
            y: 0,
            width: i,
            height: a
        }
    })), o.left, o.left + o.width, n)
}
  , jk = function(t, n) {
    var r = t.yAxis
      , i = t.width
      , a = t.height
      , o = t.offset;
    return rp(vl(At(At(At({}, Zn.defaultProps), r), {}, {
        ticks: ce(r, !0),
        viewBox: {
            x: 0,
            y: 0,
            width: i,
            height: a
        }
    })), o.top, o.top + o.height, n)
}
  , cn = {
    horizontal: !0,
    vertical: !0,
    stroke: "#ccc",
    fill: "none",
    verticalFill: [],
    horizontalFill: []
};
function Ck(e) {
    var t, n, r, i, a, o, s = pl(), l = gl(), c = vS(), u = At(At({}, e), {}, {
        stroke: (t = e.stroke) !== null && t !== void 0 ? t : cn.stroke,
        fill: (n = e.fill) !== null && n !== void 0 ? n : cn.fill,
        horizontal: (r = e.horizontal) !== null && r !== void 0 ? r : cn.horizontal,
        horizontalFill: (i = e.horizontalFill) !== null && i !== void 0 ? i : cn.horizontalFill,
        vertical: (a = e.vertical) !== null && a !== void 0 ? a : cn.vertical,
        verticalFill: (o = e.verticalFill) !== null && o !== void 0 ? o : cn.verticalFill,
        x: L(e.x) ? e.x : c.left,
        y: L(e.y) ? e.y : c.top,
        width: L(e.width) ? e.width : c.width,
        height: L(e.height) ? e.height : c.height
    }), f = u.x, h = u.y, d = u.width, p = u.height, g = u.syncWithTicks, m = u.horizontalValues, v = u.verticalValues, b = gS(), x = mS();
    if (!L(d) || d <= 0 || !L(p) || p <= 0 || !L(f) || f !== +f || !L(h) || h !== +h)
        return null;
    var w = u.verticalCoordinatesGenerator || Tk
      , y = u.horizontalCoordinatesGenerator || jk
      , O = u.horizontalPoints
      , _ = u.verticalPoints;
    if ((!O || !O.length) && K(y)) {
        var P = m && m.length
          , S = y({
            yAxis: x ? At(At({}, x), {}, {
                ticks: P ? m : x.ticks
            }) : void 0,
            width: s,
            height: l,
            offset: c
        }, P ? !0 : g);
        Gt(Array.isArray(S), "horizontalCoordinatesGenerator should return Array but instead it returned [".concat(tn(S), "]")),
        Array.isArray(S) && (O = S)
    }
    if ((!_ || !_.length) && K(w)) {
        var k = v && v.length
          , E = w({
            xAxis: b ? At(At({}, b), {}, {
                ticks: k ? v : b.ticks
            }) : void 0,
            width: s,
            height: l,
            offset: c
        }, k ? !0 : g);
        Gt(Array.isArray(E), "verticalCoordinatesGenerator should return Array but instead it returned [".concat(tn(E), "]")),
        Array.isArray(E) && (_ = E)
    }
    return A.createElement("g", {
        className: "recharts-cartesian-grid"
    }, A.createElement(Ak, {
        fill: u.fill,
        fillOpacity: u.fillOpacity,
        x: u.x,
        y: u.y,
        width: u.width,
        height: u.height,
        ry: u.ry
    }), A.createElement(Sk, Ke({}, u, {
        offset: c,
        horizontalPoints: O,
        xAxis: b,
        yAxis: x
    })), A.createElement(kk, Ke({}, u, {
        offset: c,
        verticalPoints: _,
        xAxis: b,
        yAxis: x
    })), A.createElement(Ek, Ke({}, u, {
        horizontalPoints: O
    })), A.createElement(Mk, Ke({}, u, {
        verticalPoints: _
    })))
}
Ck.displayName = "CartesianGrid";
var Dk = ["type", "layout", "connectNulls", "ref"]
  , Ik = ["key"];
function Nn(e) {
    "@babel/helpers - typeof";
    return Nn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Nn(e)
}
function Nf(e, t) {
    if (e == null)
        return {};
    var n = $k(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function $k(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function Ar() {
    return Ar = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    Ar.apply(this, arguments)
}
function zf(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function Dt(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? zf(Object(n), !0).forEach(function(r) {
            Kt(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : zf(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function un(e) {
    return Nk(e) || Bk(e) || Rk(e) || Lk()
}
function Lk() {
    throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function Rk(e, t) {
    if (e) {
        if (typeof e == "string")
            return ks(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return ks(e, t)
    }
}
function Bk(e) {
    if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null)
        return Array.from(e)
}
function Nk(e) {
    if (Array.isArray(e))
        return ks(e)
}
function ks(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
function zk(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function Ff(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, Up(r.key), r)
    }
}
function Fk(e, t, n) {
    return t && Ff(e.prototype, t),
    n && Ff(e, n),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function Wk(e, t, n) {
    return t = _a(t),
    Vk(e, Gp() ? Reflect.construct(t, n || [], _a(e).constructor) : t.apply(e, n))
}
function Vk(e, t) {
    if (t && (Nn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return Hk(e)
}
function Hk(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function Gp() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (Gp = function() {
        return !!e
    }
    )()
}
function _a(e) {
    return _a = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    _a(e)
}
function Kk(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && Es(e, t)
}
function Es(e, t) {
    return Es = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    Es(e, t)
}
function Kt(e, t, n) {
    return t = Up(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function Up(e) {
    var t = Xk(e, "string");
    return Nn(t) == "symbol" ? t : t + ""
}
function Xk(e, t) {
    if (Nn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Nn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var to = function(e) {
    function t() {
        var n;
        zk(this, t);
        for (var r = arguments.length, i = new Array(r), a = 0; a < r; a++)
            i[a] = arguments[a];
        return n = Wk(this, t, [].concat(i)),
        Kt(n, "state", {
            isAnimationFinished: !0,
            totalLength: 0
        }),
        Kt(n, "generateSimpleStrokeDasharray", function(o, s) {
            return "".concat(s, "px ").concat(o - s, "px")
        }),
        Kt(n, "getStrokeDasharray", function(o, s, l) {
            var c = l.reduce(function(v, b) {
                return v + b
            });
            if (!c)
                return n.generateSimpleStrokeDasharray(s, o);
            for (var u = Math.floor(o / c), f = o % c, h = s - o, d = [], p = 0, g = 0; p < l.length; g += l[p],
            ++p)
                if (g + l[p] > f) {
                    d = [].concat(un(l.slice(0, p)), [f - g]);
                    break
                }
            var m = d.length % 2 === 0 ? [0, h] : [h];
            return [].concat(un(t.repeat(l, u)), un(d), m).map(function(v) {
                return "".concat(v, "px")
            }).join(", ")
        }),
        Kt(n, "id", Ee("recharts-line-")),
        Kt(n, "pathRef", function(o) {
            n.mainCurve = o
        }),
        Kt(n, "handleAnimationEnd", function() {
            n.setState({
                isAnimationFinished: !0
            }),
            n.props.onAnimationEnd && n.props.onAnimationEnd()
        }),
        Kt(n, "handleAnimationStart", function() {
            n.setState({
                isAnimationFinished: !1
            }),
            n.props.onAnimationStart && n.props.onAnimationStart()
        }),
        n
    }
    return Kk(t, e),
    Fk(t, [{
        key: "componentDidMount",
        value: function() {
            if (this.props.isAnimationActive) {
                var r = this.getTotalLength();
                this.setState({
                    totalLength: r
                })
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function() {
            if (this.props.isAnimationActive) {
                var r = this.getTotalLength();
                r !== this.state.totalLength && this.setState({
                    totalLength: r
                })
            }
        }
    }, {
        key: "getTotalLength",
        value: function() {
            var r = this.mainCurve;
            try {
                return r && r.getTotalLength && r.getTotalLength() || 0
            } catch {
                return 0
            }
        }
    }, {
        key: "renderErrorBar",
        value: function(r, i) {
            if (this.props.isAnimationActive && !this.state.isAnimationFinished)
                return null;
            var a = this.props
              , o = a.points
              , s = a.xAxis
              , l = a.yAxis
              , c = a.layout
              , u = a.children
              , f = Tt(u, Yn);
            if (!f)
                return null;
            var h = function(g, m) {
                return {
                    x: g.x,
                    y: g.y,
                    value: g.value,
                    errorVal: at(g.payload, m)
                }
            }
              , d = {
                clipPath: r ? "url(#clipPath-".concat(i, ")") : null
            };
            return A.createElement(q, d, f.map(function(p) {
                return A.cloneElement(p, {
                    key: "bar-".concat(p.props.dataKey),
                    data: o,
                    xAxis: s,
                    yAxis: l,
                    layout: c,
                    dataPointFormatter: h
                })
            }))
        }
    }, {
        key: "renderDots",
        value: function(r, i, a) {
            var o = this.props.isAnimationActive;
            if (o && !this.state.isAnimationFinished)
                return null;
            var s = this.props
              , l = s.dot
              , c = s.points
              , u = s.dataKey
              , f = F(this.props, !1)
              , h = F(l, !0)
              , d = c.map(function(g, m) {
                var v = Dt(Dt(Dt({
                    key: "dot-".concat(m),
                    r: 3
                }, f), h), {}, {
                    index: m,
                    cx: g.x,
                    cy: g.y,
                    value: g.value,
                    dataKey: u,
                    payload: g.payload,
                    points: c
                });
                return t.renderDotItem(l, v)
            })
              , p = {
                clipPath: r ? "url(#clipPath-".concat(i ? "" : "dots-").concat(a, ")") : null
            };
            return A.createElement(q, Ar({
                className: "recharts-line-dots",
                key: "dots"
            }, p), d)
        }
    }, {
        key: "renderCurveStatically",
        value: function(r, i, a, o) {
            var s = this.props
              , l = s.type
              , c = s.layout
              , u = s.connectNulls;
            s.ref;
            var f = Nf(s, Dk)
              , h = Dt(Dt(Dt({}, F(f, !0)), {}, {
                fill: "none",
                className: "recharts-line-curve",
                clipPath: i ? "url(#clipPath-".concat(a, ")") : null,
                points: r
            }, o), {}, {
                type: l,
                layout: c,
                connectNulls: u
            });
            return A.createElement(Oe, Ar({}, h, {
                pathRef: this.pathRef
            }))
        }
    }, {
        key: "renderCurveWithAnimation",
        value: function(r, i) {
            var a = this
              , o = this.props
              , s = o.points
              , l = o.strokeDasharray
              , c = o.isAnimationActive
              , u = o.animationBegin
              , f = o.animationDuration
              , h = o.animationEasing
              , d = o.animationId
              , p = o.animateNewValues
              , g = o.width
              , m = o.height
              , v = this.state
              , b = v.prevPoints
              , x = v.totalLength;
            return A.createElement(fe, {
                begin: u,
                duration: f,
                isActive: c,
                easing: h,
                from: {
                    t: 0
                },
                to: {
                    t: 1
                },
                key: "line-".concat(d),
                onAnimationEnd: this.handleAnimationEnd,
                onAnimationStart: this.handleAnimationStart
            }, function(w) {
                var y = w.t;
                if (b) {
                    var O = b.length / s.length
                      , _ = s.map(function(M, C) {
                        var I = Math.floor(C * O);
                        if (b[I]) {
                            var T = b[I]
                              , j = ft(T.x, M.x)
                              , $ = ft(T.y, M.y);
                            return Dt(Dt({}, M), {}, {
                                x: j(y),
                                y: $(y)
                            })
                        }
                        if (p) {
                            var R = ft(g * 2, M.x)
                              , B = ft(m / 2, M.y);
                            return Dt(Dt({}, M), {}, {
                                x: R(y),
                                y: B(y)
                            })
                        }
                        return Dt(Dt({}, M), {}, {
                            x: M.x,
                            y: M.y
                        })
                    });
                    return a.renderCurveStatically(_, r, i)
                }
                var P = ft(0, x), S = P(y), k;
                if (l) {
                    var E = "".concat(l).split(/[,\s]+/gim).map(function(M) {
                        return parseFloat(M)
                    });
                    k = a.getStrokeDasharray(S, x, E)
                } else
                    k = a.generateSimpleStrokeDasharray(x, S);
                return a.renderCurveStatically(s, r, i, {
                    strokeDasharray: k
                })
            })
        }
    }, {
        key: "renderCurve",
        value: function(r, i) {
            var a = this.props
              , o = a.points
              , s = a.isAnimationActive
              , l = this.state
              , c = l.prevPoints
              , u = l.totalLength;
            return s && o && o.length && (!c && u > 0 || !we(c, o)) ? this.renderCurveWithAnimation(r, i) : this.renderCurveStatically(o, r, i)
        }
    }, {
        key: "render",
        value: function() {
            var r, i = this.props, a = i.hide, o = i.dot, s = i.points, l = i.className, c = i.xAxis, u = i.yAxis, f = i.top, h = i.left, d = i.width, p = i.height, g = i.isAnimationActive, m = i.id;
            if (a || !s || !s.length)
                return null;
            var v = this.state.isAnimationFinished
              , b = s.length === 1
              , x = U("recharts-line", l)
              , w = c && c.allowDataOverflow
              , y = u && u.allowDataOverflow
              , O = w || y
              , _ = X(m) ? this.id : m
              , P = (r = F(o, !1)) !== null && r !== void 0 ? r : {
                r: 3,
                strokeWidth: 2
            }
              , S = P.r
              , k = S === void 0 ? 3 : S
              , E = P.strokeWidth
              , M = E === void 0 ? 2 : E
              , C = Ed(o) ? o : {}
              , I = C.clipDot
              , T = I === void 0 ? !0 : I
              , j = k * 2 + M;
            return A.createElement(q, {
                className: x
            }, w || y ? A.createElement("defs", null, A.createElement("clipPath", {
                id: "clipPath-".concat(_)
            }, A.createElement("rect", {
                x: w ? h : h - d / 2,
                y: y ? f : f - p / 2,
                width: w ? d : d * 2,
                height: y ? p : p * 2
            })), !T && A.createElement("clipPath", {
                id: "clipPath-dots-".concat(_)
            }, A.createElement("rect", {
                x: h - j / 2,
                y: f - j / 2,
                width: d + j,
                height: p + j
            }))) : null, !b && this.renderCurve(O, _), this.renderErrorBar(O, _), (b || o) && this.renderDots(O, T, _), (!g || v) && Ut.renderCallByParent(this.props, s))
        }
    }], [{
        key: "getDerivedStateFromProps",
        value: function(r, i) {
            return r.animationId !== i.prevAnimationId ? {
                prevAnimationId: r.animationId,
                curPoints: r.points,
                prevPoints: i.curPoints
            } : r.points !== i.curPoints ? {
                curPoints: r.points
            } : null
        }
    }, {
        key: "repeat",
        value: function(r, i) {
            for (var a = r.length % 2 !== 0 ? [].concat(un(r), [0]) : r, o = [], s = 0; s < i; ++s)
                o = [].concat(un(o), un(a));
            return o
        }
    }, {
        key: "renderDotItem",
        value: function(r, i) {
            var a;
            if (A.isValidElement(r))
                a = A.cloneElement(r, i);
            else if (K(r))
                a = r(i);
            else {
                var o = i.key
                  , s = Nf(i, Ik)
                  , l = U("recharts-line-dot", typeof r != "boolean" ? r.className : "");
                a = A.createElement(fi, Ar({
                    key: o
                }, s, {
                    className: l
                }))
            }
            return a
        }
    }])
}(N.PureComponent);
Kt(to, "displayName", "Line");
Kt(to, "defaultProps", {
    xAxisId: 0,
    yAxisId: 0,
    connectNulls: !1,
    activeDot: !0,
    dot: !0,
    legendType: "line",
    stroke: "#3182bd",
    strokeWidth: 1,
    fill: "#fff",
    points: [],
    isAnimationActive: !de.isSsr,
    animateNewValues: !0,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: "ease",
    hide: !1,
    label: !1
});
Kt(to, "getComposedData", function(e) {
    var t = e.props
      , n = e.xAxis
      , r = e.yAxis
      , i = e.xAxisTicks
      , a = e.yAxisTicks
      , o = e.dataKey
      , s = e.bandSize
      , l = e.displayedData
      , c = e.offset
      , u = t.layout
      , f = l.map(function(h, d) {
        var p = at(h, o);
        return u === "horizontal" ? {
            x: En({
                axis: n,
                ticks: i,
                bandSize: s,
                entry: h,
                index: d
            }),
            y: X(p) ? null : r.scale(p),
            value: p,
            payload: h
        } : {
            x: X(p) ? null : n.scale(p),
            y: En({
                axis: r,
                ticks: a,
                bandSize: s,
                entry: h,
                index: d
            }),
            value: p,
            payload: h
        }
    });
    return Dt({
        points: f,
        layout: u
    }, c)
});
var Gk = ["layout", "type", "stroke", "connectNulls", "isRange", "ref"], Uk = ["key"], Yp;
function zn(e) {
    "@babel/helpers - typeof";
    return zn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    zn(e)
}
function qp(e, t) {
    if (e == null)
        return {};
    var n = Yk(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function Yk(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function Xe() {
    return Xe = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    Xe.apply(this, arguments)
}
function Wf(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function pe(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? Wf(Object(n), !0).forEach(function(r) {
            Zt(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Wf(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function qk(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function Vf(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, Jp(r.key), r)
    }
}
function Zk(e, t, n) {
    return t && Vf(e.prototype, t),
    n && Vf(e, n),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function Jk(e, t, n) {
    return t = Pa(t),
    Qk(e, Zp() ? Reflect.construct(t, n || [], Pa(e).constructor) : t.apply(e, n))
}
function Qk(e, t) {
    if (t && (zn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return tE(e)
}
function tE(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function Zp() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (Zp = function() {
        return !!e
    }
    )()
}
function Pa(e) {
    return Pa = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    Pa(e)
}
function eE(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && Ms(e, t)
}
function Ms(e, t) {
    return Ms = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    Ms(e, t)
}
function Zt(e, t, n) {
    return t = Jp(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function Jp(e) {
    var t = nE(e, "string");
    return zn(t) == "symbol" ? t : t + ""
}
function nE(e, t) {
    if (zn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (zn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var en = function(e) {
    function t() {
        var n;
        qk(this, t);
        for (var r = arguments.length, i = new Array(r), a = 0; a < r; a++)
            i[a] = arguments[a];
        return n = Jk(this, t, [].concat(i)),
        Zt(n, "state", {
            isAnimationFinished: !0
        }),
        Zt(n, "id", Ee("recharts-area-")),
        Zt(n, "handleAnimationEnd", function() {
            var o = n.props.onAnimationEnd;
            n.setState({
                isAnimationFinished: !0
            }),
            K(o) && o()
        }),
        Zt(n, "handleAnimationStart", function() {
            var o = n.props.onAnimationStart;
            n.setState({
                isAnimationFinished: !1
            }),
            K(o) && o()
        }),
        n
    }
    return eE(t, e),
    Zk(t, [{
        key: "renderDots",
        value: function(r, i, a) {
            var o = this.props.isAnimationActive
              , s = this.state.isAnimationFinished;
            if (o && !s)
                return null;
            var l = this.props
              , c = l.dot
              , u = l.points
              , f = l.dataKey
              , h = F(this.props, !1)
              , d = F(c, !0)
              , p = u.map(function(m, v) {
                var b = pe(pe(pe({
                    key: "dot-".concat(v),
                    r: 3
                }, h), d), {}, {
                    index: v,
                    cx: m.x,
                    cy: m.y,
                    dataKey: f,
                    value: m.value,
                    payload: m.payload,
                    points: u
                });
                return t.renderDotItem(c, b)
            })
              , g = {
                clipPath: r ? "url(#clipPath-".concat(i ? "" : "dots-").concat(a, ")") : null
            };
            return A.createElement(q, Xe({
                className: "recharts-area-dots"
            }, g), p)
        }
    }, {
        key: "renderHorizontalRect",
        value: function(r) {
            var i = this.props
              , a = i.baseLine
              , o = i.points
              , s = i.strokeWidth
              , l = o[0].x
              , c = o[o.length - 1].x
              , u = r * Math.abs(l - c)
              , f = me(o.map(function(h) {
                return h.y || 0
            }));
            return L(a) && typeof a == "number" ? f = Math.max(a, f) : a && Array.isArray(a) && a.length && (f = Math.max(me(a.map(function(h) {
                return h.y || 0
            })), f)),
            L(f) ? A.createElement("rect", {
                x: l < c ? l : l - u,
                y: 0,
                width: u,
                height: Math.floor(f + (s ? parseInt("".concat(s), 10) : 1))
            }) : null
        }
    }, {
        key: "renderVerticalRect",
        value: function(r) {
            var i = this.props
              , a = i.baseLine
              , o = i.points
              , s = i.strokeWidth
              , l = o[0].y
              , c = o[o.length - 1].y
              , u = r * Math.abs(l - c)
              , f = me(o.map(function(h) {
                return h.x || 0
            }));
            return L(a) && typeof a == "number" ? f = Math.max(a, f) : a && Array.isArray(a) && a.length && (f = Math.max(me(a.map(function(h) {
                return h.x || 0
            })), f)),
            L(f) ? A.createElement("rect", {
                x: 0,
                y: l < c ? l : l - u,
                width: f + (s ? parseInt("".concat(s), 10) : 1),
                height: Math.floor(u)
            }) : null
        }
    }, {
        key: "renderClipRect",
        value: function(r) {
            var i = this.props.layout;
            return i === "vertical" ? this.renderVerticalRect(r) : this.renderHorizontalRect(r)
        }
    }, {
        key: "renderAreaStatically",
        value: function(r, i, a, o) {
            var s = this.props
              , l = s.layout
              , c = s.type
              , u = s.stroke
              , f = s.connectNulls
              , h = s.isRange;
            s.ref;
            var d = qp(s, Gk);
            return A.createElement(q, {
                clipPath: a ? "url(#clipPath-".concat(o, ")") : null
            }, A.createElement(Oe, Xe({}, F(d, !0), {
                points: r,
                connectNulls: f,
                type: c,
                baseLine: i,
                layout: l,
                stroke: "none",
                className: "recharts-area-area"
            })), u !== "none" && A.createElement(Oe, Xe({}, F(this.props, !1), {
                className: "recharts-area-curve",
                layout: l,
                type: c,
                connectNulls: f,
                fill: "none",
                points: r
            })), u !== "none" && h && A.createElement(Oe, Xe({}, F(this.props, !1), {
                className: "recharts-area-curve",
                layout: l,
                type: c,
                connectNulls: f,
                fill: "none",
                points: i
            })))
        }
    }, {
        key: "renderAreaWithAnimation",
        value: function(r, i) {
            var a = this
              , o = this.props
              , s = o.points
              , l = o.baseLine
              , c = o.isAnimationActive
              , u = o.animationBegin
              , f = o.animationDuration
              , h = o.animationEasing
              , d = o.animationId
              , p = this.state
              , g = p.prevPoints
              , m = p.prevBaseLine;
            return A.createElement(fe, {
                begin: u,
                duration: f,
                isActive: c,
                easing: h,
                from: {
                    t: 0
                },
                to: {
                    t: 1
                },
                key: "area-".concat(d),
                onAnimationEnd: this.handleAnimationEnd,
                onAnimationStart: this.handleAnimationStart
            }, function(v) {
                var b = v.t;
                if (g) {
                    var x = g.length / s.length, w = s.map(function(P, S) {
                        var k = Math.floor(S * x);
                        if (g[k]) {
                            var E = g[k]
                              , M = ft(E.x, P.x)
                              , C = ft(E.y, P.y);
                            return pe(pe({}, P), {}, {
                                x: M(b),
                                y: C(b)
                            })
                        }
                        return P
                    }), y;
                    if (L(l) && typeof l == "number") {
                        var O = ft(m, l);
                        y = O(b)
                    } else if (X(l) || Gn(l)) {
                        var _ = ft(m, 0);
                        y = _(b)
                    } else
                        y = l.map(function(P, S) {
                            var k = Math.floor(S * x);
                            if (m[k]) {
                                var E = m[k]
                                  , M = ft(E.x, P.x)
                                  , C = ft(E.y, P.y);
                                return pe(pe({}, P), {}, {
                                    x: M(b),
                                    y: C(b)
                                })
                            }
                            return P
                        });
                    return a.renderAreaStatically(w, y, r, i)
                }
                return A.createElement(q, null, A.createElement("defs", null, A.createElement("clipPath", {
                    id: "animationClipPath-".concat(i)
                }, a.renderClipRect(b))), A.createElement(q, {
                    clipPath: "url(#animationClipPath-".concat(i, ")")
                }, a.renderAreaStatically(s, l, r, i)))
            })
        }
    }, {
        key: "renderArea",
        value: function(r, i) {
            var a = this.props
              , o = a.points
              , s = a.baseLine
              , l = a.isAnimationActive
              , c = this.state
              , u = c.prevPoints
              , f = c.prevBaseLine
              , h = c.totalLength;
            return l && o && o.length && (!u && h > 0 || !we(u, o) || !we(f, s)) ? this.renderAreaWithAnimation(r, i) : this.renderAreaStatically(o, s, r, i)
        }
    }, {
        key: "render",
        value: function() {
            var r, i = this.props, a = i.hide, o = i.dot, s = i.points, l = i.className, c = i.top, u = i.left, f = i.xAxis, h = i.yAxis, d = i.width, p = i.height, g = i.isAnimationActive, m = i.id;
            if (a || !s || !s.length)
                return null;
            var v = this.state.isAnimationFinished
              , b = s.length === 1
              , x = U("recharts-area", l)
              , w = f && f.allowDataOverflow
              , y = h && h.allowDataOverflow
              , O = w || y
              , _ = X(m) ? this.id : m
              , P = (r = F(o, !1)) !== null && r !== void 0 ? r : {
                r: 3,
                strokeWidth: 2
            }
              , S = P.r
              , k = S === void 0 ? 3 : S
              , E = P.strokeWidth
              , M = E === void 0 ? 2 : E
              , C = Ed(o) ? o : {}
              , I = C.clipDot
              , T = I === void 0 ? !0 : I
              , j = k * 2 + M;
            return A.createElement(q, {
                className: x
            }, w || y ? A.createElement("defs", null, A.createElement("clipPath", {
                id: "clipPath-".concat(_)
            }, A.createElement("rect", {
                x: w ? u : u - d / 2,
                y: y ? c : c - p / 2,
                width: w ? d : d * 2,
                height: y ? p : p * 2
            })), !T && A.createElement("clipPath", {
                id: "clipPath-dots-".concat(_)
            }, A.createElement("rect", {
                x: u - j / 2,
                y: c - j / 2,
                width: d + j,
                height: p + j
            }))) : null, b ? null : this.renderArea(O, _), (o || b) && this.renderDots(O, T, _), (!g || v) && Ut.renderCallByParent(this.props, s))
        }
    }], [{
        key: "getDerivedStateFromProps",
        value: function(r, i) {
            return r.animationId !== i.prevAnimationId ? {
                prevAnimationId: r.animationId,
                curPoints: r.points,
                curBaseLine: r.baseLine,
                prevPoints: i.curPoints,
                prevBaseLine: i.curBaseLine
            } : r.points !== i.curPoints || r.baseLine !== i.curBaseLine ? {
                curPoints: r.points,
                curBaseLine: r.baseLine
            } : null
        }
    }])
}(N.PureComponent);
Yp = en;
Zt(en, "displayName", "Area");
Zt(en, "defaultProps", {
    stroke: "#3182bd",
    fill: "#3182bd",
    fillOpacity: .6,
    xAxisId: 0,
    yAxisId: 0,
    legendType: "line",
    connectNulls: !1,
    points: [],
    dot: !1,
    activeDot: !0,
    hide: !1,
    isAnimationActive: !de.isSsr,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: "ease"
});
Zt(en, "getBaseValue", function(e, t, n, r) {
    var i = e.layout
      , a = e.baseValue
      , o = t.props.baseValue
      , s = o ?? a;
    if (L(s) && typeof s == "number")
        return s;
    var l = i === "horizontal" ? r : n
      , c = l.scale.domain();
    if (l.type === "number") {
        var u = Math.max(c[0], c[1])
          , f = Math.min(c[0], c[1]);
        return s === "dataMin" ? f : s === "dataMax" || u < 0 ? u : Math.max(Math.min(c[0], c[1]), 0)
    }
    return s === "dataMin" ? c[0] : s === "dataMax" ? c[1] : c[0]
});
Zt(en, "getComposedData", function(e) {
    var t = e.props, n = e.item, r = e.xAxis, i = e.yAxis, a = e.xAxisTicks, o = e.yAxisTicks, s = e.bandSize, l = e.dataKey, c = e.stackedData, u = e.dataStartIndex, f = e.displayedData, h = e.offset, d = t.layout, p = c && c.length, g = Yp.getBaseValue(t, n, r, i), m = d === "horizontal", v = !1, b = f.map(function(w, y) {
        var O;
        p ? O = c[u + y] : (O = at(w, l),
        Array.isArray(O) ? v = !0 : O = [g, O]);
        var _ = O[1] == null || p && at(w, l) == null;
        return m ? {
            x: En({
                axis: r,
                ticks: a,
                bandSize: s,
                entry: w,
                index: y
            }),
            y: _ ? null : i.scale(O[1]),
            value: O,
            payload: w
        } : {
            x: _ ? null : r.scale(O[1]),
            y: En({
                axis: i,
                ticks: o,
                bandSize: s,
                entry: w,
                index: y
            }),
            value: O,
            payload: w
        }
    }), x;
    return p || v ? x = b.map(function(w) {
        var y = Array.isArray(w.value) ? w.value[0] : null;
        return m ? {
            x: w.x,
            y: y != null && w.y != null ? i.scale(y) : null
        } : {
            x: y != null ? r.scale(y) : null,
            y: w.y
        }
    }) : x = m ? i.scale(g) : r.scale(g),
    pe({
        points: b,
        baseLine: x,
        layout: d,
        isRange: v
    }, h)
});
Zt(en, "renderDotItem", function(e, t) {
    var n;
    if (A.isValidElement(e))
        n = A.cloneElement(e, t);
    else if (K(e))
        n = e(t);
    else {
        var r = U("recharts-area-dot", typeof e != "boolean" ? e.className : "")
          , i = t.key
          , a = qp(t, Uk);
        n = A.createElement(fi, Xe({}, a, {
            key: i,
            className: r
        }))
    }
    return n
});
function Fn(e) {
    "@babel/helpers - typeof";
    return Fn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Fn(e)
}
function rE(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function iE(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, eg(r.key), r)
    }
}
function aE(e, t, n) {
    return t && iE(e.prototype, t),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function oE(e, t, n) {
    return t = Aa(t),
    sE(e, Qp() ? Reflect.construct(t, n || [], Aa(e).constructor) : t.apply(e, n))
}
function sE(e, t) {
    if (t && (Fn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return lE(e)
}
function lE(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function Qp() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (Qp = function() {
        return !!e
    }
    )()
}
function Aa(e) {
    return Aa = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    Aa(e)
}
function cE(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && Ts(e, t)
}
function Ts(e, t) {
    return Ts = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    Ts(e, t)
}
function tg(e, t, n) {
    return t = eg(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function eg(e) {
    var t = uE(e, "string");
    return Fn(t) == "symbol" ? t : t + ""
}
function uE(e, t) {
    if (Fn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Fn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var eo = function(e) {
    function t() {
        return rE(this, t),
        oE(this, t, arguments)
    }
    return cE(t, e),
    aE(t, [{
        key: "render",
        value: function() {
            return null
        }
    }])
}(A.Component);
tg(eo, "displayName", "ZAxis");
tg(eo, "defaultProps", {
    zAxisId: 0,
    range: [64, 64],
    scale: "auto",
    type: "number"
});
var fE = ["option", "isActive"];
function Sr() {
    return Sr = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    Sr.apply(this, arguments)
}
function hE(e, t) {
    if (e == null)
        return {};
    var n = dE(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function dE(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function pE(e) {
    var t = e.option
      , n = e.isActive
      , r = hE(e, fE);
    return typeof t == "string" ? A.createElement(ha, Sr({
        option: A.createElement(Ra, Sr({
            type: t
        }, r)),
        isActive: n,
        shapeType: "symbols"
    }, r)) : A.createElement(ha, Sr({
        option: t,
        isActive: n,
        shapeType: "symbols"
    }, r))
}
function Wn(e) {
    "@babel/helpers - typeof";
    return Wn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Wn(e)
}
function kr() {
    return kr = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    kr.apply(this, arguments)
}
function Hf(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function zt(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? Hf(Object(n), !0).forEach(function(r) {
            xe(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Hf(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function gE(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function Kf(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, rg(r.key), r)
    }
}
function mE(e, t, n) {
    return t && Kf(e.prototype, t),
    n && Kf(e, n),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function yE(e, t, n) {
    return t = Sa(t),
    vE(e, ng() ? Reflect.construct(t, n || [], Sa(e).constructor) : t.apply(e, n))
}
function vE(e, t) {
    if (t && (Wn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return bE(e)
}
function bE(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function ng() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (ng = function() {
        return !!e
    }
    )()
}
function Sa(e) {
    return Sa = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    Sa(e)
}
function xE(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && js(e, t)
}
function js(e, t) {
    return js = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    js(e, t)
}
function xe(e, t, n) {
    return t = rg(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function rg(e) {
    var t = OE(e, "string");
    return Wn(t) == "symbol" ? t : t + ""
}
function OE(e, t) {
    if (Wn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Wn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var no = function(e) {
    function t() {
        var n;
        gE(this, t);
        for (var r = arguments.length, i = new Array(r), a = 0; a < r; a++)
            i[a] = arguments[a];
        return n = yE(this, t, [].concat(i)),
        xe(n, "state", {
            isAnimationFinished: !1
        }),
        xe(n, "handleAnimationEnd", function() {
            n.setState({
                isAnimationFinished: !0
            })
        }),
        xe(n, "handleAnimationStart", function() {
            n.setState({
                isAnimationFinished: !1
            })
        }),
        xe(n, "id", Ee("recharts-scatter-")),
        n
    }
    return xE(t, e),
    mE(t, [{
        key: "renderSymbolsStatically",
        value: function(r) {
            var i = this
              , a = this.props
              , o = a.shape
              , s = a.activeShape
              , l = a.activeIndex
              , c = F(this.props, !1);
            return r.map(function(u, f) {
                var h = l === f
                  , d = h ? s : o
                  , p = zt(zt({}, c), u);
                return A.createElement(q, kr({
                    className: "recharts-scatter-symbol",
                    key: "symbol-".concat(u?.cx, "-").concat(u?.cy, "-").concat(u?.size, "-").concat(f)
                }, Ae(i.props, u, f), {
                    role: "img"
                }), A.createElement(pE, kr({
                    option: d,
                    isActive: h,
                    key: "symbol-".concat(f)
                }, p)))
            })
        }
    }, {
        key: "renderSymbolsWithAnimation",
        value: function() {
            var r = this
              , i = this.props
              , a = i.points
              , o = i.isAnimationActive
              , s = i.animationBegin
              , l = i.animationDuration
              , c = i.animationEasing
              , u = i.animationId
              , f = this.state.prevPoints;
            return A.createElement(fe, {
                begin: s,
                duration: l,
                isActive: o,
                easing: c,
                from: {
                    t: 0
                },
                to: {
                    t: 1
                },
                key: "pie-".concat(u),
                onAnimationEnd: this.handleAnimationEnd,
                onAnimationStart: this.handleAnimationStart
            }, function(h) {
                var d = h.t
                  , p = a.map(function(g, m) {
                    var v = f && f[m];
                    if (v) {
                        var b = ft(v.cx, g.cx)
                          , x = ft(v.cy, g.cy)
                          , w = ft(v.size, g.size);
                        return zt(zt({}, g), {}, {
                            cx: b(d),
                            cy: x(d),
                            size: w(d)
                        })
                    }
                    var y = ft(0, g.size);
                    return zt(zt({}, g), {}, {
                        size: y(d)
                    })
                });
                return A.createElement(q, null, r.renderSymbolsStatically(p))
            })
        }
    }, {
        key: "renderSymbols",
        value: function() {
            var r = this.props
              , i = r.points
              , a = r.isAnimationActive
              , o = this.state.prevPoints;
            return a && i && i.length && (!o || !we(o, i)) ? this.renderSymbolsWithAnimation() : this.renderSymbolsStatically(i)
        }
    }, {
        key: "renderErrorBar",
        value: function() {
            var r = this.props.isAnimationActive;
            if (r && !this.state.isAnimationFinished)
                return null;
            var i = this.props
              , a = i.points
              , o = i.xAxis
              , s = i.yAxis
              , l = i.children
              , c = Tt(l, Yn);
            return c ? c.map(function(u, f) {
                var h = u.props
                  , d = h.direction
                  , p = h.dataKey;
                return A.cloneElement(u, {
                    key: "".concat(d, "-").concat(p, "-").concat(a[f]),
                    data: a,
                    xAxis: o,
                    yAxis: s,
                    layout: d === "x" ? "vertical" : "horizontal",
                    dataPointFormatter: function(m, v) {
                        return {
                            x: m.cx,
                            y: m.cy,
                            value: d === "x" ? +m.node.x : +m.node.y,
                            errorVal: at(m, v)
                        }
                    }
                })
            }) : null
        }
    }, {
        key: "renderLine",
        value: function() {
            var r = this.props, i = r.points, a = r.line, o = r.lineType, s = r.lineJointType, l = F(this.props, !1), c = F(a, !1), u, f;
            if (o === "joint")
                u = i.map(function(x) {
                    return {
                        x: x.cx,
                        y: x.cy
                    }
                });
            else if (o === "fitting") {
                var h = Sx(i)
                  , d = h.xmin
                  , p = h.xmax
                  , g = h.a
                  , m = h.b
                  , v = function(w) {
                    return g * w + m
                };
                u = [{
                    x: d,
                    y: v(d)
                }, {
                    x: p,
                    y: v(p)
                }]
            }
            var b = zt(zt(zt({}, l), {}, {
                fill: "none",
                stroke: l && l.fill
            }, c), {}, {
                points: u
            });
            return A.isValidElement(a) ? f = A.cloneElement(a, b) : K(a) ? f = a(b) : f = A.createElement(Oe, kr({}, b, {
                type: s
            })),
            A.createElement(q, {
                className: "recharts-scatter-line",
                key: "recharts-scatter-line"
            }, f)
        }
    }, {
        key: "render",
        value: function() {
            var r = this.props
              , i = r.hide
              , a = r.points
              , o = r.line
              , s = r.className
              , l = r.xAxis
              , c = r.yAxis
              , u = r.left
              , f = r.top
              , h = r.width
              , d = r.height
              , p = r.id
              , g = r.isAnimationActive;
            if (i || !a || !a.length)
                return null;
            var m = this.state.isAnimationFinished
              , v = U("recharts-scatter", s)
              , b = l && l.allowDataOverflow
              , x = c && c.allowDataOverflow
              , w = b || x
              , y = X(p) ? this.id : p;
            return A.createElement(q, {
                className: v,
                clipPath: w ? "url(#clipPath-".concat(y, ")") : null
            }, b || x ? A.createElement("defs", null, A.createElement("clipPath", {
                id: "clipPath-".concat(y)
            }, A.createElement("rect", {
                x: b ? u : u - h / 2,
                y: x ? f : f - d / 2,
                width: b ? h : h * 2,
                height: x ? d : d * 2
            }))) : null, o && this.renderLine(), this.renderErrorBar(), A.createElement(q, {
                key: "recharts-scatter-symbols"
            }, this.renderSymbols()), (!g || m) && Ut.renderCallByParent(this.props, a))
        }
    }], [{
        key: "getDerivedStateFromProps",
        value: function(r, i) {
            return r.animationId !== i.prevAnimationId ? {
                prevAnimationId: r.animationId,
                curPoints: r.points,
                prevPoints: i.curPoints
            } : r.points !== i.curPoints ? {
                curPoints: r.points
            } : null
        }
    }])
}(N.PureComponent);
xe(no, "displayName", "Scatter");
xe(no, "defaultProps", {
    xAxisId: 0,
    yAxisId: 0,
    zAxisId: 0,
    legendType: "circle",
    lineType: "joint",
    lineJointType: "linear",
    data: [],
    shape: "circle",
    hide: !1,
    isAnimationActive: !de.isSsr,
    animationBegin: 0,
    animationDuration: 400,
    animationEasing: "linear"
});
xe(no, "getComposedData", function(e) {
    var t = e.xAxis
      , n = e.yAxis
      , r = e.zAxis
      , i = e.item
      , a = e.displayedData
      , o = e.xAxisTicks
      , s = e.yAxisTicks
      , l = e.offset
      , c = i.props.tooltipType
      , u = Tt(i.props.children, Na)
      , f = X(t.dataKey) ? i.props.dataKey : t.dataKey
      , h = X(n.dataKey) ? i.props.dataKey : n.dataKey
      , d = r && r.dataKey
      , p = r ? r.range : eo.defaultProps.range
      , g = p && p[0]
      , m = t.scale.bandwidth ? t.scale.bandwidth() : 0
      , v = n.scale.bandwidth ? n.scale.bandwidth() : 0
      , b = a.map(function(x, w) {
        var y = at(x, f)
          , O = at(x, h)
          , _ = !X(d) && at(x, d) || "-"
          , P = [{
            name: X(t.dataKey) ? i.props.name : t.name || t.dataKey,
            unit: t.unit || "",
            value: y,
            payload: x,
            dataKey: f,
            type: c
        }, {
            name: X(n.dataKey) ? i.props.name : n.name || n.dataKey,
            unit: n.unit || "",
            value: O,
            payload: x,
            dataKey: h,
            type: c
        }];
        _ !== "-" && P.push({
            name: r.name || r.dataKey,
            unit: r.unit || "",
            value: _,
            payload: x,
            dataKey: d,
            type: c
        });
        var S = En({
            axis: t,
            ticks: o,
            bandSize: m,
            entry: x,
            index: w,
            dataKey: f
        })
          , k = En({
            axis: n,
            ticks: s,
            bandSize: v,
            entry: x,
            index: w,
            dataKey: h
        })
          , E = _ !== "-" ? r.scale(_) : g
          , M = Math.sqrt(Math.max(E, 0) / Math.PI);
        return zt(zt({}, x), {}, {
            cx: S,
            cy: k,
            x: S - M,
            y: k - M,
            xAxis: t,
            yAxis: n,
            zAxis: r,
            width: 2 * M,
            height: 2 * M,
            size: E,
            node: {
                x: y,
                y: O,
                z: _
            },
            tooltipPayload: P,
            tooltipPosition: {
                x: S,
                y: k
            },
            payload: x
        }, u && u[w] && u[w].props)
    });
    return zt({
        points: b
    }, l)
});
function Vn(e) {
    "@babel/helpers - typeof";
    return Vn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Vn(e)
}
function wE(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function _E(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, og(r.key), r)
    }
}
function PE(e, t, n) {
    return t && _E(e.prototype, t),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function AE(e, t, n) {
    return t = ka(t),
    SE(e, ig() ? Reflect.construct(t, n || [], ka(e).constructor) : t.apply(e, n))
}
function SE(e, t) {
    if (t && (Vn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return kE(e)
}
function kE(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function ig() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (ig = function() {
        return !!e
    }
    )()
}
function ka(e) {
    return ka = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    ka(e)
}
function EE(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && Cs(e, t)
}
function Cs(e, t) {
    return Cs = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    Cs(e, t)
}
function ag(e, t, n) {
    return t = og(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function og(e) {
    var t = ME(e, "string");
    return Vn(t) == "symbol" ? t : t + ""
}
function ME(e, t) {
    if (Vn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Vn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
function Ds() {
    return Ds = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    Ds.apply(this, arguments)
}
function TE(e) {
    var t = e.xAxisId
      , n = pl()
      , r = gl()
      , i = $p(t);
    return i == null ? null : A.createElement(Zn, Ds({}, i, {
        className: U("recharts-".concat(i.axisType, " ").concat(i.axisType), i.className),
        viewBox: {
            x: 0,
            y: 0,
            width: n,
            height: r
        },
        ticksGenerator: function(o) {
            return ce(o, !0)
        }
    }))
}
var Jn = function(e) {
    function t() {
        return wE(this, t),
        AE(this, t, arguments)
    }
    return EE(t, e),
    PE(t, [{
        key: "render",
        value: function() {
            return A.createElement(TE, this.props)
        }
    }])
}(A.Component);
ag(Jn, "displayName", "XAxis");
ag(Jn, "defaultProps", {
    allowDecimals: !0,
    hide: !1,
    orientation: "bottom",
    width: 0,
    height: 30,
    mirror: !1,
    xAxisId: 0,
    tickCount: 5,
    type: "category",
    padding: {
        left: 0,
        right: 0
    },
    allowDataOverflow: !1,
    scale: "auto",
    reversed: !1,
    allowDuplicatedCategory: !0
});
function Hn(e) {
    "@babel/helpers - typeof";
    return Hn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Hn(e)
}
function jE(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function CE(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, cg(r.key), r)
    }
}
function DE(e, t, n) {
    return t && CE(e.prototype, t),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function IE(e, t, n) {
    return t = Ea(t),
    $E(e, sg() ? Reflect.construct(t, n || [], Ea(e).constructor) : t.apply(e, n))
}
function $E(e, t) {
    if (t && (Hn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return LE(e)
}
function LE(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function sg() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (sg = function() {
        return !!e
    }
    )()
}
function Ea(e) {
    return Ea = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    Ea(e)
}
function RE(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && Is(e, t)
}
function Is(e, t) {
    return Is = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    Is(e, t)
}
function lg(e, t, n) {
    return t = cg(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function cg(e) {
    var t = BE(e, "string");
    return Hn(t) == "symbol" ? t : t + ""
}
function BE(e, t) {
    if (Hn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Hn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
function $s() {
    return $s = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    $s.apply(this, arguments)
}
var NE = function(t) {
    var n = t.yAxisId
      , r = pl()
      , i = gl()
      , a = Lp(n);
    return a == null ? null : A.createElement(Zn, $s({}, a, {
        className: U("recharts-".concat(a.axisType, " ").concat(a.axisType), a.className),
        viewBox: {
            x: 0,
            y: 0,
            width: r,
            height: i
        },
        ticksGenerator: function(s) {
            return ce(s, !0)
        }
    }))
}
  , Qn = function(e) {
    function t() {
        return jE(this, t),
        IE(this, t, arguments)
    }
    return RE(t, e),
    DE(t, [{
        key: "render",
        value: function() {
            return A.createElement(NE, this.props)
        }
    }])
}(A.Component);
lg(Qn, "displayName", "YAxis");
lg(Qn, "defaultProps", {
    allowDuplicatedCategory: !0,
    allowDecimals: !0,
    hide: !1,
    orientation: "left",
    width: 60,
    height: 0,
    mirror: !1,
    yAxisId: 0,
    tickCount: 5,
    type: "number",
    padding: {
        top: 0,
        bottom: 0
    },
    allowDataOverflow: !1,
    scale: "auto",
    reversed: !1
});
function Xf(e) {
    return VE(e) || WE(e) || FE(e) || zE()
}
function zE() {
    throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function FE(e, t) {
    if (e) {
        if (typeof e == "string")
            return Ls(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return Ls(e, t)
    }
}
function WE(e) {
    if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null)
        return Array.from(e)
}
function VE(e) {
    if (Array.isArray(e))
        return Ls(e)
}
function Ls(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
var Rs = function(t, n, r, i, a) {
    var o = Tt(t, yl)
      , s = Tt(t, Za)
      , l = [].concat(Xf(o), Xf(s))
      , c = Tt(t, Qa)
      , u = "".concat(i, "Id")
      , f = i[0]
      , h = n;
    if (l.length && (h = l.reduce(function(g, m) {
        if (m.props[u] === r && Qt(m.props, "extendDomain") && L(m.props[f])) {
            var v = m.props[f];
            return [Math.min(g[0], v), Math.max(g[1], v)]
        }
        return g
    }, h)),
    c.length) {
        var d = "".concat(f, "1")
          , p = "".concat(f, "2");
        h = c.reduce(function(g, m) {
            if (m.props[u] === r && Qt(m.props, "extendDomain") && L(m.props[d]) && L(m.props[p])) {
                var v = m.props[d]
                  , b = m.props[p];
                return [Math.min(g[0], v, b), Math.max(g[1], v, b)]
            }
            return g
        }, h)
    }
    return a && a.length && (h = a.reduce(function(g, m) {
        return L(m) ? [Math.min(g[0], m), Math.max(g[1], m)] : g
    }, h)),
    h
}
  , ug = {
    exports: {}
};
(function(e) {
    var t = Object.prototype.hasOwnProperty
      , n = "~";
    function r() {}
    Object.create && (r.prototype = Object.create(null),
    new r().__proto__ || (n = !1));
    function i(l, c, u) {
        this.fn = l,
        this.context = c,
        this.once = u || !1
    }
    function a(l, c, u, f, h) {
        if (typeof u != "function")
            throw new TypeError("The listener must be a function");
        var d = new i(u,f || l,h)
          , p = n ? n + c : c;
        return l._events[p] ? l._events[p].fn ? l._events[p] = [l._events[p], d] : l._events[p].push(d) : (l._events[p] = d,
        l._eventsCount++),
        l
    }
    function o(l, c) {
        --l._eventsCount === 0 ? l._events = new r : delete l._events[c]
    }
    function s() {
        this._events = new r,
        this._eventsCount = 0
    }
    s.prototype.eventNames = function() {
        var c = [], u, f;
        if (this._eventsCount === 0)
            return c;
        for (f in u = this._events)
            t.call(u, f) && c.push(n ? f.slice(1) : f);
        return Object.getOwnPropertySymbols ? c.concat(Object.getOwnPropertySymbols(u)) : c
    }
    ,
    s.prototype.listeners = function(c) {
        var u = n ? n + c : c
          , f = this._events[u];
        if (!f)
            return [];
        if (f.fn)
            return [f.fn];
        for (var h = 0, d = f.length, p = new Array(d); h < d; h++)
            p[h] = f[h].fn;
        return p
    }
    ,
    s.prototype.listenerCount = function(c) {
        var u = n ? n + c : c
          , f = this._events[u];
        return f ? f.fn ? 1 : f.length : 0
    }
    ,
    s.prototype.emit = function(c, u, f, h, d, p) {
        var g = n ? n + c : c;
        if (!this._events[g])
            return !1;
        var m = this._events[g], v = arguments.length, b, x;
        if (m.fn) {
            switch (m.once && this.removeListener(c, m.fn, void 0, !0),
            v) {
            case 1:
                return m.fn.call(m.context),
                !0;
            case 2:
                return m.fn.call(m.context, u),
                !0;
            case 3:
                return m.fn.call(m.context, u, f),
                !0;
            case 4:
                return m.fn.call(m.context, u, f, h),
                !0;
            case 5:
                return m.fn.call(m.context, u, f, h, d),
                !0;
            case 6:
                return m.fn.call(m.context, u, f, h, d, p),
                !0
            }
            for (x = 1,
            b = new Array(v - 1); x < v; x++)
                b[x - 1] = arguments[x];
            m.fn.apply(m.context, b)
        } else {
            var w = m.length, y;
            for (x = 0; x < w; x++)
                switch (m[x].once && this.removeListener(c, m[x].fn, void 0, !0),
                v) {
                case 1:
                    m[x].fn.call(m[x].context);
                    break;
                case 2:
                    m[x].fn.call(m[x].context, u);
                    break;
                case 3:
                    m[x].fn.call(m[x].context, u, f);
                    break;
                case 4:
                    m[x].fn.call(m[x].context, u, f, h);
                    break;
                default:
                    if (!b)
                        for (y = 1,
                        b = new Array(v - 1); y < v; y++)
                            b[y - 1] = arguments[y];
                    m[x].fn.apply(m[x].context, b)
                }
        }
        return !0
    }
    ,
    s.prototype.on = function(c, u, f) {
        return a(this, c, u, f, !1)
    }
    ,
    s.prototype.once = function(c, u, f) {
        return a(this, c, u, f, !0)
    }
    ,
    s.prototype.removeListener = function(c, u, f, h) {
        var d = n ? n + c : c;
        if (!this._events[d])
            return this;
        if (!u)
            return o(this, d),
            this;
        var p = this._events[d];
        if (p.fn)
            p.fn === u && (!h || p.once) && (!f || p.context === f) && o(this, d);
        else {
            for (var g = 0, m = [], v = p.length; g < v; g++)
                (p[g].fn !== u || h && !p[g].once || f && p[g].context !== f) && m.push(p[g]);
            m.length ? this._events[d] = m.length === 1 ? m[0] : m : o(this, d)
        }
        return this
    }
    ,
    s.prototype.removeAllListeners = function(c) {
        var u;
        return c ? (u = n ? n + c : c,
        this._events[u] && o(this, u)) : (this._events = new r,
        this._eventsCount = 0),
        this
    }
    ,
    s.prototype.off = s.prototype.removeListener,
    s.prototype.addListener = s.prototype.on,
    s.prefixed = n,
    s.EventEmitter = s,
    e.exports = s
}
)(ug);
var HE = ug.exports;
const KE = em(HE);
var Ao = new KE
  , So = "recharts.syncMouseEvents";
function ai(e) {
    "@babel/helpers - typeof";
    return ai = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    ai(e)
}
function XE(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function GE(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, fg(r.key), r)
    }
}
function UE(e, t, n) {
    return t && GE(e.prototype, t),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function ko(e, t, n) {
    return t = fg(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function fg(e) {
    var t = YE(e, "string");
    return ai(t) == "symbol" ? t : t + ""
}
function YE(e, t) {
    if (ai(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (ai(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return String(e)
}
var qE = function() {
    function e() {
        XE(this, e),
        ko(this, "activeIndex", 0),
        ko(this, "coordinateList", []),
        ko(this, "layout", "horizontal")
    }
    return UE(e, [{
        key: "setDetails",
        value: function(n) {
            var r, i = n.coordinateList, a = i === void 0 ? null : i, o = n.container, s = o === void 0 ? null : o, l = n.layout, c = l === void 0 ? null : l, u = n.offset, f = u === void 0 ? null : u, h = n.mouseHandlerCallback, d = h === void 0 ? null : h;
            this.coordinateList = (r = a ?? this.coordinateList) !== null && r !== void 0 ? r : [],
            this.container = s ?? this.container,
            this.layout = c ?? this.layout,
            this.offset = f ?? this.offset,
            this.mouseHandlerCallback = d ?? this.mouseHandlerCallback,
            this.activeIndex = Math.min(Math.max(this.activeIndex, 0), this.coordinateList.length - 1)
        }
    }, {
        key: "focus",
        value: function() {
            this.spoofMouse()
        }
    }, {
        key: "keyboardEvent",
        value: function(n) {
            if (this.coordinateList.length !== 0)
                switch (n.key) {
                case "ArrowRight":
                    {
                        if (this.layout !== "horizontal")
                            return;
                        this.activeIndex = Math.min(this.activeIndex + 1, this.coordinateList.length - 1),
                        this.spoofMouse();
                        break
                    }
                case "ArrowLeft":
                    {
                        if (this.layout !== "horizontal")
                            return;
                        this.activeIndex = Math.max(this.activeIndex - 1, 0),
                        this.spoofMouse();
                        break
                    }
                }
        }
    }, {
        key: "setIndex",
        value: function(n) {
            this.activeIndex = n
        }
    }, {
        key: "spoofMouse",
        value: function() {
            var n, r;
            if (this.layout === "horizontal" && this.coordinateList.length !== 0) {
                var i = this.container.getBoundingClientRect()
                  , a = i.x
                  , o = i.y
                  , s = i.height
                  , l = this.coordinateList[this.activeIndex].coordinate
                  , c = ((n = window) === null || n === void 0 ? void 0 : n.scrollX) || 0
                  , u = ((r = window) === null || r === void 0 ? void 0 : r.scrollY) || 0
                  , f = a + l + c
                  , h = o + this.offset.top + s / 2 + u;
                this.mouseHandlerCallback({
                    pageX: f,
                    pageY: h
                })
            }
        }
    }])
}();
function ZE(e, t, n) {
    if (n === "number" && t === !0 && Array.isArray(e)) {
        var r = e?.[0]
          , i = e?.[1];
        if (r && i && L(r) && L(i))
            return !0
    }
    return !1
}
function JE(e, t, n, r) {
    var i = r / 2;
    return {
        stroke: "none",
        fill: "#ccc",
        x: e === "horizontal" ? t.x - i : n.left + .5,
        y: e === "horizontal" ? n.top + .5 : t.y - i,
        width: e === "horizontal" ? r : n.width - 1,
        height: e === "horizontal" ? n.height - 1 : r
    }
}
function hg(e) {
    var t = e.cx
      , n = e.cy
      , r = e.radius
      , i = e.startAngle
      , a = e.endAngle
      , o = it(t, n, r, i)
      , s = it(t, n, r, a);
    return {
        points: [o, s],
        cx: t,
        cy: n,
        radius: r,
        startAngle: i,
        endAngle: a
    }
}
function QE(e, t, n) {
    var r, i, a, o;
    if (e === "horizontal")
        r = t.x,
        a = r,
        i = n.top,
        o = n.top + n.height;
    else if (e === "vertical")
        i = t.y,
        o = i,
        r = n.left,
        a = n.left + n.width;
    else if (t.cx != null && t.cy != null)
        if (e === "centric") {
            var s = t.cx
              , l = t.cy
              , c = t.innerRadius
              , u = t.outerRadius
              , f = t.angle
              , h = it(s, l, c, f)
              , d = it(s, l, u, f);
            r = h.x,
            i = h.y,
            a = d.x,
            o = d.y
        } else
            return hg(t);
    return [{
        x: r,
        y: i
    }, {
        x: a,
        y: o
    }]
}
function oi(e) {
    "@babel/helpers - typeof";
    return oi = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    oi(e)
}
function Gf(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function Di(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? Gf(Object(n), !0).forEach(function(r) {
            tM(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Gf(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function tM(e, t, n) {
    return t = eM(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function eM(e) {
    var t = nM(e, "string");
    return oi(t) == "symbol" ? t : t + ""
}
function nM(e, t) {
    if (oi(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (oi(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
function rM(e) {
    var t, n, r = e.element, i = e.tooltipEventType, a = e.isActive, o = e.activeCoordinate, s = e.activePayload, l = e.offset, c = e.activeTooltipIndex, u = e.tooltipAxisBandSize, f = e.layout, h = e.chartName, d = (t = r.props.cursor) !== null && t !== void 0 ? t : (n = r.type.defaultProps) === null || n === void 0 ? void 0 : n.cursor;
    if (!r || !d || !a || !o || h !== "ScatterChart" && i !== "axis")
        return null;
    var p, g = Oe;
    if (h === "ScatterChart")
        p = o,
        g = CP;
    else if (h === "BarChart")
        p = JE(f, o, l, u),
        g = ul;
    else if (f === "radial") {
        var m = hg(o)
          , v = m.cx
          , b = m.cy
          , x = m.radius
          , w = m.startAngle
          , y = m.endAngle;
        p = {
            cx: v,
            cy: b,
            startAngle: w,
            endAngle: y,
            innerRadius: x,
            outerRadius: x
        },
        g = pp
    } else
        p = {
            points: QE(f, o, l)
        },
        g = Oe;
    var O = Di(Di(Di(Di({
        stroke: "#ccc",
        pointerEvents: "none"
    }, l), p), F(d, !1)), {}, {
        payload: s,
        payloadIndex: c,
        className: U("recharts-tooltip-cursor", d.className)
    });
    return N.isValidElement(d) ? N.cloneElement(d, O) : N.createElement(g, O)
}
var iM = ["item"]
  , aM = ["children", "className", "width", "height", "style", "compact", "title", "desc"];
function Kn(e) {
    "@babel/helpers - typeof";
    return Kn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
        return typeof t
    }
    : function(t) {
        return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
    }
    ,
    Kn(e)
}
function gn() {
    return gn = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
    }
    ,
    gn.apply(this, arguments)
}
function Uf(e, t) {
    return lM(e) || sM(e, t) || pg(e, t) || oM()
}
function oM() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function sM(e, t) {
    var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
    if (n != null) {
        var r, i, a, o, s = [], l = !0, c = !1;
        try {
            if (a = (n = n.call(e)).next,
            t !== 0)
                for (; !(l = (r = a.call(n)).done) && (s.push(r.value),
                s.length !== t); l = !0)
                    ;
        } catch (u) {
            c = !0,
            i = u
        } finally {
            try {
                if (!l && n.return != null && (o = n.return(),
                Object(o) !== o))
                    return
            } finally {
                if (c)
                    throw i
            }
        }
        return s
    }
}
function lM(e) {
    if (Array.isArray(e))
        return e
}
function Yf(e, t) {
    if (e == null)
        return {};
    var n = cM(e, t), r, i;
    if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        for (i = 0; i < a.length; i++)
            r = a[i],
            !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r])
    }
    return n
}
function cM(e, t) {
    if (e == null)
        return {};
    var n = {};
    for (var r in e)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
            if (t.indexOf(r) >= 0)
                continue;
            n[r] = e[r]
        }
    return n
}
function uM(e, t) {
    if (!(e instanceof t))
        throw new TypeError("Cannot call a class as a function")
}
function fM(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1,
        r.configurable = !0,
        "value"in r && (r.writable = !0),
        Object.defineProperty(e, gg(r.key), r)
    }
}
function hM(e, t, n) {
    return t && fM(e.prototype, t),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    e
}
function dM(e, t, n) {
    return t = Ma(t),
    pM(e, dg() ? Reflect.construct(t, n || [], Ma(e).constructor) : t.apply(e, n))
}
function pM(e, t) {
    if (t && (Kn(t) === "object" || typeof t == "function"))
        return t;
    if (t !== void 0)
        throw new TypeError("Derived constructors may only return object or undefined");
    return gM(e)
}
function gM(e) {
    if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}
function dg() {
    try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}))
    } catch {}
    return (dg = function() {
        return !!e
    }
    )()
}
function Ma(e) {
    return Ma = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(n) {
        return n.__proto__ || Object.getPrototypeOf(n)
    }
    ,
    Ma(e)
}
function mM(e, t) {
    if (typeof t != "function" && t !== null)
        throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }),
    Object.defineProperty(e, "prototype", {
        writable: !1
    }),
    t && Bs(e, t)
}
function Bs(e, t) {
    return Bs = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, i) {
        return r.__proto__ = i,
        r
    }
    ,
    Bs(e, t)
}
function Xn(e) {
    return bM(e) || vM(e) || pg(e) || yM()
}
function yM() {
    throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
}
function pg(e, t) {
    if (e) {
        if (typeof e == "string")
            return Ns(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        if (n === "Object" && e.constructor && (n = e.constructor.name),
        n === "Map" || n === "Set")
            return Array.from(e);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
            return Ns(e, t)
    }
}
function vM(e) {
    if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null)
        return Array.from(e)
}
function bM(e) {
    if (Array.isArray(e))
        return Ns(e)
}
function Ns(e, t) {
    (t == null || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++)
        r[n] = e[n];
    return r
}
function qf(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter(function(i) {
            return Object.getOwnPropertyDescriptor(e, i).enumerable
        })),
        n.push.apply(n, r)
    }
    return n
}
function D(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t] != null ? arguments[t] : {};
        t % 2 ? qf(Object(n), !0).forEach(function(r) {
            G(e, r, n[r])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : qf(Object(n)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
        })
    }
    return e
}
function G(e, t, n) {
    return t = gg(t),
    t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n,
    e
}
function gg(e) {
    var t = xM(e, "string");
    return Kn(t) == "symbol" ? t : t + ""
}
function xM(e, t) {
    if (Kn(e) != "object" || !e)
        return e;
    var n = e[Symbol.toPrimitive];
    if (n !== void 0) {
        var r = n.call(e, t);
        if (Kn(r) != "object")
            return r;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return (t === "string" ? String : Number)(e)
}
var OM = {
    xAxis: ["bottom", "top"],
    yAxis: ["left", "right"]
}
  , wM = {
    width: "100%",
    height: "100%"
}
  , mg = {
    x: 0,
    y: 0
};
function Ii(e) {
    return e
}
var _M = function(t, n) {
    return n === "horizontal" ? t.x : n === "vertical" ? t.y : n === "centric" ? t.angle : t.radius
}
  , PM = function(t, n, r, i) {
    var a = n.find(function(u) {
        return u && u.index === r
    });
    if (a) {
        if (t === "horizontal")
            return {
                x: a.coordinate,
                y: i.y
            };
        if (t === "vertical")
            return {
                x: i.x,
                y: a.coordinate
            };
        if (t === "centric") {
            var o = a.coordinate
              , s = i.radius;
            return D(D(D({}, i), it(i.cx, i.cy, s, o)), {}, {
                angle: o,
                radius: s
            })
        }
        var l = a.coordinate
          , c = i.angle;
        return D(D(D({}, i), it(i.cx, i.cy, l, c)), {}, {
            angle: c,
            radius: l
        })
    }
    return mg
}
  , ro = function(t, n) {
    var r = n.graphicalItems
      , i = n.dataStartIndex
      , a = n.dataEndIndex
      , o = (r ?? []).reduce(function(s, l) {
        var c = l.props.data;
        return c && c.length ? [].concat(Xn(s), Xn(c)) : s
    }, []);
    return o.length > 0 ? o : t && t.length && L(i) && L(a) ? t.slice(i, a + 1) : []
};
function yg(e) {
    return e === "number" ? [0, "auto"] : void 0
}
var zs = function(t, n, r, i) {
    var a = t.graphicalItems
      , o = t.tooltipAxis
      , s = ro(n, t);
    return r < 0 || !a || !a.length || r >= s.length ? null : a.reduce(function(l, c) {
        var u, f = (u = c.props.data) !== null && u !== void 0 ? u : n;
        f && t.dataStartIndex + t.dataEndIndex !== 0 && t.dataEndIndex - t.dataStartIndex >= r && (f = f.slice(t.dataStartIndex, t.dataEndIndex + 1));
        var h;
        if (o.dataKey && !o.allowDuplicatedCategory) {
            var d = f === void 0 ? s : f;
            h = Yi(d, o.dataKey, i)
        } else
            h = f && f[r] || s[r];
        return h ? [].concat(Xn(l), [lp(c, h)]) : l
    }, [])
}
  , Zf = function(t, n, r, i) {
    var a = i || {
        x: t.chartX,
        y: t.chartY
    }
      , o = _M(a, r)
      , s = t.orderedTooltipTicks
      , l = t.tooltipAxis
      , c = t.tooltipTicks
      , u = Nw(o, s, c, l);
    if (u >= 0 && c) {
        var f = c[u] && c[u].value
          , h = zs(t, n, u, f)
          , d = PM(r, s, u, a);
        return {
            activeTooltipIndex: u,
            activeLabel: f,
            activePayload: h,
            activeCoordinate: d
        }
    }
    return null
}
  , AM = function(t, n) {
    var r = n.axes
      , i = n.graphicalItems
      , a = n.axisType
      , o = n.axisIdKey
      , s = n.stackGroups
      , l = n.dataStartIndex
      , c = n.dataEndIndex
      , u = t.layout
      , f = t.children
      , h = t.stackOffset
      , d = np(u, a);
    return r.reduce(function(p, g) {
        var m, v = g.type.defaultProps !== void 0 ? D(D({}, g.type.defaultProps), g.props) : g.props, b = v.type, x = v.dataKey, w = v.allowDataOverflow, y = v.allowDuplicatedCategory, O = v.scale, _ = v.ticks, P = v.includeHidden, S = v[o];
        if (p[S])
            return p;
        var k = ro(t.data, {
            graphicalItems: i.filter(function(z) {
                var H, Q = o in z.props ? z.props[o] : (H = z.type.defaultProps) === null || H === void 0 ? void 0 : H[o];
                return Q === S
            }),
            dataStartIndex: l,
            dataEndIndex: c
        }), E = k.length, M, C, I;
        ZE(v.domain, w, b) && (M = os(v.domain, null, w),
        d && (b === "number" || O !== "auto") && (I = wr(k, x, "category")));
        var T = yg(b);
        if (!M || M.length === 0) {
            var j, $ = (j = v.domain) !== null && j !== void 0 ? j : T;
            if (x) {
                if (M = wr(k, x, b),
                b === "category" && d) {
                    var R = Ax(M);
                    y && R ? (C = M,
                    M = Ni(0, E)) : y || (M = $u($, M, g).reduce(function(z, H) {
                        return z.indexOf(H) >= 0 ? z : [].concat(Xn(z), [H])
                    }, []))
                } else if (b === "category")
                    y ? M = M.filter(function(z) {
                        return z !== "" && !X(z)
                    }) : M = $u($, M, g).reduce(function(z, H) {
                        return z.indexOf(H) >= 0 || H === "" || X(H) ? z : [].concat(Xn(z), [H])
                    }, []);
                else if (b === "number") {
                    var B = Hw(k, i.filter(function(z) {
                        var H, Q, ct = o in z.props ? z.props[o] : (H = z.type.defaultProps) === null || H === void 0 ? void 0 : H[o], mt = "hide"in z.props ? z.props.hide : (Q = z.type.defaultProps) === null || Q === void 0 ? void 0 : Q.hide;
                        return ct === S && (P || !mt)
                    }), x, a, u);
                    B && (M = B)
                }
                d && (b === "number" || O !== "auto") && (I = wr(k, x, "category"))
            } else
                d ? M = Ni(0, E) : s && s[S] && s[S].hasStack && b === "number" ? M = h === "expand" ? [0, 1] : sp(s[S].stackGroups, l, c) : M = ep(k, i.filter(function(z) {
                    var H = o in z.props ? z.props[o] : z.type.defaultProps[o]
                      , Q = "hide"in z.props ? z.props.hide : z.type.defaultProps.hide;
                    return H === S && (P || !Q)
                }), b, u, !0);
            if (b === "number")
                M = Rs(f, M, S, a, _),
                $ && (M = os($, M, w));
            else if (b === "category" && $) {
                var W = $
                  , V = M.every(function(z) {
                    return W.indexOf(z) >= 0
                });
                V && (M = W)
            }
        }
        return D(D({}, p), {}, G({}, S, D(D({}, v), {}, {
            axisType: a,
            domain: M,
            categoricalDomain: I,
            duplicateDomain: C,
            originalDomain: (m = v.domain) !== null && m !== void 0 ? m : T,
            isCategorical: d,
            layout: u
        })))
    }, {})
}
  , SM = function(t, n) {
    var r = n.graphicalItems
      , i = n.Axis
      , a = n.axisType
      , o = n.axisIdKey
      , s = n.stackGroups
      , l = n.dataStartIndex
      , c = n.dataEndIndex
      , u = t.layout
      , f = t.children
      , h = ro(t.data, {
        graphicalItems: r,
        dataStartIndex: l,
        dataEndIndex: c
    })
      , d = h.length
      , p = np(u, a)
      , g = -1;
    return r.reduce(function(m, v) {
        var b = v.type.defaultProps !== void 0 ? D(D({}, v.type.defaultProps), v.props) : v.props
          , x = b[o]
          , w = yg("number");
        if (!m[x]) {
            g++;
            var y;
            return p ? y = Ni(0, d) : s && s[x] && s[x].hasStack ? (y = sp(s[x].stackGroups, l, c),
            y = Rs(f, y, x, a)) : (y = os(w, ep(h, r.filter(function(O) {
                var _, P, S = o in O.props ? O.props[o] : (_ = O.type.defaultProps) === null || _ === void 0 ? void 0 : _[o], k = "hide"in O.props ? O.props.hide : (P = O.type.defaultProps) === null || P === void 0 ? void 0 : P.hide;
                return S === x && !k
            }), "number", u), i.defaultProps.allowDataOverflow),
            y = Rs(f, y, x, a)),
            D(D({}, m), {}, G({}, x, D(D({
                axisType: a
            }, i.defaultProps), {}, {
                hide: !0,
                orientation: Bt(OM, "".concat(a, ".").concat(g % 2), null),
                domain: y,
                originalDomain: w,
                isCategorical: p,
                layout: u
            })))
        }
        return m
    }, {})
}
  , kM = function(t, n) {
    var r = n.axisType
      , i = r === void 0 ? "xAxis" : r
      , a = n.AxisComp
      , o = n.graphicalItems
      , s = n.stackGroups
      , l = n.dataStartIndex
      , c = n.dataEndIndex
      , u = t.children
      , f = "".concat(i, "Id")
      , h = Tt(u, a)
      , d = {};
    return h && h.length ? d = AM(t, {
        axes: h,
        graphicalItems: o,
        axisType: i,
        axisIdKey: f,
        stackGroups: s,
        dataStartIndex: l,
        dataEndIndex: c
    }) : o && o.length && (d = SM(t, {
        Axis: a,
        graphicalItems: o,
        axisType: i,
        axisIdKey: f,
        stackGroups: s,
        dataStartIndex: l,
        dataEndIndex: c
    })),
    d
}
  , EM = function(t) {
    var n = ge(t)
      , r = ce(n, !1, !0);
    return {
        tooltipTicks: r,
        orderedTooltipTicks: Fs(r, function(i) {
            return i.coordinate
        }),
        tooltipAxis: n,
        tooltipAxisBandSize: ia(n, r)
    }
}
  , Jf = function(t) {
    var n = t.children
      , r = t.defaultShowTooltip
      , i = Lt(n, Dn)
      , a = 0
      , o = 0;
    return t.data && t.data.length !== 0 && (o = t.data.length - 1),
    i && i.props && (i.props.startIndex >= 0 && (a = i.props.startIndex),
    i.props.endIndex >= 0 && (o = i.props.endIndex)),
    {
        chartX: 0,
        chartY: 0,
        dataStartIndex: a,
        dataEndIndex: o,
        activeTooltipIndex: -1,
        isTooltipActive: !!r
    }
}
  , MM = function(t) {
    return !t || !t.length ? !1 : t.some(function(n) {
        var r = ue(n && n.type);
        return r && r.indexOf("Bar") >= 0
    })
}
  , Qf = function(t) {
    return t === "horizontal" ? {
        numericAxisName: "yAxis",
        cateAxisName: "xAxis"
    } : t === "vertical" ? {
        numericAxisName: "xAxis",
        cateAxisName: "yAxis"
    } : t === "centric" ? {
        numericAxisName: "radiusAxis",
        cateAxisName: "angleAxis"
    } : {
        numericAxisName: "angleAxis",
        cateAxisName: "radiusAxis"
    }
}
  , TM = function(t, n) {
    var r = t.props
      , i = t.graphicalItems
      , a = t.xAxisMap
      , o = a === void 0 ? {} : a
      , s = t.yAxisMap
      , l = s === void 0 ? {} : s
      , c = r.width
      , u = r.height
      , f = r.children
      , h = r.margin || {}
      , d = Lt(f, Dn)
      , p = Lt(f, vn)
      , g = Object.keys(l).reduce(function(y, O) {
        var _ = l[O]
          , P = _.orientation;
        return !_.mirror && !_.hide ? D(D({}, y), {}, G({}, P, y[P] + _.width)) : y
    }, {
        left: h.left || 0,
        right: h.right || 0
    })
      , m = Object.keys(o).reduce(function(y, O) {
        var _ = o[O]
          , P = _.orientation;
        return !_.mirror && !_.hide ? D(D({}, y), {}, G({}, P, Bt(y, "".concat(P)) + _.height)) : y
    }, {
        top: h.top || 0,
        bottom: h.bottom || 0
    })
      , v = D(D({}, m), g)
      , b = v.bottom;
    d && (v.bottom += d.props.height || Dn.defaultProps.height),
    p && n && (v = Ww(v, i, r, n));
    var x = c - v.left - v.right
      , w = u - v.top - v.bottom;
    return D(D({
        brushBottom: b
    }, v), {}, {
        width: Math.max(x, 0),
        height: Math.max(w, 0)
    })
}
  , jM = function(t, n) {
    if (n === "xAxis")
        return t[n].width;
    if (n === "yAxis")
        return t[n].height
}
  , hi = function(t) {
    var n = t.chartName
      , r = t.GraphicalChild
      , i = t.defaultTooltipEventType
      , a = i === void 0 ? "axis" : i
      , o = t.validateTooltipEventTypes
      , s = o === void 0 ? ["axis"] : o
      , l = t.axisComponents
      , c = t.legendContent
      , u = t.formatAxisMap
      , f = t.defaultProps
      , h = function(v, b) {
        var x = b.graphicalItems
          , w = b.stackGroups
          , y = b.offset
          , O = b.updateId
          , _ = b.dataStartIndex
          , P = b.dataEndIndex
          , S = v.barSize
          , k = v.layout
          , E = v.barGap
          , M = v.barCategoryGap
          , C = v.maxBarSize
          , I = Qf(k)
          , T = I.numericAxisName
          , j = I.cateAxisName
          , $ = MM(x)
          , R = [];
        return x.forEach(function(B, W) {
            var V = ro(v.data, {
                graphicalItems: [B],
                dataStartIndex: _,
                dataEndIndex: P
            })
              , z = B.type.defaultProps !== void 0 ? D(D({}, B.type.defaultProps), B.props) : B.props
              , H = z.dataKey
              , Q = z.maxBarSize
              , ct = z["".concat(T, "Id")]
              , mt = z["".concat(j, "Id")]
              , tr = {}
              , Nt = l.reduce(function(Ce, De) {
                var io = b["".concat(De.axisType, "Map")]
                  , xl = z["".concat(De.axisType, "Id")];
                io && io[xl] || De.axisType === "zAxis" || qe();
                var Ol = io[xl];
                return D(D({}, Ce), {}, G(G({}, De.axisType, Ol), "".concat(De.axisType, "Ticks"), ce(Ol)))
            }, tr)
              , Te = Nt[j]
              , di = Nt["".concat(j, "Ticks")]
              , nn = w && w[ct] && w[ct].hasStack && Qw(B, w[ct].stackGroups)
              , er = ue(B.type).indexOf("Bar") >= 0
              , je = ia(Te, di)
              , rn = []
              , nr = $ && zw({
                barSize: S,
                stackGroups: w,
                totalSize: jM(Nt, j)
            });
            if (er) {
                var rr, an, ir = X(Q) ? C : Q, on = (rr = (an = ia(Te, di, !0)) !== null && an !== void 0 ? an : ir) !== null && rr !== void 0 ? rr : 0;
                rn = Fw({
                    barGap: E,
                    barCategoryGap: M,
                    bandSize: on !== je ? on : je,
                    sizeList: nr[mt],
                    maxBarSize: ir
                }),
                on !== je && (rn = rn.map(function(Ce) {
                    return D(D({}, Ce), {}, {
                        position: D(D({}, Ce.position), {}, {
                            offset: Ce.position.offset - on / 2
                        })
                    })
                }))
            }
            var pi = B && B.type && B.type.getComposedData;
            pi && R.push({
                props: D(D({}, pi(D(D({}, Nt), {}, {
                    displayedData: V,
                    props: v,
                    dataKey: H,
                    item: B,
                    bandSize: je,
                    barPosition: rn,
                    offset: y,
                    stackedData: nn,
                    layout: k,
                    dataStartIndex: _,
                    dataEndIndex: P
                }))), {}, G(G(G({
                    key: B.key || "item-".concat(W)
                }, T, Nt[T]), j, Nt[j]), "animationId", O)),
                childIndex: Bx(B, v.children),
                item: B
            })
        }),
        R
    }
      , d = function(v, b) {
        var x = v.props
          , w = v.dataStartIndex
          , y = v.dataEndIndex
          , O = v.updateId;
        if (!Yc({
            props: x
        }))
            return null;
        var _ = x.children
          , P = x.layout
          , S = x.stackOffset
          , k = x.data
          , E = x.reverseStackOrder
          , M = Qf(P)
          , C = M.numericAxisName
          , I = M.cateAxisName
          , T = Tt(_, r)
          , j = Zw(k, T, "".concat(C, "Id"), "".concat(I, "Id"), S, E)
          , $ = l.reduce(function(z, H) {
            var Q = "".concat(H.axisType, "Map");
            return D(D({}, z), {}, G({}, Q, kM(x, D(D({}, H), {}, {
                graphicalItems: T,
                stackGroups: H.axisType === C && j,
                dataStartIndex: w,
                dataEndIndex: y
            }))))
        }, {})
          , R = TM(D(D({}, $), {}, {
            props: x,
            graphicalItems: T
        }), b?.legendBBox);
        Object.keys($).forEach(function(z) {
            $[z] = u(x, $[z], R, z.replace("Map", ""), n)
        });
        var B = $["".concat(I, "Map")]
          , W = EM(B)
          , V = h(x, D(D({}, $), {}, {
            dataStartIndex: w,
            dataEndIndex: y,
            updateId: O,
            graphicalItems: T,
            stackGroups: j,
            offset: R
        }));
        return D(D({
            formattedGraphicalItems: V,
            graphicalItems: T,
            offset: R,
            stackGroups: j
        }, W), $)
    }
      , p = function(m) {
        function v(b) {
            var x, w, y;
            return uM(this, v),
            y = dM(this, v, [b]),
            G(y, "eventEmitterSymbol", Symbol("rechartsEventEmitter")),
            G(y, "accessibilityManager", new qE),
            G(y, "handleLegendBBoxUpdate", function(O) {
                if (O) {
                    var _ = y.state
                      , P = _.dataStartIndex
                      , S = _.dataEndIndex
                      , k = _.updateId;
                    y.setState(D({
                        legendBBox: O
                    }, d({
                        props: y.props,
                        dataStartIndex: P,
                        dataEndIndex: S,
                        updateId: k
                    }, D(D({}, y.state), {}, {
                        legendBBox: O
                    }))))
                }
            }),
            G(y, "handleReceiveSyncEvent", function(O, _, P) {
                if (y.props.syncId === O) {
                    if (P === y.eventEmitterSymbol && typeof y.props.syncMethod != "function")
                        return;
                    y.applySyncEvent(_)
                }
            }),
            G(y, "handleBrushChange", function(O) {
                var _ = O.startIndex
                  , P = O.endIndex;
                if (_ !== y.state.dataStartIndex || P !== y.state.dataEndIndex) {
                    var S = y.state.updateId;
                    y.setState(function() {
                        return D({
                            dataStartIndex: _,
                            dataEndIndex: P
                        }, d({
                            props: y.props,
                            dataStartIndex: _,
                            dataEndIndex: P,
                            updateId: S
                        }, y.state))
                    }),
                    y.triggerSyncEvent({
                        dataStartIndex: _,
                        dataEndIndex: P
                    })
                }
            }),
            G(y, "handleMouseEnter", function(O) {
                var _ = y.getMouseInfo(O);
                if (_) {
                    var P = D(D({}, _), {}, {
                        isTooltipActive: !0
                    });
                    y.setState(P),
                    y.triggerSyncEvent(P);
                    var S = y.props.onMouseEnter;
                    K(S) && S(P, O)
                }
            }),
            G(y, "triggeredAfterMouseMove", function(O) {
                var _ = y.getMouseInfo(O)
                  , P = _ ? D(D({}, _), {}, {
                    isTooltipActive: !0
                }) : {
                    isTooltipActive: !1
                };
                y.setState(P),
                y.triggerSyncEvent(P);
                var S = y.props.onMouseMove;
                K(S) && S(P, O)
            }),
            G(y, "handleItemMouseEnter", function(O) {
                y.setState(function() {
                    return {
                        isTooltipActive: !0,
                        activeItem: O,
                        activePayload: O.tooltipPayload,
                        activeCoordinate: O.tooltipPosition || {
                            x: O.cx,
                            y: O.cy
                        }
                    }
                })
            }),
            G(y, "handleItemMouseLeave", function() {
                y.setState(function() {
                    return {
                        isTooltipActive: !1
                    }
                })
            }),
            G(y, "handleMouseMove", function(O) {
                O.persist(),
                y.throttleTriggeredAfterMouseMove(O)
            }),
            G(y, "handleMouseLeave", function(O) {
                y.throttleTriggeredAfterMouseMove.cancel();
                var _ = {
                    isTooltipActive: !1
                };
                y.setState(_),
                y.triggerSyncEvent(_);
                var P = y.props.onMouseLeave;
                K(P) && P(_, O)
            }),
            G(y, "handleOuterEvent", function(O) {
                var _ = Rx(O)
                  , P = Bt(y.props, "".concat(_));
                if (_ && K(P)) {
                    var S, k;
                    /.*touch.*/i.test(_) ? k = y.getMouseInfo(O.changedTouches[0]) : k = y.getMouseInfo(O),
                    P((S = k) !== null && S !== void 0 ? S : {}, O)
                }
            }),
            G(y, "handleClick", function(O) {
                var _ = y.getMouseInfo(O);
                if (_) {
                    var P = D(D({}, _), {}, {
                        isTooltipActive: !0
                    });
                    y.setState(P),
                    y.triggerSyncEvent(P);
                    var S = y.props.onClick;
                    K(S) && S(P, O)
                }
            }),
            G(y, "handleMouseDown", function(O) {
                var _ = y.props.onMouseDown;
                if (K(_)) {
                    var P = y.getMouseInfo(O);
                    _(P, O)
                }
            }),
            G(y, "handleMouseUp", function(O) {
                var _ = y.props.onMouseUp;
                if (K(_)) {
                    var P = y.getMouseInfo(O);
                    _(P, O)
                }
            }),
            G(y, "handleTouchMove", function(O) {
                O.changedTouches != null && O.changedTouches.length > 0 && y.throttleTriggeredAfterMouseMove(O.changedTouches[0])
            }),
            G(y, "handleTouchStart", function(O) {
                O.changedTouches != null && O.changedTouches.length > 0 && y.handleMouseDown(O.changedTouches[0])
            }),
            G(y, "handleTouchEnd", function(O) {
                O.changedTouches != null && O.changedTouches.length > 0 && y.handleMouseUp(O.changedTouches[0])
            }),
            G(y, "handleDoubleClick", function(O) {
                var _ = y.props.onDoubleClick;
                if (K(_)) {
                    var P = y.getMouseInfo(O);
                    _(P, O)
                }
            }),
            G(y, "handleContextMenu", function(O) {
                var _ = y.props.onContextMenu;
                if (K(_)) {
                    var P = y.getMouseInfo(O);
                    _(P, O)
                }
            }),
            G(y, "triggerSyncEvent", function(O) {
                y.props.syncId !== void 0 && Ao.emit(So, y.props.syncId, O, y.eventEmitterSymbol)
            }),
            G(y, "applySyncEvent", function(O) {
                var _ = y.props
                  , P = _.layout
                  , S = _.syncMethod
                  , k = y.state.updateId
                  , E = O.dataStartIndex
                  , M = O.dataEndIndex;
                if (O.dataStartIndex !== void 0 || O.dataEndIndex !== void 0)
                    y.setState(D({
                        dataStartIndex: E,
                        dataEndIndex: M
                    }, d({
                        props: y.props,
                        dataStartIndex: E,
                        dataEndIndex: M,
                        updateId: k
                    }, y.state)));
                else if (O.activeTooltipIndex !== void 0) {
                    var C = O.chartX
                      , I = O.chartY
                      , T = O.activeTooltipIndex
                      , j = y.state
                      , $ = j.offset
                      , R = j.tooltipTicks;
                    if (!$)
                        return;
                    if (typeof S == "function")
                        T = S(R, O);
                    else if (S === "value") {
                        T = -1;
                        for (var B = 0; B < R.length; B++)
                            if (R[B].value === O.activeLabel) {
                                T = B;
                                break
                            }
                    }
                    var W = D(D({}, $), {}, {
                        x: $.left,
                        y: $.top
                    })
                      , V = Math.min(C, W.x + W.width)
                      , z = Math.min(I, W.y + W.height)
                      , H = R[T] && R[T].value
                      , Q = zs(y.state, y.props.data, T)
                      , ct = R[T] ? {
                        x: P === "horizontal" ? R[T].coordinate : V,
                        y: P === "horizontal" ? z : R[T].coordinate
                    } : mg;
                    y.setState(D(D({}, O), {}, {
                        activeLabel: H,
                        activeCoordinate: ct,
                        activePayload: Q,
                        activeTooltipIndex: T
                    }))
                } else
                    y.setState(O)
            }),
            G(y, "renderCursor", function(O) {
                var _, P = y.state, S = P.isTooltipActive, k = P.activeCoordinate, E = P.activePayload, M = P.offset, C = P.activeTooltipIndex, I = P.tooltipAxisBandSize, T = y.getTooltipEventType(), j = (_ = O.props.active) !== null && _ !== void 0 ? _ : S, $ = y.props.layout, R = O.key || "_recharts-cursor";
                return A.createElement(rM, {
                    key: R,
                    activeCoordinate: k,
                    activePayload: E,
                    activeTooltipIndex: C,
                    chartName: n,
                    element: O,
                    isActive: j,
                    layout: $,
                    offset: M,
                    tooltipAxisBandSize: I,
                    tooltipEventType: T
                })
            }),
            G(y, "renderPolarAxis", function(O, _, P) {
                var S = Bt(O, "type.axisType")
                  , k = Bt(y.state, "".concat(S, "Map"))
                  , E = O.type.defaultProps
                  , M = E !== void 0 ? D(D({}, E), O.props) : O.props
                  , C = k && k[M["".concat(S, "Id")]];
                return N.cloneElement(O, D(D({}, C), {}, {
                    className: U(S, C.className),
                    key: O.key || "".concat(_, "-").concat(P),
                    ticks: ce(C, !0)
                }))
            }),
            G(y, "renderPolarGrid", function(O) {
                var _ = O.props
                  , P = _.radialLines
                  , S = _.polarAngles
                  , k = _.polarRadius
                  , E = y.state
                  , M = E.radiusAxisMap
                  , C = E.angleAxisMap
                  , I = ge(M)
                  , T = ge(C)
                  , j = T.cx
                  , $ = T.cy
                  , R = T.innerRadius
                  , B = T.outerRadius;
                return N.cloneElement(O, {
                    polarAngles: Array.isArray(S) ? S : ce(T, !0).map(function(W) {
                        return W.coordinate
                    }),
                    polarRadius: Array.isArray(k) ? k : ce(I, !0).map(function(W) {
                        return W.coordinate
                    }),
                    cx: j,
                    cy: $,
                    innerRadius: R,
                    outerRadius: B,
                    key: O.key || "polar-grid",
                    radialLines: P
                })
            }),
            G(y, "renderLegend", function() {
                var O = y.state.formattedGraphicalItems
                  , _ = y.props
                  , P = _.children
                  , S = _.width
                  , k = _.height
                  , E = y.props.margin || {}
                  , M = S - (E.left || 0) - (E.right || 0)
                  , C = Qd({
                    children: P,
                    formattedGraphicalItems: O,
                    legendWidth: M,
                    legendContent: c
                });
                if (!C)
                    return null;
                var I = C.item
                  , T = Yf(C, iM);
                return N.cloneElement(I, D(D({}, T), {}, {
                    chartWidth: S,
                    chartHeight: k,
                    margin: E,
                    onBBoxUpdate: y.handleLegendBBoxUpdate
                }))
            }),
            G(y, "renderTooltip", function() {
                var O, _ = y.props, P = _.children, S = _.accessibilityLayer, k = Lt(P, ie);
                if (!k)
                    return null;
                var E = y.state
                  , M = E.isTooltipActive
                  , C = E.activeCoordinate
                  , I = E.activePayload
                  , T = E.activeLabel
                  , j = E.offset
                  , $ = (O = k.props.active) !== null && O !== void 0 ? O : M;
                return N.cloneElement(k, {
                    viewBox: D(D({}, j), {}, {
                        x: j.left,
                        y: j.top
                    }),
                    active: $,
                    label: T,
                    payload: $ ? I : [],
                    coordinate: C,
                    accessibilityLayer: S
                })
            }),
            G(y, "renderBrush", function(O) {
                var _ = y.props
                  , P = _.margin
                  , S = _.data
                  , k = y.state
                  , E = k.offset
                  , M = k.dataStartIndex
                  , C = k.dataEndIndex
                  , I = k.updateId;
                return N.cloneElement(O, {
                    key: O.key || "_recharts-brush",
                    onChange: Ti(y.handleBrushChange, O.props.onChange),
                    data: S,
                    x: L(O.props.x) ? O.props.x : E.left,
                    y: L(O.props.y) ? O.props.y : E.top + E.height + E.brushBottom - (P.bottom || 0),
                    width: L(O.props.width) ? O.props.width : E.width,
                    startIndex: M,
                    endIndex: C,
                    updateId: "brush-".concat(I)
                })
            }),
            G(y, "renderReferenceElement", function(O, _, P) {
                if (!O)
                    return null;
                var S = y
                  , k = S.clipPathId
                  , E = y.state
                  , M = E.xAxisMap
                  , C = E.yAxisMap
                  , I = E.offset
                  , T = O.type.defaultProps || {}
                  , j = O.props
                  , $ = j.xAxisId
                  , R = $ === void 0 ? T.xAxisId : $
                  , B = j.yAxisId
                  , W = B === void 0 ? T.yAxisId : B;
                return N.cloneElement(O, {
                    key: O.key || "".concat(_, "-").concat(P),
                    xAxis: M[R],
                    yAxis: C[W],
                    viewBox: {
                        x: I.left,
                        y: I.top,
                        width: I.width,
                        height: I.height
                    },
                    clipPathId: k
                })
            }),
            G(y, "renderActivePoints", function(O) {
                var _ = O.item
                  , P = O.activePoint
                  , S = O.basePoint
                  , k = O.childIndex
                  , E = O.isRange
                  , M = []
                  , C = _.props.key
                  , I = _.item.type.defaultProps !== void 0 ? D(D({}, _.item.type.defaultProps), _.item.props) : _.item.props
                  , T = I.activeDot
                  , j = I.dataKey
                  , $ = D(D({
                    index: k,
                    dataKey: j,
                    cx: P.x,
                    cy: P.y,
                    r: 4,
                    fill: cl(_.item),
                    strokeWidth: 2,
                    stroke: "#fff",
                    payload: P.payload,
                    value: P.value
                }, F(T, !1)), qi(T));
                return M.push(v.renderActiveDot(T, $, "".concat(C, "-activePoint-").concat(k))),
                S ? M.push(v.renderActiveDot(T, D(D({}, $), {}, {
                    cx: S.x,
                    cy: S.y
                }), "".concat(C, "-basePoint-").concat(k))) : E && M.push(null),
                M
            }),
            G(y, "renderGraphicChild", function(O, _, P) {
                var S = y.filterFormatItem(O, _, P);
                if (!S)
                    return null;
                var k = y.getTooltipEventType()
                  , E = y.state
                  , M = E.isTooltipActive
                  , C = E.tooltipAxis
                  , I = E.activeTooltipIndex
                  , T = E.activeLabel
                  , j = y.props.children
                  , $ = Lt(j, ie)
                  , R = S.props
                  , B = R.points
                  , W = R.isRange
                  , V = R.baseLine
                  , z = S.item.type.defaultProps !== void 0 ? D(D({}, S.item.type.defaultProps), S.item.props) : S.item.props
                  , H = z.activeDot
                  , Q = z.hide
                  , ct = z.activeBar
                  , mt = z.activeShape
                  , tr = !!(!Q && M && $ && (H || ct || mt))
                  , Nt = {};
                k !== "axis" && $ && $.props.trigger === "click" ? Nt = {
                    onClick: Ti(y.handleItemMouseEnter, O.props.onClick)
                } : k !== "axis" && (Nt = {
                    onMouseLeave: Ti(y.handleItemMouseLeave, O.props.onMouseLeave),
                    onMouseEnter: Ti(y.handleItemMouseEnter, O.props.onMouseEnter)
                });
                var Te = N.cloneElement(O, D(D({}, S.props), Nt));
                function di(De) {
                    return typeof C.dataKey == "function" ? C.dataKey(De.payload) : null
                }
                if (tr)
                    if (I >= 0) {
                        var nn, er;
                        if (C.dataKey && !C.allowDuplicatedCategory) {
                            var je = typeof C.dataKey == "function" ? di : "payload.".concat(C.dataKey.toString());
                            nn = Yi(B, je, T),
                            er = W && V && Yi(V, je, T)
                        } else
                            nn = B?.[I],
                            er = W && V && V[I];
                        if (mt || ct) {
                            var rn = O.props.activeIndex !== void 0 ? O.props.activeIndex : I;
                            return [N.cloneElement(O, D(D(D({}, S.props), Nt), {}, {
                                activeIndex: rn
                            })), null, null]
                        }
                        if (!X(nn))
                            return [Te].concat(Xn(y.renderActivePoints({
                                item: S,
                                activePoint: nn,
                                basePoint: er,
                                childIndex: I,
                                isRange: W
                            })))
                    } else {
                        var nr, rr = (nr = y.getItemByXY(y.state.activeCoordinate)) !== null && nr !== void 0 ? nr : {
                            graphicalItem: Te
                        }, an = rr.graphicalItem, ir = an.item, on = ir === void 0 ? O : ir, pi = an.childIndex, Ce = D(D(D({}, S.props), Nt), {}, {
                            activeIndex: pi
                        });
                        return [N.cloneElement(on, Ce), null, null]
                    }
                return W ? [Te, null, null] : [Te, null]
            }),
            G(y, "renderCustomized", function(O, _, P) {
                return N.cloneElement(O, D(D({
                    key: "recharts-customized-".concat(P)
                }, y.props), y.state))
            }),
            G(y, "renderMap", {
                CartesianGrid: {
                    handler: Ii,
                    once: !0
                },
                ReferenceArea: {
                    handler: y.renderReferenceElement
                },
                ReferenceLine: {
                    handler: Ii
                },
                ReferenceDot: {
                    handler: y.renderReferenceElement
                },
                XAxis: {
                    handler: Ii
                },
                YAxis: {
                    handler: Ii
                },
                Brush: {
                    handler: y.renderBrush,
                    once: !0
                },
                Bar: {
                    handler: y.renderGraphicChild
                },
                Line: {
                    handler: y.renderGraphicChild
                },
                Area: {
                    handler: y.renderGraphicChild
                },
                Radar: {
                    handler: y.renderGraphicChild
                },
                RadialBar: {
                    handler: y.renderGraphicChild
                },
                Scatter: {
                    handler: y.renderGraphicChild
                },
                Pie: {
                    handler: y.renderGraphicChild
                },
                Funnel: {
                    handler: y.renderGraphicChild
                },
                Tooltip: {
                    handler: y.renderCursor,
                    once: !0
                },
                PolarGrid: {
                    handler: y.renderPolarGrid,
                    once: !0
                },
                PolarAngleAxis: {
                    handler: y.renderPolarAxis
                },
                PolarRadiusAxis: {
                    handler: y.renderPolarAxis
                },
                Customized: {
                    handler: y.renderCustomized
                }
            }),
            y.clipPathId = "".concat((x = b.id) !== null && x !== void 0 ? x : Ee("recharts"), "-clip"),
            y.throttleTriggeredAfterMouseMove = nh(y.triggeredAfterMouseMove, (w = b.throttleDelay) !== null && w !== void 0 ? w : 1e3 / 60),
            y.state = {},
            y
        }
        return mM(v, m),
        hM(v, [{
            key: "componentDidMount",
            value: function() {
                var x, w;
                this.addListener(),
                this.accessibilityManager.setDetails({
                    container: this.container,
                    offset: {
                        left: (x = this.props.margin.left) !== null && x !== void 0 ? x : 0,
                        top: (w = this.props.margin.top) !== null && w !== void 0 ? w : 0
                    },
                    coordinateList: this.state.tooltipTicks,
                    mouseHandlerCallback: this.triggeredAfterMouseMove,
                    layout: this.props.layout
                }),
                this.displayDefaultTooltip()
            }
        }, {
            key: "displayDefaultTooltip",
            value: function() {
                var x = this.props
                  , w = x.children
                  , y = x.data
                  , O = x.height
                  , _ = x.layout
                  , P = Lt(w, ie);
                if (P) {
                    var S = P.props.defaultIndex;
                    if (!(typeof S != "number" || S < 0 || S > this.state.tooltipTicks.length - 1)) {
                        var k = this.state.tooltipTicks[S] && this.state.tooltipTicks[S].value
                          , E = zs(this.state, y, S, k)
                          , M = this.state.tooltipTicks[S].coordinate
                          , C = (this.state.offset.top + O) / 2
                          , I = _ === "horizontal"
                          , T = I ? {
                            x: M,
                            y: C
                        } : {
                            y: M,
                            x: C
                        }
                          , j = this.state.formattedGraphicalItems.find(function(R) {
                            var B = R.item;
                            return B.type.name === "Scatter"
                        });
                        j && (T = D(D({}, T), j.props.points[S].tooltipPosition),
                        E = j.props.points[S].tooltipPayload);
                        var $ = {
                            activeTooltipIndex: S,
                            isTooltipActive: !0,
                            activeLabel: k,
                            activePayload: E,
                            activeCoordinate: T
                        };
                        this.setState($),
                        this.renderCursor(P),
                        this.accessibilityManager.setIndex(S)
                    }
                }
            }
        }, {
            key: "getSnapshotBeforeUpdate",
            value: function(x, w) {
                if (!this.props.accessibilityLayer)
                    return null;
                if (this.state.tooltipTicks !== w.tooltipTicks && this.accessibilityManager.setDetails({
                    coordinateList: this.state.tooltipTicks
                }),
                this.props.layout !== x.layout && this.accessibilityManager.setDetails({
                    layout: this.props.layout
                }),
                this.props.margin !== x.margin) {
                    var y, O;
                    this.accessibilityManager.setDetails({
                        offset: {
                            left: (y = this.props.margin.left) !== null && y !== void 0 ? y : 0,
                            top: (O = this.props.margin.top) !== null && O !== void 0 ? O : 0
                        }
                    })
                }
                return null
            }
        }, {
            key: "componentDidUpdate",
            value: function(x) {
                No([Lt(x.children, ie)], [Lt(this.props.children, ie)]) || this.displayDefaultTooltip()
            }
        }, {
            key: "componentWillUnmount",
            value: function() {
                this.removeListener(),
                this.throttleTriggeredAfterMouseMove.cancel()
            }
        }, {
            key: "getTooltipEventType",
            value: function() {
                var x = Lt(this.props.children, ie);
                if (x && typeof x.props.shared == "boolean") {
                    var w = x.props.shared ? "axis" : "item";
                    return s.indexOf(w) >= 0 ? w : a
                }
                return a
            }
        }, {
            key: "getMouseInfo",
            value: function(x) {
                if (!this.container)
                    return null;
                var w = this.container
                  , y = w.getBoundingClientRect()
                  , O = vO(y)
                  , _ = {
                    chartX: Math.round(x.pageX - O.left),
                    chartY: Math.round(x.pageY - O.top)
                }
                  , P = y.width / w.offsetWidth || 1
                  , S = this.inRange(_.chartX, _.chartY, P);
                if (!S)
                    return null;
                var k = this.state
                  , E = k.xAxisMap
                  , M = k.yAxisMap
                  , C = this.getTooltipEventType()
                  , I = Zf(this.state, this.props.data, this.props.layout, S);
                if (C !== "axis" && E && M) {
                    var T = ge(E).scale
                      , j = ge(M).scale
                      , $ = T && T.invert ? T.invert(_.chartX) : null
                      , R = j && j.invert ? j.invert(_.chartY) : null;
                    return D(D({}, _), {}, {
                        xValue: $,
                        yValue: R
                    }, I)
                }
                return I ? D(D({}, _), I) : null
            }
        }, {
            key: "inRange",
            value: function(x, w) {
                var y = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1
                  , O = this.props.layout
                  , _ = x / y
                  , P = w / y;
                if (O === "horizontal" || O === "vertical") {
                    var S = this.state.offset
                      , k = _ >= S.left && _ <= S.left + S.width && P >= S.top && P <= S.top + S.height;
                    return k ? {
                        x: _,
                        y: P
                    } : null
                }
                var E = this.state
                  , M = E.angleAxisMap
                  , C = E.radiusAxisMap;
                if (M && C) {
                    var I = ge(M);
                    return Bu({
                        x: _,
                        y: P
                    }, I)
                }
                return null
            }
        }, {
            key: "parseEventsOfWrapper",
            value: function() {
                var x = this.props.children
                  , w = this.getTooltipEventType()
                  , y = Lt(x, ie)
                  , O = {};
                y && w === "axis" && (y.props.trigger === "click" ? O = {
                    onClick: this.handleClick
                } : O = {
                    onMouseEnter: this.handleMouseEnter,
                    onDoubleClick: this.handleDoubleClick,
                    onMouseMove: this.handleMouseMove,
                    onMouseLeave: this.handleMouseLeave,
                    onTouchMove: this.handleTouchMove,
                    onTouchStart: this.handleTouchStart,
                    onTouchEnd: this.handleTouchEnd,
                    onContextMenu: this.handleContextMenu
                });
                var _ = qi(this.props, this.handleOuterEvent);
                return D(D({}, _), O)
            }
        }, {
            key: "addListener",
            value: function() {
                Ao.on(So, this.handleReceiveSyncEvent)
            }
        }, {
            key: "removeListener",
            value: function() {
                Ao.removeListener(So, this.handleReceiveSyncEvent)
            }
        }, {
            key: "filterFormatItem",
            value: function(x, w, y) {
                for (var O = this.state.formattedGraphicalItems, _ = 0, P = O.length; _ < P; _++) {
                    var S = O[_];
                    if (S.item === x || S.props.key === x.key || w === ue(S.item.type) && y === S.childIndex)
                        return S
                }
                return null
            }
        }, {
            key: "renderClipPath",
            value: function() {
                var x = this.clipPathId
                  , w = this.state.offset
                  , y = w.left
                  , O = w.top
                  , _ = w.height
                  , P = w.width;
                return A.createElement("defs", null, A.createElement("clipPath", {
                    id: x
                }, A.createElement("rect", {
                    x: y,
                    y: O,
                    height: _,
                    width: P
                })))
            }
        }, {
            key: "getXScales",
            value: function() {
                var x = this.state.xAxisMap;
                return x ? Object.entries(x).reduce(function(w, y) {
                    var O = Uf(y, 2)
                      , _ = O[0]
                      , P = O[1];
                    return D(D({}, w), {}, G({}, _, P.scale))
                }, {}) : null
            }
        }, {
            key: "getYScales",
            value: function() {
                var x = this.state.yAxisMap;
                return x ? Object.entries(x).reduce(function(w, y) {
                    var O = Uf(y, 2)
                      , _ = O[0]
                      , P = O[1];
                    return D(D({}, w), {}, G({}, _, P.scale))
                }, {}) : null
            }
        }, {
            key: "getXScaleByAxisId",
            value: function(x) {
                var w;
                return (w = this.state.xAxisMap) === null || w === void 0 || (w = w[x]) === null || w === void 0 ? void 0 : w.scale
            }
        }, {
            key: "getYScaleByAxisId",
            value: function(x) {
                var w;
                return (w = this.state.yAxisMap) === null || w === void 0 || (w = w[x]) === null || w === void 0 ? void 0 : w.scale
            }
        }, {
            key: "getItemByXY",
            value: function(x) {
                var w = this.state
                  , y = w.formattedGraphicalItems
                  , O = w.activeItem;
                if (y && y.length)
                    for (var _ = 0, P = y.length; _ < P; _++) {
                        var S = y[_]
                          , k = S.props
                          , E = S.item
                          , M = E.type.defaultProps !== void 0 ? D(D({}, E.type.defaultProps), E.props) : E.props
                          , C = ue(E.type);
                        if (C === "Bar") {
                            var I = (k.data || []).find(function(R) {
                                return hP(x, R)
                            });
                            if (I)
                                return {
                                    graphicalItem: S,
                                    payload: I
                                }
                        } else if (C === "RadialBar") {
                            var T = (k.data || []).find(function(R) {
                                return Bu(x, R)
                            });
                            if (T)
                                return {
                                    graphicalItem: S,
                                    payload: T
                                }
                        } else if (Xa(S, O) || Ga(S, O) || ti(S, O)) {
                            var j = _A({
                                graphicalItem: S,
                                activeTooltipItem: O,
                                itemData: M.data
                            })
                              , $ = M.activeIndex === void 0 ? j : M.activeIndex;
                            return {
                                graphicalItem: D(D({}, S), {}, {
                                    childIndex: $
                                }),
                                payload: ti(S, O) ? M.data[j] : S.props.data[j]
                            }
                        }
                    }
                return null
            }
        }, {
            key: "render",
            value: function() {
                var x = this;
                if (!Yc(this))
                    return null;
                var w = this.props
                  , y = w.children
                  , O = w.className
                  , _ = w.width
                  , P = w.height
                  , S = w.style
                  , k = w.compact
                  , E = w.title
                  , M = w.desc
                  , C = Yf(w, aM)
                  , I = F(C, !1);
                if (k)
                    return A.createElement(Sf, {
                        state: this.state,
                        width: this.props.width,
                        height: this.props.height,
                        clipPathId: this.clipPathId
                    }, A.createElement(Fo, gn({}, I, {
                        width: _,
                        height: P,
                        title: E,
                        desc: M
                    }), this.renderClipPath(), Zc(y, this.renderMap)));
                if (this.props.accessibilityLayer) {
                    var T, j;
                    I.tabIndex = (T = this.props.tabIndex) !== null && T !== void 0 ? T : 0,
                    I.role = (j = this.props.role) !== null && j !== void 0 ? j : "application",
                    I.onKeyDown = function(R) {
                        x.accessibilityManager.keyboardEvent(R)
                    }
                    ,
                    I.onFocus = function() {
                        x.accessibilityManager.focus()
                    }
                }
                var $ = this.parseEventsOfWrapper();
                return A.createElement(Sf, {
                    state: this.state,
                    width: this.props.width,
                    height: this.props.height,
                    clipPathId: this.clipPathId
                }, A.createElement("div", gn({
                    className: U("recharts-wrapper", O),
                    style: D({
                        position: "relative",
                        cursor: "default",
                        width: _,
                        height: P
                    }, S)
                }, $, {
                    ref: function(B) {
                        x.container = B
                    }
                }), A.createElement(Fo, gn({}, I, {
                    width: _,
                    height: P,
                    title: E,
                    desc: M,
                    style: wM
                }), this.renderClipPath(), Zc(y, this.renderMap)), this.renderLegend(), this.renderTooltip()))
            }
        }])
    }(N.Component);
    G(p, "displayName", n),
    G(p, "defaultProps", D({
        layout: "horizontal",
        stackOffset: "none",
        barCategoryGap: "10%",
        barGap: 4,
        margin: {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
        },
        reverseStackOrder: !1,
        syncMethod: "index"
    }, f)),
    G(p, "getDerivedStateFromProps", function(m, v) {
        var b = m.dataKey
          , x = m.data
          , w = m.children
          , y = m.width
          , O = m.height
          , _ = m.layout
          , P = m.stackOffset
          , S = m.margin
          , k = v.dataStartIndex
          , E = v.dataEndIndex;
        if (v.updateId === void 0) {
            var M = Jf(m);
            return D(D(D({}, M), {}, {
                updateId: 0
            }, d(D(D({
                props: m
            }, M), {}, {
                updateId: 0
            }), v)), {}, {
                prevDataKey: b,
                prevData: x,
                prevWidth: y,
                prevHeight: O,
                prevLayout: _,
                prevStackOffset: P,
                prevMargin: S,
                prevChildren: w
            })
        }
        if (b !== v.prevDataKey || x !== v.prevData || y !== v.prevWidth || O !== v.prevHeight || _ !== v.prevLayout || P !== v.prevStackOffset || !yn(S, v.prevMargin)) {
            var C = Jf(m)
              , I = {
                chartX: v.chartX,
                chartY: v.chartY,
                isTooltipActive: v.isTooltipActive
            }
              , T = D(D({}, Zf(v, x, _)), {}, {
                updateId: v.updateId + 1
            })
              , j = D(D(D({}, C), I), T);
            return D(D(D({}, j), d(D({
                props: m
            }, j), v)), {}, {
                prevDataKey: b,
                prevData: x,
                prevWidth: y,
                prevHeight: O,
                prevLayout: _,
                prevStackOffset: P,
                prevMargin: S,
                prevChildren: w
            })
        }
        if (!No(w, v.prevChildren)) {
            var $, R, B, W, V = Lt(w, Dn), z = V && ($ = (R = V.props) === null || R === void 0 ? void 0 : R.startIndex) !== null && $ !== void 0 ? $ : k, H = V && (B = (W = V.props) === null || W === void 0 ? void 0 : W.endIndex) !== null && B !== void 0 ? B : E, Q = z !== k || H !== E, ct = !X(x), mt = ct && !Q ? v.updateId : v.updateId + 1;
            return D(D({
                updateId: mt
            }, d(D(D({
                props: m
            }, v), {}, {
                updateId: mt,
                dataStartIndex: z,
                dataEndIndex: H
            }), v)), {}, {
                prevChildren: w,
                dataStartIndex: z,
                dataEndIndex: H
            })
        }
        return null
    }),
    G(p, "renderActiveDot", function(m, v, b) {
        var x;
        return N.isValidElement(m) ? x = N.cloneElement(m, v) : K(m) ? x = m(v) : x = A.createElement(fi, v),
        A.createElement(q, {
            className: "recharts-active-dot",
            key: b
        }, x)
    });
    var g = N.forwardRef(function(v, b) {
        return A.createElement(p, gn({}, v, {
            ref: b
        }))
    });
    return g.displayName = p.displayName,
    g
}
  , BM = hi({
    chartName: "LineChart",
    GraphicalChild: to,
    axisComponents: [{
        axisType: "xAxis",
        AxisComp: Jn
    }, {
        axisType: "yAxis",
        AxisComp: Qn
    }],
    formatAxisMap: Ya
})
  , NM = hi({
    chartName: "BarChart",
    GraphicalChild: qn,
    defaultTooltipEventType: "axis",
    validateTooltipEventTypes: ["axis", "item"],
    axisComponents: [{
        axisType: "xAxis",
        AxisComp: Jn
    }, {
        axisType: "yAxis",
        AxisComp: Qn
    }],
    formatAxisMap: Ya
})
  , zM = hi({
    chartName: "PieChart",
    GraphicalChild: Me,
    validateTooltipEventTypes: ["item"],
    defaultTooltipEventType: "item",
    legendContent: "children",
    axisComponents: [{
        axisType: "angleAxis",
        AxisComp: Ka
    }, {
        axisType: "radiusAxis",
        AxisComp: Va
    }],
    formatAxisMap: c_,
    defaultProps: {
        layout: "centric",
        startAngle: 0,
        endAngle: 360,
        cx: "50%",
        cy: "50%",
        innerRadius: 0,
        outerRadius: "80%"
    }
})
  , FM = hi({
    chartName: "ScatterChart",
    GraphicalChild: no,
    defaultTooltipEventType: "item",
    validateTooltipEventTypes: ["item"],
    axisComponents: [{
        axisType: "xAxis",
        AxisComp: Jn
    }, {
        axisType: "yAxis",
        AxisComp: Qn
    }, {
        axisType: "zAxis",
        AxisComp: eo
    }],
    formatAxisMap: Ya
})
  , WM = hi({
    chartName: "AreaChart",
    GraphicalChild: en,
    axisComponents: [{
        axisType: "xAxis",
        AxisComp: Jn
    }, {
        axisType: "yAxis",
        AxisComp: Qn
    }],
    formatAxisMap: Ya
});
export {WM as A, Ch as B, Jh as C, fi as D, xt as L, $h as P, RM as R, pp as S, ie as T, Jn as X, Qn as Y, eo as Z, Ck as a, vn as b, en as c, to as d, NM as e, qn as f, zM as g, Me as h, BM as i, FM as j, no as k, Qh as l, gd as m, LM as n, bd as p};
