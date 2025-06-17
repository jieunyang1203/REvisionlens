// Import THREE.js modules
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize GSAP
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    
    // Eye model variables with deformation support
    let eyeScene, eyeCamera, eyeRenderer, eyeModel, eyeControls;
    let eyeContainer = document.getElementById('eye-model-container');
    let eyeMesh, originalVertices;
    let deformationStrength = 0;
    let deformationPoint = new THREE.Vector3();
    let isClicking = false;
    let rotationVelocity = 0;
    let previousRotationY = 0;
    let globalElasticStrength = 0;
    
    // Variables for feature expansion
    let expandedFeature = null;
    
    // Play video
    const video = document.getElementById('intro-video');
    video.play().catch(e => console.log("Video autoplay prevented:", e));
    
    // Initialize ScrollSmoother
    const smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.5,
        effects: true,
        normalizeScroll: true,
        ignoreMobileResize: true
    });
    
    // Navigation functionality - FIXED VERSION WITH CORRECT SECTION MAPPING
    const navLinks = document.querySelectorAll('.nav-links a');
    const navIndicator = document.querySelector('.nav-indicator');
    
    // Set nav indicator position with GSAP animation
    function setNavIndicator(activeLink) {
        const linkRect = activeLink.getBoundingClientRect();
        const navRect = activeLink.closest('.nav-container').getBoundingClientRect();
        
        gsap.to(navIndicator, {
            duration: 0.3,
            ease: "power2.out",
            left: (linkRect.left - navRect.left) + 'px',
            width: linkRect.width + 'px',
            opacity: 1
        });
    }
    
    // Add click handlers to nav links - FIXED MAPPING
    navLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Update nav indicator
            setNavIndicator(this);
            
            // CORRECTED: Map nav clicks to correct sections
            let targetSection;
            switch(index) {
                case 0: targetSection = 'section2'; break; // Info -> Features section (section2)
                case 1: targetSection = 'section3'; break; // Features -> AR Features (section3)
                case 2: targetSection = 'section4'; break; // Privacy -> Privacy section (section4)
                case 3: targetSection = 'section5'; break; // Contact -> Contact section (section5)
            }
            
            const section = document.getElementById(targetSection);
            if (section) {
                smoother.scrollTo(section, true, "top top");
            }
        });
    });
    
    // Update active nav link based on scroll position - CORRECTED SECTION DETECTION
    ScrollTrigger.create({
        trigger: "#section1",
        start: "top center",
        end: "bottom center",
        onEnter: () => {
            // Hide indicator in intro
            navLinks.forEach(link => link.classList.remove('active'));
            gsap.to(navIndicator, { duration: 0.3, opacity: 0 });
        },
        onEnterBack: () => {
            // Hide indicator in intro
            navLinks.forEach(link => link.classList.remove('active'));
            gsap.to(navIndicator, { duration: 0.3, opacity: 0 });
        }
    });

    ScrollTrigger.create({
        trigger: "#section2",
        start: "top center",
        end: "bottom center",
        onEnter: () => {
            navLinks.forEach(link => link.classList.remove('active'));
            navLinks[0].classList.add('active'); // Info (actually section2)
            setNavIndicator(navLinks[0]);
        },
        onEnterBack: () => {
            navLinks.forEach(link => link.classList.remove('active'));
            navLinks[0].classList.add('active'); // Info (actually section2)
            setNavIndicator(navLinks[0]);
        }
    });

    ScrollTrigger.create({
        trigger: "#section3",
        start: "top center",
        end: "bottom center",
        onEnter: () => {
            navLinks.forEach(link => link.classList.remove('active'));
            navLinks[1].classList.add('active'); // Features (actually section3)
            setNavIndicator(navLinks[1]);
        },
        onEnterBack: () => {
            navLinks.forEach(link => link.classList.remove('active'));
            navLinks[1].classList.add('active'); // Features (actually section3)
            setNavIndicator(navLinks[1]);
        }
    });

    ScrollTrigger.create({
        trigger: "#section4",
        start: "top center",
        end: "bottom center",
        onEnter: () => {
            navLinks.forEach(link => link.classList.remove('active'));
            navLinks[2].classList.add('active'); // Privacy
            setNavIndicator(navLinks[2]);
        },
        onEnterBack: () => {
            navLinks.forEach(link => link.classList.remove('active'));
            navLinks[2].classList.add('active'); // Privacy
            setNavIndicator(navLinks[2]);
        }
    });

    ScrollTrigger.create({
        trigger: "#section5",
        start: "top center",
        end: "bottom center",
        onEnter: () => {
            navLinks.forEach(link => link.classList.remove('active'));
            navLinks[3].classList.add('active'); // Contact
            setNavIndicator(navLinks[3]);
        },
        onEnterBack: () => {
            navLinks.forEach(link => link.classList.remove('active'));
            navLinks[3].classList.add('active'); // Contact
            setNavIndicator(navLinks[3]);
        }
    });
    
    // Folding effect for hero section
    gsap.to(".hero-section", {
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        scaleY: 0,
        transformOrigin: "top",
        ease: "power3.inOut"
    });
    
    // Update progress bar
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.offsetHeight - window.innerHeight;
        const scrollProgress = scrollTop / docHeight;
        document.querySelector('.progress').style.width = scrollProgress * 100 + '%';
    });
    
    // Get all feature containers and dynamic title
    const features = [
        document.getElementById('feature1'),
        document.getElementById('feature2'),
        document.getElementById('feature3')
    ];
    
    const dynamicTitle = document.getElementById('dynamic-title');
    const featureTitles = ['REimagine', 'REinvent', 'REvision'];
    
    // Set initial state
    gsap.set(features[0], { autoAlpha: 1 });
    gsap.set(features[1], { autoAlpha: 0 });
    gsap.set(features[2], { autoAlpha: 0 });
    
    // Create a fixed position for the features section with hard pin
    ScrollTrigger.create({
        trigger: ".features-section",
        start: "top top",
        end: "+=200%",
        pin: true,
        pinSpacing: true,
        anticipatePin: 1
    });
    
    // Variables to track scroll position
    let currentScrollProgress = 0;
    
    // Create the timeline for feature transitions
    ScrollTrigger.create({
        trigger: ".features-section",
        start: "top top",
        end: "+=200%",
        scrub: 0.1,
        onUpdate: function(self) {
            // Crossfade between features based on scroll position with instant transitions
            if (self.progress < 0.33) {
                // Feature 1 visible - instantly show and hide with no transition
                features[0].style.opacity = 1;
                features[0].style.visibility = 'visible';
                features[1].style.opacity = 0;
                features[1].style.visibility = 'hidden';
                features[2].style.opacity = 0;
                features[2].style.visibility = 'hidden';
                dynamicTitle.textContent = featureTitles[0];
                window.currentFeature = 1;
            } else if (self.progress < 0.67) {
                // Feature 2 visible - instantly show and hide with no transition
                features[0].style.opacity = 0;
                features[0].style.visibility = 'hidden';
                features[1].style.opacity = 1;
                features[1].style.visibility = 'visible';
                features[2].style.opacity = 0;
                features[2].style.visibility = 'hidden';
                dynamicTitle.textContent = featureTitles[1];
                window.currentFeature = 2;
            } else {
                // Feature 3 visible - instantly show and hide with no transition
                features[0].style.opacity = 0;
                features[0].style.visibility = 'hidden';
                features[1].style.opacity = 0;
                features[1].style.visibility = 'hidden';
                features[2].style.opacity = 1;
                features[2].style.visibility = 'visible';
                dynamicTitle.textContent = featureTitles[2];
                window.currentFeature = 3;
            }
            
            // Update the scroll progress value for 3D model rotation
            currentScrollProgress = (self.progress - 0.5) * 2; // Range from -1 to 1
            
            // Update eye model rotation if it exists
            if (eyeModel) {
                updateEyeRotation();
            }
        }
    });
    
    // Contact text reveal animation - Smooth and gradual
    ScrollTrigger.create({
        trigger: ".connect-section",
        start: "top 90%",
        end: "top 10%",
        scrub: 0.5,
        animation: gsap.fromTo(".connect-text-inner", 
            {
                y: "100%"
            },
            {
                y: "0%",
                ease: "power1.out"
            }
        )
    });
    
    // UPDATED AR FEATURES SECTION FUNCTIONALITY - All Videos
    const featureItems = document.querySelectorAll('.feature-item');
    const arFeaturesSection = document.querySelector('.ar-features-section');
    
    // All media as videos now
    const mediaData = [
        { feature: 'Name Recall', src: '1.mp4', type: 'video' },
        { feature: 'Augmented Navigation', src: '2.mp4', type: 'video' },
        { feature: 'Visual Focus', src: '3.mp4', type: 'video' },
        { feature: 'Dynamic Magnification', src: '4.mp4', type: 'video' },
        { feature: 'Health Monitoring', src: '5.mp4', type: 'video' }
    ];
    
    // 호버 미디어들을 모두 비디오로 생성
    const hoverMedia = {};
    mediaData.forEach(data => {
        const video = document.createElement('video');
        video.src = data.src;
        video.alt = data.feature;
        video.className = 'dynamic-hover-media';
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.style.cssText = `
            position: fixed;
            right: 150px;
            width: 450px;
            height: 300px;
            object-fit: cover;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: 1000;
            display: block;
        `;
        document.body.appendChild(video);
        hoverMedia[data.feature] = video;
    });
    
    // Function to hide all hover media - 모두 비디오이므로 단순화
    function hideAllHoverMedia() {
        Object.values(hoverMedia).forEach(video => {
            video.style.opacity = '0';
            video.pause();
        });
    }
    
    // Function to expand a feature
    function expandFeature(clickedItem) {
        const container = clickedItem.closest('.feature-item-container');
        
        // 클릭하는 순간 모든 호버 미디어 숨기기
        hideAllHoverMedia();
        
        // If clicking the same feature, collapse it
        if (expandedFeature === container) {
            collapseAllFeatures();
            return;
        }
        
        // Collapse any previously expanded feature
        collapseAllFeatures();
        
        // Set the new expanded feature
        expandedFeature = container;
        container.classList.add('expanded');
        
        // Add expanded class to section for height adjustment
        arFeaturesSection.classList.add('has-expanded');
    }
    
    // Function to collapse all features
    function collapseAllFeatures() {
        if (expandedFeature) {
            expandedFeature.classList.remove('expanded');
            expandedFeature = null;
        }
        // Remove expanded class from section
        arFeaturesSection.classList.remove('has-expanded');
        // 접을 때도 호버 미디어 숨기기
        hideAllHoverMedia();
    }
    
    // Add event listeners to feature items
    featureItems.forEach((item) => {
        // Click event for expansion
        item.addEventListener('click', function(e) {
            e.preventDefault();
            expandFeature(this);
        });
        
        // Hover events for media (기존 섹션에서만, 확장되지 않았을 때만)
        item.addEventListener('mouseenter', function() {
            const container = this.closest('.feature-item-container');
            
            // 섹션 안에 있고, 확장되지 않았을 때만 호버 미디어 표시
            if (arFeaturesSection.contains(this) && !container.classList.contains('expanded') && !expandedFeature) {
                // 먼저 모든 호버 미디어 숨기기
                hideAllHoverMedia();
                
                const featureName = this.getAttribute('data-feature');
                const correspondingMedia = hoverMedia[featureName];
                
                if (correspondingMedia) {
                    // 현재 텍스트의 위치를 가져와서 미디어를 수평 정렬
                    const textRect = this.getBoundingClientRect();
                    const textCenterY = textRect.top + (textRect.height / 2);
                    
                    correspondingMedia.style.top = textCenterY + 'px';
                    correspondingMedia.style.transform = 'translateY(-50%)';
                    correspondingMedia.style.opacity = '1';
                    
                    // 모두 비디오이므로 조건문 제거
                    correspondingMedia.play().catch(e => console.log("Video play prevented:", e));
                }
                
                // 텍스트 이탤릭
                const textParts = this.querySelectorAll('.feature-text-part');
                textParts.forEach(textPart => {
                    textPart.style.fontStyle = 'italic';
                });
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const container = this.closest('.feature-item-container');
            
            // 섹션 안에 있고, 확장되지 않았을 때만
            if (arFeaturesSection.contains(this) && !container.classList.contains('expanded')) {
                const featureName = this.getAttribute('data-feature');
                const correspondingMedia = hoverMedia[featureName];
                
                if (correspondingMedia) {
                    correspondingMedia.style.opacity = '0';
                    // 모두 비디오이므로 조건문 제거
                    correspondingMedia.pause();
                }
                
                // 텍스트 스타일 리셋
                const textParts = this.querySelectorAll('.feature-text-part');
                textParts.forEach(textPart => {
                    textPart.style.fontStyle = 'normal';
                });
            }
        });
    });
    
    // Close expanded feature when clicking outside
    document.addEventListener('click', function(e) {
        // AR features 섹션 밖을 클릭했을 때만 접기
        if (expandedFeature && !arFeaturesSection.contains(e.target)) {
            collapseAllFeatures();
        }
    });
    
    // Close expanded feature when scrolling away from the section
    ScrollTrigger.create({
        trigger: ".ar-features-section",
        start: "top bottom",
        end: "bottom top",
        onLeave: () => {
            if (expandedFeature) {
                collapseAllFeatures();
            }
            // 섹션을 벗어날 때 모든 호버 미디어 숨기기
            hideAllHoverMedia();
        },
        onEnterBack: () => {
            // 섹션에 다시 들어올 때도 모든 호버 미디어 숨기기
            hideAllHoverMedia();
        }
    });
    
    // 다른 섹션으로 스크롤할 때 호버 미디어 숨기기
    ScrollTrigger.create({
        trigger: "#section1",
        start: "top center",
        end: "bottom center",
        onEnter: () => hideAllHoverMedia(),
        onEnterBack: () => hideAllHoverMedia()
    });
    
    ScrollTrigger.create({
        trigger: "#section2",
        start: "top center", 
        end: "bottom center",
        onEnter: () => hideAllHoverMedia(),
        onEnterBack: () => hideAllHoverMedia()
    });
    
    ScrollTrigger.create({
        trigger: "#section4",
        start: "top center",
        end: "bottom center", 
        onEnter: () => hideAllHoverMedia(),
        onEnterBack: () => hideAllHoverMedia()
    });
    
    ScrollTrigger.create({
        trigger: "#section5",
        start: "top center",
        end: "bottom center",
        onEnter: () => hideAllHoverMedia(),
        onEnterBack: () => hideAllHoverMedia()
    });
    
    // Function to perform lens deformation - BALANCED SUBTLETY
    function deformLens() {
        if (!eyeMesh || !originalVertices) return;
        
        const positions = eyeMesh.geometry.attributes.position.array;
        const time = Date.now() * 0.001;
        
        // Calculate rotation velocity for elastic response
        const currentRotationY = eyeModel.rotation.y;
        rotationVelocity = (currentRotationY - previousRotationY) * 40; // Balanced sensitivity
        previousRotationY = currentRotationY;
        
        // Update global elastic strength based on movement
        const targetElasticStrength = Math.abs(rotationVelocity) * 2.0; // Moderate effect
        globalElasticStrength += (targetElasticStrength - globalElasticStrength) * 0.1;
        
        // Reset to original positions
        for (let i = 0; i < positions.length; i++) {
            positions[i] = originalVertices[i];
        }
        
        // Apply balanced elastic deformation to entire surface
        for (let i = 0; i < positions.length; i += 3) {
            const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
            const originalVertex = vertex.clone();
            
            // Balanced surface wave when rotating
            if (globalElasticStrength > 0.008) {
                const distance = vertex.length();
                const wavePhase = distance * 7 + time * 3; // Moderate speed
                const waveDeform = Math.sin(wavePhase) * globalElasticStrength * 0.025; // Noticeable but not excessive
                const direction = vertex.clone().normalize();
                vertex.addScaledVector(direction, waveDeform);
            }
            
            // Gentle but visible wobble during rotation
            if (Math.abs(rotationVelocity) > 0.004) {
                const wobblePhase = originalVertex.x * 2.5 + originalVertex.y * 1.8 + time * 4;
                const wobbleAmount = Math.sin(wobblePhase) * Math.abs(rotationVelocity) * 0.015; // Visible but refined
                vertex.addScaledVector(vertex.clone().normalize(), wobbleAmount);
            }
            
            // Noticeable but refined touch deformation
            if (deformationStrength > 0.008) {
                const deformRadius = 0.5; // Moderate radius
                const maxDeformation = isClicking ? 0.1 : 0.055; // Clear but not extreme
                const touchDistance = vertex.distanceTo(deformationPoint);
                
                if (touchDistance < deformRadius) {
                    const falloff = Math.cos((touchDistance / deformRadius) * Math.PI * 0.5);
                    const deformAmount = maxDeformation * deformationStrength * falloff * falloff;
                    const direction = vertex.clone().normalize();
                    vertex.addScaledVector(direction, -deformAmount);
                }
            }
            
            positions[i] = vertex.x;
            positions[i + 1] = vertex.y;
            positions[i + 2] = vertex.z;
        }
        
        eyeMesh.geometry.attributes.position.needsUpdate = true;
        eyeMesh.geometry.computeVertexNormals();
    }
    
    // Function to animate deformation strength
    function animateDeformation(targetStrength, duration = 0.3) {
        gsap.to({ strength: deformationStrength }, {
            strength: targetStrength,
            duration: duration,
            ease: "power2.out",
            onUpdate: function() {
                deformationStrength = this.targets()[0].strength;
            }
        });
    }
    
    // Initialize THREE.js scene with eye.glb model
    function initEyeModel() {
        // Create the scene
        eyeScene = new THREE.Scene();
        eyeScene.background = new THREE.Color(0x000000); // Set scene background to black
        
        // Create camera
        eyeCamera = new THREE.PerspectiveCamera(45, eyeContainer.clientWidth / eyeContainer.clientHeight, 0.1, 1000);
        eyeCamera.position.set(0, 0, 5);
        
        // Create renderer with black background
        eyeRenderer = new THREE.WebGLRenderer({ antialias: true });
        eyeRenderer.setSize(eyeContainer.clientWidth, eyeContainer.clientHeight);
        eyeRenderer.setClearColor(0x000000, 1); // Black background with full opacity
        eyeRenderer.setPixelRatio(window.devicePixelRatio);
        eyeContainer.appendChild(eyeRenderer.domElement);
        
        // Add lights with slightly reduced intensity
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        eyeScene.add(ambientLight);
        
        // Main directional light 
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.2);
        directionalLight.position.set(4, 2, 3);
        eyeScene.add(directionalLight);
        
        // Secondary light 
        const secondaryLight = new THREE.DirectionalLight(0xffffff, 1.5);
        secondaryLight.position.set(-2, 1, 3);
        eyeScene.add(secondaryLight);
        
        // Fill light 
        const fillLight = new THREE.DirectionalLight(0xffffff, 1.3);
        fillLight.position.set(0, -2, 2);
        eyeScene.add(fillLight);
        
        // Point light for detail visibility
        const pointLight = new THREE.PointLight(0xffffff, 1.0);
        pointLight.position.set(0, 0, 2);
        eyeScene.add(pointLight);
        
        // Load the GLB model using GLTFLoader with deformation support
        const loader = new GLTFLoader();
        loader.load(
            'eye.glb', 
            function(gltf) {
                eyeModel = gltf.scene;
                
                // Find the eye mesh and store original vertices - preserve original materials
                eyeModel.traverse((child) => {
                    if (child.isMesh) {
                        eyeMesh = child;
                        
                        // Preserve original material - don't modify it
                        console.log("Original material:", child.material);
                        
                        // Store original vertices for deformation
                        const positions = child.geometry.attributes.position.array;
                        originalVertices = new Float32Array(positions.length);
                        for (let i = 0; i < positions.length; i++) {
                            originalVertices[i] = positions[i];
                        }
                        
                        // Make geometry dynamic for deformation
                        child.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                        child.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
                    }
                });
                
                // Scale reduced by 10% for smaller 3D object
                eyeModel.scale.set(1.8, 1.8, 1.8);
                
                // Center the model
                eyeModel.position.set(0.5, 0, 0);
                
                eyeScene.add(eyeModel);
                
                // Initialize rotation to match scroll position
                updateEyeRotation();
                
                // Start animation loop
                animate();
                console.log("GLB model loaded successfully");
            },
            function(xhr) {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            function(error) {
                console.error('An error happened while loading the model:', error);
            }
        );
        
        // Add OrbitControls with limited rotation
        eyeControls = new OrbitControls(eyeCamera, eyeRenderer.domElement);
        eyeControls.enableZoom = false; // Disable zooming
        eyeControls.enablePan = false; // Disable panning
        eyeControls.minPolarAngle = Math.PI / 2 - 0.4; // Limit vertical rotation
        eyeControls.maxPolarAngle = Math.PI / 2 + 0.4;
        eyeControls.minAzimuthAngle = -Math.PI / 4; // Limit horizontal rotation
        eyeControls.maxAzimuthAngle = Math.PI / 4;
        eyeControls.rotateSpeed = 0.5; // Slower rotation speed
        
        // Handle window resize
        window.addEventListener('resize', onWindowResize);
    }
    
    // Update eye model rotation based on scroll position when not being dragged
    function updateEyeRotation() {
        if (!eyeModel || eyeControls.enabled === false) return;
        
        // Only update rotation if not currently being controlled by user
        if (!eyeControls.active) {
            // Apply smooth rotation based on scroll position
            const targetRotationY = currentScrollProgress * Math.PI / 6; // Max 30 degrees
            
            // Add subtle automatic rotation in both axes
            const time = Date.now() * 0.0008; // Slower speed
            const autoRotationY = Math.sin(time) * 0.15; // Smaller horizontal oscillation (±8.6 degrees)
            const autoRotationX = Math.cos(time * 0.7) * 0.1; // Smaller vertical oscillation (±5.7 degrees)
            
            // Combine scroll-based rotation with automatic rotation
            const finalRotationY = targetRotationY + autoRotationY;
            const finalRotationX = autoRotationX;
            
            // Apply smooth transition to the target rotations
            eyeModel.rotation.y += (finalRotationY - eyeModel.rotation.y) * 0.1;
            eyeModel.rotation.x += (finalRotationX - eyeModel.rotation.x) * 0.1;
        }
        
        // Apply lens deformation
        deformLens();
    }
    
    // Handle window resize
    function onWindowResize() {
        if (!eyeCamera || !eyeRenderer || !eyeContainer) return;
        
        eyeCamera.aspect = eyeContainer.clientWidth / eyeContainer.clientHeight;
        eyeCamera.updateProjectionMatrix();
        eyeRenderer.setSize(eyeContainer.clientWidth, eyeContainer.clientHeight);
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Update controls
        eyeControls.update();
        
        // Update rotation if not being controlled
        if (!eyeControls.active) {
            updateEyeRotation();
        }
        
        // Render scene
        eyeRenderer.render(eyeScene, eyeCamera);
    }
    
    // Initialize eye model after the page has loaded
    window.addEventListener('load', function() {
        console.log("Initializing eye model...");
        initEyeModel();
        
        // Force refresh scrolltrigger
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 200);
    });
    
    // Add custom behavior to OrbitControls with deformation effects
    eyeContainer.addEventListener('mousedown', function(e) {
        if (eyeControls) {
            eyeControls.active = true;
            isClicking = true;
            
            // Calculate deformation point based on mouse position
            const rect = eyeContainer.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            
            // Project mouse position to 3D space
            const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
            vector.unproject(eyeCamera);
            const dir = vector.sub(eyeCamera.position).normalize();
            const distance = -eyeCamera.position.z / dir.z;
            deformationPoint = eyeCamera.position.clone().add(dir.multiplyScalar(distance));
            
            // Start deformation animation
            animateDeformation(1.0, 0.2);
        }
    });
    
    eyeContainer.addEventListener('mouseup', function() {
        if (eyeControls) {
            eyeControls.active = false;
            isClicking = false;
            
            // End deformation animation
            animateDeformation(0.0, 0.4);
        }
    });
    
    window.addEventListener('mouseup', function() {
        if (eyeControls) {
            eyeControls.active = false;
            isClicking = false;
            
            // End deformation animation
            animateDeformation(0.0, 0.4);
        }
    });
});