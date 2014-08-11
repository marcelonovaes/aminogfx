exports.sgtest = require('./aminonative.node');
var input = require('aminoinput');
var prims = require('./primitives');

var OS = "BROWSER";
if((typeof process) != 'undefined') {
    OS = "KLAATU";
    if(process.arch == 'arm') {
        OS = "RPI";
    }
    if(process.platform == "darwin") {
        OS = "MAC";
    }
}

input.OS = OS;
input.initOS();

var debug = {
    eventCount:0,
}
function d(str) {
    console.log("AMINO: ",str);
}
d("OS is " + OS)
var fontmap = {};
var defaultFonts = {
    'source': {
        weights: {
            200: {
                normal: "SourceSansPro-ExtraLight.ttf",
                italic: "SourceSansPro-ExtraLightItalic.ttf",
            },
            300: {
                normal: "SourceSansPro-Light.ttf",
                italic: "SourceSansPro-LightItalic.ttf",
            },
            400: {
                normal: "SourceSansPro-Regular.ttf",
                italic: "SourceSansPro-Italic.ttf",
            },

            600: {
                normal: "SourceSansPro-Semibold.ttf",
                italic: "SourceSansPro-SemiboldItalic.ttf",
            },
            700: {
                normal: "SourceSansPro-Bold.ttf",
                italic: "SourceSansPro-BoldItalic.ttf",
            },
            900: {
                normal: "SourceSansPro-Black.ttf",
                italic: "SourceSansPro-BlackItalic.ttf",
            },
        }
    },
    'awesome': {
        weights: {
            400: {
                normal: "fontawesome-webfont.ttf",
            },
        }
    },
}
var validFontSizes = {10:10,15:15,20:20,30:30,40:40,80:80};

function validateFontSize(fs) {
    if(validFontSizes[fs] == undefined) {
        console.log("WARNING.  invalid font size: " + fs);
        return 15;
    }
    return fs;
}

var propertyCount = 0;

exports.registerFont = function(name, font) {
    fontmap[name] = new JSFont(font);
}


var ou = {
    makeProps: function(obj,props) {
        for(var name in props) {
            this.makeProp(obj,name,props[name]);
        }
    },
    makeProp:function (obj,name,val) {
        obj[name] = function(v) {
            if(v != undefined) {
                return obj[name].set(v);
            } else {
                return obj[name].get();
            }
        }
        obj[name].listeners = [];
        obj[name].value = val;
        obj[name].set = function(v) {
            this.value = v;
            for(var i=0; i<this.listeners.length; i++) {
                this.listeners[i](this.value,this,obj);
            }
            return obj;
        }
        obj[name].get = function(v) {
            return this.value;
        }
        obj[name].watch = function(fun) {
            this.listeners.push(function(v,v2,v3) {
                fun(v,v2,v3);
            });
            return this;
        }
        obj[name].anim = function() {
            return new PropAnim(obj,name);
        }
        obj[name].bindto = function(prop, fun) {
            var set = this;
            prop.listeners.push(function(v) {
                if(fun) set(fun(v));
                    else set(v);
            });
            return this;
        }
    }
}

exports.makeProps = ou.makeProps;
exports.makeProp = ou.makeProp;

function JSFont(desc) {
    var reg = desc.weights[400];
    this.desc = desc;
    this.weights = {};

    var dir = process.cwd();
    process.chdir(__dirname); // chdir such that fonts (and internal shaders) may be found
    var aminodir = process.cwd();
    for(var weight in desc.weights) {
        this.weights[weight] = exports.native.createNativeFont(aminodir+"/fonts/"+desc.weights[weight].normal);
    }
    process.chdir(dir);

    this.getNative = function(size, weight, style) {
        if(this.weights[weight] != undefined) {
            return this.weights[weight];
        }
        console.log("ERROR. COULDN'T find the native for " + size + " " + weight + " " + style);
        return this.weights[400];
    }
}

