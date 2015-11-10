// This block automatically executes after the page is finished loading
var professors = [];
var fieldsets = $('fieldset').toArray();
if (fieldsets.length > 1) {
    for (var i = 1; i < fieldsets.length; i++) {
       var professor = $(fieldsets[i]['innerHTML']).find('tr td:eq(4)').text();
       if (professors.indexOf(professor) < 0) {
        professors.push(professor);
    }
}
}
for (var i = 0; i < professors.length; i++) {
    displayRating(professors[i]);
}

/**
 * Wrapper function to display the professor's rating in the course listings
 */
 function displayRating(professor) {
    getTID(professor);
}

/**
 * Performs a search on ratemyprofessor to get the professor's tid
 */
 function getTID(professor) {
    var last_name = professor.substring(0, professor.indexOf(','));
    last_name = last_name.indexOf(' ') > -1 ? last_name.substring(0, last_name.indexOf(' ')) : last_name;
    var formatted_name = last_name + ", " + professor.substring(professor.indexOf(',') + 2, professor.length);
    chrome.runtime.sendMessage({
        method: 'POST',
        action: 'xhttp',
        url: 'http://www.ratemyprofessors.com/search.jsp',
        data : 'queryBy=teacherName&schoolName=san+joaquin+delta+college&queryoption=HEADER&query='+last_name+'&facetSearch=true'
    }, function (response) {
        var tid = 0;
        var professors = $(response).find('li.listing.PROFESSOR').toArray();
        for (var i = 0; i < professors.length; i++) {
            var html = professors[i]['innerHTML'];
            if ($(html).find('span.main').text().indexOf(formatted_name) > -1) {
                var href = $("<div>" + html + "</div>").find("a").attr('href');
                tid = href.substring(href.indexOf("tid=") + 4, href.length);
                break;
            }
        }
        getRating(professor, tid);
    });
}

/**
 * Gets the professor's overall rating from ratemyprofessor
 */
 function getRating(professor, tid) {
    chrome.runtime.sendMessage({
        method: 'POST',
        action: 'xhttp',
        url: 'http://www.ratemyprofessors.com/ShowRatings.jsp',
        data: 'tid=' + tid
    }, function (response) {
        var rating = $(response).find('div.grade').first().text();
        appendRating(professor, rating, tid);
    });
}

/**
 * Adds the rating to the course listings page
 */
 function appendRating(professor, rating, tid) {
    var professor_profile = "http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + tid;
    if (rating.length < 4 && rating !== "") {
        if (Number(rating) >= 4.0) {
            $('fieldset td:contains("' + professor + '")').html('<span style="color: #B2CF35">' + professor
                + '</span> <a target="_blank" href="' + professor_profile + '">' + rating + '</a>');
        } else if (Number(rating) >= 3.0) {
            $('fieldset td:contains("' + professor + '")').html('<span style="color: #F7CC1E">' + professor
                + '</span> <a target="_blank" href="' + professor_profile + '">' + rating + '</a>');
        } else {
            $('fieldset td:contains("' + professor + '")').html('<span style="color: #E21744">' + professor
                + '</span> <a target="_blank" href="' + professor_profile + '">' + rating + '</a>');
        }
    } else {
        $('fieldset td:contains("' + professor + '")').html(professor + ' 0.0');
    }
}
