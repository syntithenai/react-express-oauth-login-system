import axios from 'axios'  
import md5 from 'md5'

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
	let csrfToken = getCookie('csrf-token')
	let mediaToken = getCookie('access-token') ? md5(getCookie('access-token')) : '';
	return '_csrf='+csrfToken+'&_media='+mediaToken
}

function getCsrfQueryString() {
	let csrfToken = getCookie('csrf-token')
	return '_csrf='+csrfToken
	
}
function scrollToTop() {
    console.log(['SCROLL TO  TOP']);
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0;
}


function getAxiosClient()	{
	
	let axiosOptions={};
	let cookie = getCookie('csrf-token');
	if (cookie && cookie.trim().length > 0) {
		// csrf header
		axiosOptions.headers = {'x-csrf-token': cookie}
		// add auth headers IF access-token available in cookie
		let accessCookie = getCookie('access-token');
		if (accessCookie && accessCookie.length > 0)  axiosOptions.headers['Authorization'] = 'Bearer '+accessCookie
          
	}
	return axios.create(axiosOptions);
}


export {scrollToTop,getCookie,getAxiosClient,getMediaQueryString,getCsrfQueryString}