exports.native = {
    createNativeFont: function(path) {
        //console.log('creating native font ' + path);
        return exports.sgtest.createNativeFont(path);
    },
    init: function(core) {
        console.log("doing native init. dpi scale = " + Core.DPIScale);
        exports.sgtest.init();
    },
    createWindow: function(core,w,h) {
        exports.sgtest.createWindow(w* Core.DPIScale,h*Core.DPIScale);
        fontmap['source']  = new JSFont(defaultFonts['source']);
        fontmap['awesome'] = new JSFont(defaultFonts['awesome']);
        core.defaultFont = fontmap['source'];
        this.rootWrapper = exports.native.createGroup();
        exports.native.updateProperty(this.rootWrapper, "scalex", Core.DPIScale);
        exports.native.updateProperty(this.rootWrapper, "scaley", Core.DPIScale);
        exports.sgtest.setRoot(this.rootWrapper);
    },
    getFont: function(name) {
        return fontmap[name];
    },
    updateProperty: function(handle, name, value) {
        propertyCount++;
        exports.sgtest.updateProperty(handle, propsHash[name], value);
    },
    setRoot: function(handle) {
        exports.sgtest.addNodeToGroup(handle,this.rootWrapper);
    },
    tick: function() {
        exports.sgtest.tick();
    },
    setImmediate: function(loop) {
        setImmediate(loop);
    },
    setEventCallback: function(cb) {
        exports.sgtest.setEventCallback(cb);
    },
    createRect: function()  {          return exports.sgtest.createRect();    },
    createGroup: function() {          return exports.sgtest.createGroup();   },
    createPoly: function()  {          return exports.sgtest.createPoly();    },
    createGLNode: function(cb)  {        return exports.sgtest.createGLNode(cb);  },
    addNodeToGroup: function(h1,h2) {
        exports.sgtest.addNodeToGroup(h1,h2);
    },
    removeNodeFromGroup: function(h1, h2) {
        exports.sgtest.removeNodeFromGroup(h1, h2);
    },
    loadPngToTexture: function(imagefile,cb) {
        var img = exports.sgtest.loadPngToTexture(imagefile);
        cb(img);
    },
    loadJpegToTexture: function(imagefile, cb) {
        var img = exports.sgtest.loadJpegToTexture(imagefile);
        cb(img);
    },
    createText: function() {
        return exports.sgtest.createText();
    },
    setWindowSize: function(w,h) {
        exports.sgtest.setWindowSize(w*Core.DPIScale,h*Core.DPIScale);
    },
    getWindowSize: function(w,h) {
        var size = exports.sgtest.getWindowSize(w,h);
        return {
            w: size.w/Core.DPIScale,
            h: size.h/Core.DPIScale,
        };
    },
    createAnim: function(handle,prop,start,end,dur,count,rev) {
        return exports.sgtest.createAnim(handle,propsHash[prop],start,end,dur,count,rev);
    },
    updateAnimProperty: function(handle, prop, type) {
        exports.sgtest.updateAnimProperty(handle, propsHash[prop], type);
    },

    createPropAnim: function(node,prop,start,end,dur) {
        return new SGAnim(node,prop,start,end,dur);
    },

    runTest: function(opts) {
        return exports.sgtest.runTest(opts);
    },

}



//String extension
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}


exports.dirtylist = [];
function validateScene() {
    exports.dirtylist.forEach(function(node) {
        if(node.dirty == true) {
            if(node.validate) {
                node.validate();
            }
            node.dirty = false;
        }
    });
    exports.dirtylist = [];
}
input.validateScene = validateScene;


