window.onload = function(){
	const shader = {
		vertex: `    
		#ifdef GL_ES
		precision mediump float;
		#endif
		
		// those are the mandatory attributes that the lib sets
		attribute vec3 aVertexPosition;
		attribute vec2 aTextureCoord;
		
		// those are mandatory uniforms that the lib sets and that contain our model view and projection matrix
		uniform mat4 uMVMatrix;
		uniform mat4 uPMatrix;
		
		uniform mat4 dispImageMatrix;
		
		// if you want to pass your vertex and texture coords to the fragment shader
		varying vec3 vVertexPosition;
		varying vec2 vTextureCoord;
		
		void main() {
        vec3 vertexPosition = aVertexPosition;
        gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
		
        // set the varyings
        vTextureCoord = (dispImageMatrix * vec4(aTextureCoord, 0., 1.)).xy;
        vVertexPosition = vertexPosition;
		}`,
		fragment: `
		#ifdef GL_ES
		precision mediump float;
		#endif
		
		#extension GL_OES_standard_derivatives : enable
		#define PI2 6.28318530718
		#define PI 3.14159265359
		#define TWO_PI 6.28318530718 
		#define S(a,b,n) smoothstep(a,b,n)
		
		// get our varyings
		varying vec3 vVertexPosition;
		varying vec2 vTextureCoord;
		
		// the uniform we declared inside our javascript
		uniform float uTime;
		uniform vec2 uReso;
		
		// our texture sampler (default name, to use a different name please refer to the documentation)
		uniform sampler2D dispImage;
		uniform sampler2D blurImage;
		
		// Noise
		float N12(vec2 p){
		p = fract(p * vec2(123.34, 345.45));
		p += dot(p, p + 34.345);
		
		return fract(p.x * p.y);
		}
		
		vec3 Layer(vec2 uv0, float t){
		
		vec2 asp = vec2(2., 1.);
		
		vec2 uv1 = uv0 * 3. * asp;
		
		uv1.y += t * .25;
		
		vec2 gv = fract(uv1) - .5;
		vec2 id = floor(uv1);
		
		float n = N12(id);
		
		t+= n * PI2;
		
		float w = uv0.y * 10.;
		float x = (n - .5) * .8;
		x += (.4 - abs(x)) * sin(3. * w) * pow(sin(w), 6.) * .45;
		float y = -sin(t + sin(t + sin(t) * .5)) * (.5 - .06);
		y -= (gv.x - x) * (gv.x - x); // sesgar;
		
		vec2 dropPos = (gv - vec2(x, y)) / asp; 
		float drop = S(.03, .02, length(dropPos));
		
		vec2 trailPos = (gv - vec2(x, t * .25)) / asp; 
		trailPos.y = (fract(trailPos.y * 8.) - .5) / 8.;
		float trail = S(.02, .015, length(trailPos));
		
		float fogTrail = S(-.05, .05, dropPos.y);
		
		fogTrail *= S(.5, y, gv.y);
		trail *= fogTrail;
		fogTrail *= S(.03, .015, abs(dropPos.x));
		
		vec2 off = drop * dropPos + trail * trailPos;
		
		return vec3(off, fogTrail);
		}
		
		void main() {      
		float dist = 5.;
		float blurSize = 5.;
		float t = mod(uTime * .03, 7200.);
		
		vec4 c = vec4(0);
		vec2 uv = vTextureCoord;    
		
		vec3 drops = Layer(uv, t);
		drops += Layer(uv * 1.25 + 7.54, t);
		drops += Layer(uv * 1.35 + 1.54, t);
		drops += Layer(uv * 1.57 - 7.54, t);
		
		float blur = blurSize * 7. * (1. - drops.z);
		
		vec4 col = vec4(0.);
		int numSamples = 32;
		float a = N12(uv) * PI2;
		
		blur *= .0005;
		uv += drops.xy * dist;
		
		for(int n = 0; n < 32; n++){
		vec2 off = vec2(sin(a), cos(a)) * blur;
		float d = fract(sin((float(n) + 1.) * 546.) * 5424.);
		d = sqrt(d);         
		off *= d;
		col += texture2D(dispImage, uv + off);
		a++;
		}
		
		col /= float(numSamples);
		
		gl_FragColor = col;
		}
		`
	};
	
	// get our canvas wrapper
	const canvasContainer = document.getElementById("canvas");
	// set up our WebGL context and append the canvas to our wrapper
	const webGLCurtain = new Curtains("canvas");
	
	// get our plane element
	const planeElement = document.getElementsByClassName("plane")[0];
	
	// set our initial parameters (basic uniforms)
	const params = {
		vertexShader: shader.vertex, // our vertex shader ID
		fragmentShader: shader.fragment, // our framgent shader ID
		alwaysDraw: true, //Р РёСЃРѕРІР°С‚СЊ РІСЃРµРіРґР°, Р° РЅРµ С‚РѕР»СЊРєРѕ РІ РІРёРґРёРјРѕР№ РѕР±Р»Р°СЃС‚Рё.
		widthSegments: 40,
		heightSegments: 40, // we now have 40*40*6 = 9600 vertices !
		uniforms: {
			time: {
				name: "uTime", // uniform name that will be passed to our shaders
				type: "1f", // this means our uniform is a float
				value: 0
			},
			resolution: {
				name: "uReso",
				type: "2f",
				value: [innerWidth, innerHeight]
			}
		}
	};
	
	// create our plane mesh
	const plane = webGLCurtain.addPlane(planeElement, params);
	
	// use the onRender method of our plane fired at each requestAnimationFrame call
	plane.onRender(() => {
		plane.uniforms.time.value++; // update our time uniform value
		
		plane.uniforms.resolution.value = [innerWidth, innerHeight];
	});
};