const professors = document.querySelectorAll("body > div > div.panel-group > div.panel > div.panel-body > table > tbody > tr > td:nth-child(5)");
Array.from(professors).forEach(function(professor) {
	getProfessorTID(professor).then(function(tid) {
		getProfessorRating(tid).then(function(rating) {
			embedRating(professor, rating);
		});
	});
});

function getProfessorTID(professor) {
	const name = professor.innerText;
	const lastName = name.substring(0, name.indexOf(",")).trim();
	const firstInitial = name.substring(name.indexOf(",") + 1).trim();
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({
			method: "POST",
			url: "http://www.ratemyprofessors.com/search.jsp",
			data: `queryBy=teacherName&schoolName=san+joaquin+delta+college&queryoption=HEADER&query=${lastName}&facetSearch=true`
		}, function(response) {
			if (response) {
				const regex = new RegExp(`<li class="listing PROFESSOR">[\\s\\S]*${lastName}\\W?,\\W?${firstInitial}[\\s\\S]*<\/li>`, "ig");
				const element = response.match(regex);
				const tid = element ? element[0].match(/[0-9]{1,}/g) : null;
				resolve(tid ? tid[0] : null);
			} else {
				reject();
			}
		});
	});
}

function getProfessorRating(tid) {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({
			method: "POST",
			url: "http://www.ratemyprofessors.com/ShowRatings.jsp",
			data: `tid=${tid}`
		}, function(response) {
			if (response) {
				const element = response.match(/<div class="grade" title="">[0-9.]{3}<\/div>/g);
				const rating = element ? element[0].match(/[0-9.]{3}/g) : null;
				resolve(rating ? rating[0] : null);
			} else {
				reject();
			}
		});
	});
}

function embedRating(professor, rating) {
	if (rating) {
		const hex = getHexColor(rating);
		professor.innerHTML = `${professor.innerText} (<span style="color: #${hex}">${rating}</span>)`;
	} else {
		console.log(`Could not get rating for ${professor.innerText}`);
	}
}

function getHexColor(rating) {
	rating = Number(rating);
	if (rating >= 4.0) {
		return "B2CF35";
	} else if (rating >= 3.0) {
		return "F7CC1E";
	} else {
		return "E21744";
	}
}