var propsHash = {

    //general
    "visible":18,
    "opacity":27,
    "r":5,
    "g":6,
    "b":7,
    "texid":8,
    "w":10,
    "h":11,
    "x":21,
    "y":22,

    //transforms
    "tx":23,
    "ty":1,
    "scalex":2,
    "scaley":3,
    "rotateZ":4,
    "rotateX":19,
    "rotateY":20,

    //text
    "text":9,
    "fontSize":12,
    "fontId":28,

    //animation
    "count":29,
    "lerplinear":13,
    "lerpcubicin":14,
    "lerpcubicout":15,
    "lerpprop":16,
    "lerpcubicinout":17,
    "autoreverse":35,


    //geometry
    "geometry":24,
    "filled":25,
    "closed":26,
    "dimension": 36,

    //rectangle texture
    "textureLeft":  30,
    "textureRight": 31,
    "textureTop":   32,
    "textureBottom":33,

    //clipping
    "cliprect": 34,


}


/** @class Stage
@desc A stage represents a window. On mobile devices there will only be one stage. On desktop there can be multiple. A stage
can only be created by using the core.createStage() function.
*/
function SGStage(core) {
	this.core = core;
	/** @func setSize(w,h) set the width and height of the stage. Has no effect on mobile. */
	this.setSize = function(width,height) {
	    exports.native.setWindowSize(width,height);
	}
	/** @func getW returns the width of this stage. */
	this.getW = function() {
	    return exports.native.getWindowSize().w;
	}
	/** @func getH returns the height of this stage. */
	this.getH = function() {
	    return exports.native.getWindowSize().h;
	}
	/** @func on(name,node,cb) sets a callback for events matching the specified name on the
	specified node. Use null for the node to match global events. */
	this.on = function(name, node, cb) {
		this.core.on(name, node, cb);
	}
	/** @func getRoot returns the root node of this stage. */
	this.getRoot = function() {
		return this.core.root;
	}
	/** @func set the root node of this stage. */
	this.setRoot = function(root) {
		this.core.setRoot(root);
		return this;
	}
	/** @func find(id) searches the stage's node tree for a node with the requested ID. Returns null if no node is found. */
    this.find = function(id) {
        return this.findNodeById_helper(id,this.getRoot());
    }
    this.findNodeById_helper = function(id, node) {
        if(node.id && node.id == id) return node;
        if(node.isParent && node.isParent()) {
            for(var i=0; i<node.getChildCount(); i++) {
                var ret = this.findNodeById_helper(id,node.getChild(i));
                if(ret != null) return ret;
            }
        }
        return null;
    }

    var self = this;
    this.core.on('windowsize',this,function(e) {
        var root = self.getRoot();
        if(root.setW) root.setW(self.getW());
        if(root.setH) root.setH(self.getH());
    });
}


