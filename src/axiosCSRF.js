import axios from 'axios'  

function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

// use a hash of the access token to avoid exposing it in a URL	
function getMediaQueryString() {
	let mediaToken = getCookie('access-token') ? md5(getCookie('access-token')) : '';
	return '_csrf='+csrfToken+'&_media='+mediaToken
}

function getCsrfQueryString() {
	let csrfToken = getCookie('csrf-token')
	return '_csrf='+csrfToken
	
}



function getAxiosClient()	{
	
	let axiosOptions={};
	let cookie = getCookie('csrf-token');
//			console.log(['cookieas',cookie,document.cookie])
	if (cookie && cookie.trim().length > 0) {
		axiosOptions.headers = {'x-csrf-token': cookie}
		// add auth headers if token available in cookie
		let accessCookie = getCookie('access-token');
		if (accessCookie && accessCookie.length > 0)  axiosOptions.headers['Authorization'] = 'Bearer '+accessCookie
          
	}
	return axios.create(axiosOptions);
}


export {getCookie,getAxiosClient,getMediaQueryString,getCsrfQueryString}
