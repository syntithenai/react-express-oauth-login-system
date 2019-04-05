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


function getAxiosClient()	{
	
	let axiosOptions={};
	let cookie = getCookie('csrf-token');
//			console.log(['cookieas',cookie,document.cookie])
	if (cookie && cookie.trim().length > 0) {
		axiosOptions.headers = {'x-csrf-token': cookie}
	}
	return axios.create(axiosOptions);
}
export {getCookie,getAxiosClient}