/**
@class Core
@desc The core of Amino. Only one will exist at runtime. Always access through the callback
*/
function Core() {
    this.anims = [];
    /** @func createPropAnim(node, propertyName, startValue, endValue, duration, count, autoreverse)
    creates a new property animation. Node is the node to be animated. propertyName is the string name of the property
    to animate. This should be a numeric property like tx or scalex. start and end are the starting and ending values
    of the animation. Duration is the length of the animation in milliseconds. 1000 = one second. Count is
    how many times the animation should loop. Use -1 to loop forever. Autoreverse determines if the animation should
    alternate direction on every other time. Only applies if the animatione will play more than one time.
    */
    this.createPropAnim = function(node, prop, start, end, dur) {
        var anim = exports.native.createPropAnim(node,prop,start,end,dur);
        anim.init(this);
        this.anims.push(anim);
        return anim;
    }
    var self = this;
    //TODO: actually clean out dead animations when they end
    this.notifyAnimEnd = function(e) {
        var found = -1;
        for(var i=0; i<self.anims.length; i++) {
            var anim = self.anims[i];
            if(anim.handle == e.id) {
                found = i;
                anim.finish();
            }
        }
    }

    var self = this;
    this.init = function() {
        exports.native.init(this);
        exports.native.setEventCallback(function(e) {
            debug.eventCount++;
            e.time = new Date().getTime();
            if(e.x) e.x = e.x/Core.DPIScale;
            if(e.y) e.y = e.y/Core.DPIScale;
            if(e.type == "windowsize") {
                e.width = e.width/Core.DPIScale;
                e.height = e.height/Core.DPIScale;
            }
            input.processEvent(self,e);
        });
    }

    this.root = null;
    this.start = function() {
        var core = this;
        //send a final window size event to make sure everything is lined up correctly
        var size = exports.native.getWindowSize();
        this.stage.width = size.w;
        this.stage.height = size.h;
        input.processEvent(this,{
            type:"windowsize",
            width:size.w,
            height:size.h,
        });
        if(!this.root) {
            throw new Error("ERROR. No root set on stage");
        }

        var self = this;
        function immediateLoop() {
            try {
                exports.native.tick(core);
                if(settimer) {
                    console.timeEnd('start');
                    settimer = false;
                }
                if(propertyCount > 0) {
                    //console.log("propcount = " + propertyCount);
                }
                propertyCount = 0;
            } catch (ex) {
                console.log(ex);
                console.log(ex.stack);
                console.log("EXCEPTION. QUITTING!");
                return;
            }
            exports.native.setImmediate(immediateLoop);
        }
        setTimeout(immediateLoop,1);
    }

    /** @func createStage(w,h)  creates a new stage. Only applies on desktop. */
    this.createStage = function(w,h) {
        exports.native.createWindow(this,w,h);
        this.stage = new SGStage(this);
        return this.stage;
    }

    this.getFont = function(name) {
        return exports.native.getFont(name);
    }

    this.setRoot = function(node) {
        exports.native.setRoot(node.handle);
        this.root = node;
    }
    this.findNodeAtXY = function(x,y) {
        //var t1 = process.hrtime();
        var node = this.findNodeAtXY_helper(this.root,x,y,"");
        //console.log('search time',process.hrtime(t1)[1]/1e6);
        return node;
    }
    this.findNodeAtXY_helper = function(root,x,y,tab) {
        if(!root) return null;
        //console.log(tab +
        //    (root.getId?root.getId():"-") + " " + root.getTx() + " " + root.getTy() + " "
        //    + (root.getW?root.getW():"-") + " x " + (root.getH?root.getH():"-"));
        if(!root.getVisible()) return null;

        var tx = x-root.getTx();
        var ty = y-root.getTy();
        tx = tx/root.getScalex();
        ty = ty/root.getScaley();
        //console.log(tab + "   xy="+tx+","+ty);
        if(root.children) {
            //console.log(tab+"children = ",root.children.length);
            for(var i=root.children.length-1; i>=0; i--) {
                var node = root.children[i];
                var found = this.findNodeAtXY_helper(node,tx,ty,tab+"  ");
                if(found) {
                	return found;
            	}
            }
        }
        //console.log(tab+"contains " + tx+' '+ty);
        if(root.contains && root.contains(tx,ty)) {
            //console.log(tab,"inside!",root.getId());
           return root;
        }
        return null;
    }
    function calcGlobalToLocalTransform(node) {
        if(node.parent) {
            var trans = calcGlobalToLocalTransform(node.parent);
            if(node.getScalex() != 1) {
                trans.x / node.getScalex();
                trans.y / node.getScaley();
            }
            trans.x -= node.getTx();
            trans.y -= node.getTy();
            return trans;
        }
        return {x:-node.getTx(),y:-node.getTy()};
    }
    this.globalToLocal = function(pt, node) {
        return this.globalToLocal_helper(pt,node);
    }

    this.globalToLocal_helper = function(pt, node) {
    	if(node.parent) {
    		pt =  this.globalToLocal_helper(pt,node.parent);
    	}
        return {
            x: (pt.x - node.getTx())/node.getScalex(),
            y: (pt.y - node.getTy())/node.getScaley(),
        }
    }
    this.localToGlobal = function(pt, node) {
        pt = {
            x: pt.x + node.getTx(),
            y: pt.y + node.getTy(),
        };
        if(node.parent) {
            return this.localToGlobal(pt,node.parent);
        } else {
            return pt;
        }
    }
    this.listeners = {};
    this.on = function(name, target, listener) {
        name = name.toLowerCase();
        if(target == null) {
            target = this;
        }
        if(!this.listeners[name]) {
            this.listeners[name] = [];
        }
        this.listeners[name].push({
                target:target,
                func:listener
        });
    }
    this.fireEventAtTarget= function(target, event) {
        //        console.log("firing an event at target:",event.type);
        if(!event.type) { console.log("WARNING. Event has no type!"); }
        if(this.listeners[event.type]) {
            this.listeners[event.type].forEach(function(l) {
                    if(l.target == target) {
                        l.func(event);
                    }
            });
        }
    }
    this.fireEvent = function(event) {
        if(!event.type) { console.log("WARNING. Event has no type!"); }

       // var t1 = process.hrtime();
        if(this.listeners[event.type]) {
            var arr = this.listeners[event.type];
            var len = arr.length;
            for(var i=0; i<len; i++) {
                var listener = arr[i];
                if(listener.target == event.source) {
                    listener.func(event);
                }
            }
        }
        if(event.type == "validate") {
            //console.log('validate time = ',process.hrtime(t1)[1]/1e6);
        }
    };

    this.requestFocus = function(target) {
        if(this.keyfocus) {
            this.fireEventAtTarget(this.keyfocus,{type:"focusloss",target:this.keyfocus});
        }
        this.keyfocus = target;
        if(this.keyfocus) {
            this.fireEventAtTarget(this.keyfocus,{type:"focusgain",target:this.keyfocus});
        }
    }

    this.runTest = function(opts) {
        console.log("running the test with options",opts);
        return exports.native.runTest(opts);
    }
}

