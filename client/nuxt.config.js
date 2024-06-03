import colors from "vuetify/es5/util/colors";

export default {
	// Global page headers: https://go.nuxtjs.dev/config-head
	head: {
		titleTemplate: "%s - hipal",
		title: "hipal",
		meta: [
			{ charset: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ hid: "description", name: "description", content: "" },
			{ name: "format-detection", content: "telephone=no" },
		],
		link: [
			{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
			{
				href: "https://fonts.googleapis.com/css?family=Material+Icons",
				rel: "stylesheet",
			},
		],
	},

	// Global CSS: https://go.nuxtjs.dev/config-css
	css: [],

	// Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
	plugins: [{ src: "~/plugins/axios", mode: "server" }],

	// Auto import components: https://go.nuxtjs.dev/config-components
	components: true,

	// Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
	buildModules: [
		// https://go.nuxtjs.dev/typescript
		"@nuxt/typescript-build",
		// https://go.nuxtjs.dev/vuetify
		"@nuxtjs/vuetify",
		"@nuxtjs/fontawesome",
		"@nuxtjs/google-fonts",
	],

	// Modules: https://go.nuxtjs.dev/config-modules
	modules: [
		// https://go.nuxtjs.dev/axios
		"@nuxtjs/axios",
		// https://go.nuxtjs.dev/pwa
		"@nuxtjs/pwa",
		"@nuxtjs/auth-next",
	],

	// Axios module configuration: https://go.nuxtjs.dev/config-axios
	axios: {
		// Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
		baseURL: "https://dev.api.hipal.life",
		withCredentials: true,
	},

	// PWA module configuration: https://go.nuxtjs.dev/pwa
	pwa: {
		manifest: {
			lang: "en",
		},
	},

	// Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
	vuetify: {
		customVariables: ["~/assets/variables.scss"],
		treeShake: true,
		theme: {
			dark: false,
			themes: {
				dark: {
					primary: colors.blue.darken2,
					accent: colors.grey.darken3,
					secondary: colors.amber.darken3,
					info: colors.teal.lighten1,
					warning: colors.amber.base,
					error: colors.deepOrange.accent4,
					success: colors.green.accent3,
				},
				light: {
					primary: "#E96108", // #E53935
					secondary: "#023047", // #FFCDD2
					accent: "#171923", // #1A202C
					info: "#219EBC",
					warning: colors.amber.base,
					error: "#BF0603",
					success: "#3E8914",
				},
			},
		},
		icons: {
			iconfont: "md", // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4' || 'faSvg'
		},
	},

	router: {
		base: "/",
		middleware: ["auth"],
	},

	googleFonts: {
		families: {
			Inter: [200, 400, 600, 700],
		},
		display: "swap",
	},

	fontawesome: {
		icons: {
			solid: [
				"faArrowRight",
				"faArrowLeft",
				"faChevronRight",
				"faHome",
				"faRupeeSign",
				"faBell",
				"faCog",
				"faPlus",
				"faAngleDown",
				"faCoffee",
				"faTimesCircle",
				"faFileInvoice",
				"faDownload",
			],
			regular: ["faSquare", "faCircle", "faDotCircle"],
			brands: [],
		},
	},

	auth: {
		resetOnError: true,
		rewriteRedirects: true,
		fullPathRedirect: true,
		strategies: {
			local: {
				cookie: {
					// (optional) If set, we check this cookie existence for loggedIn check
					name: null,
				},
				// token: {
				//   property: false,
				//   // global: false,
				//   required: true,
				//   type: 'Bearer',
				// },
				user: {
					property: "currentUser",
				},
				endpoints: {
					// (optional) If set, we send a get request to this endpoint before login
					// csrf: {
					//   url: ''
					// }
					signup: {
						url: "/v1/users?action=signup&clientRole=user",
						method: "post",
					},
					login: {
						url: "/v1/users?action=login&clientRole=user",
						method: "post",
					},
					logout: {
						url: "/v1/users?action=logout",
						method: "put",
					},
					user: {
						url: "/v1/users?clientRole=user",
						method: "get",
					},
				},
			},
		},
		redirect: {
			login: "/",
			logout: "/",
			callback: "/login",
			home: "/businesses",
		},
	},

	// Build Configuration: https://go.nuxtjs.dev/config-build
	build: {
		postcss: null,
	},
	server: {
		host: "0.0.0.0",
	},
};