var settimer = false;
exports.startTime = function() {
    console.time('start');
    settimer = true;
}

Core.DPIScale = 1.0;
function start(cb) {
    Core._core = new Core();
    Core._core.init();
    var stage = Core._core.createStage(600,600);
    cb(Core._core,stage);
    Core._core.start();
}

exports.getCore = function() {
    return Core._core;
}
exports.start = start;

exports.startTest = function(cb) {
    Core._core = new Core();
    Core._core.init();
    var stage = Core._core.createStage(600,600);
    var root = new exports.ProtoGroup();
    stage.setRoot(root);
    cb(Core._core, root);
}

exports.setHiDPIScale = function(scale) {
    Core.DPIScale = scale;
}


exports.Group = prims.Group;
exports.Rect = prims.Rect;
exports.Text = prims.Text;
exports.Polygon = prims.Polygon;
exports.ImageView = prims.ImageView;


var remap = {
    'x':'tx',
    'rx':'rotateX',
    'ry':'rotateY',
};

function PropAnim(target,name) {
    this._from = null;
    this._to = null;
    this._duration = 1000;
    this._loop = 1;
    this._delay = 0;
    if(remap[name]) {
        name = remap[name];
    }
    this._then_fun = null;

    this.from = function(val) {  this._from = val;        return this;  }
    this.to   = function(val) {  this._to = val;          return this;  }
    this.dur  = function(val) {  this._duration = val;    return this;  }
    this.delay= function(val) {  this._delay = val;       return this;  }
    this.loop = function(val) {  this._loop = val;        return this;  }
    this.then = function(fun) {  this._then_fun = fun;    return this;  }

    this.start = function() {
        var self = this;
        setTimeout(function(){
            self.handle = exports.native.createAnim(
                target.handle,
                name,
                self._from,self._to,self._duration);
            exports.native.updateAnimProperty(self.handle, 'count', self._loop);
            exports.native.updateAnimProperty(self.handle, 'lerpprop', 17); //17 is cubic in out
            exports.getCore().anims.push(self);
        },this._delay);
        return this;
    }

    this.finish = function() {
        if(this._then_fun != null) {
            this._then_fun();
        }
    }


}