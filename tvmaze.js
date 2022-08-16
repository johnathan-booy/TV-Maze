"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm(term) {
	const res = await axios.get("http://api.tvmaze.com/search/shows", {
		params: { q: term },
	});
	return extractShowData(res.data);
}

/* Retrieve relevant show data {id, name, summary, image} */
function extractShowData(array) {
	return array.map(function (object) {
		const { id, name, summary } = object.show;
		const image = object.show.image
			? object.show.image.medium
			: "https://tinyurl.com/tv-missing";
		return { id, name, summary, image };
	});
}

/** Given list of shows, create markup for each and to DOM */
function populateShows(shows) {
	$showsList.empty();

	for (let show of shows) {
		const $show = $(
			`<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
				<div class="media">
				<img 
					src="${show.image}" 
					alt="${show.name}"
					class="w-25 mr-3 mb-2">
				<div class="media-body">
					<h5 class="text-white">${show.name}</h5>
					<div><small class="text-white">${show.summary}</small></div>
					<button data-show-id="${show.id}" data-show-name="${show.name}" class="btn btn-outline-primary btn-sm Show-getEpisodes">
					Episodes
					</button>
				</div>
				</div>  
			</div>
			`
		);

		$showsList.append($show);
	}

	$(".Show-getEpisodes").on("click", searchForEpisodesAndDisplay);
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
async function searchForShowAndDisplay() {
	const term = $("#search-query").val();
	const shows = await getShowsByTerm(term);
	populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
	evt.preventDefault();
	await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) {
	const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
	return extractEpisodeData(res.data);
}

function extractEpisodeData(data) {
	const episodes = [];
	for (const entry of data) {
		const { id, name, season, number } = entry;
		const episode = { id, name, season, number };
		episodes.push(episode);
	}
	console.log(episodes);
	return episodes;
}

/** Given a list of episodes, create markup for each and append to the DOM*/
function populateEpisodes(episodes) {
	$episodesArea.empty();

	for (let episode of episodes) {
		const $episode = $(
			`<tr>
				<td>${episode.name}</td>
				<td>${episode.season}</td>
				<td>${episode.number}</td>
			</tr>`
		);

		$episodesArea.append($episode);
	}
}

/** Handle episode button clicks.
 * Show $episodesArea
 */
async function searchForEpisodesAndDisplay() {
	const showId = $(this).data("show-id");
	const showName = $(this).data("show-name");
	const episodes = await getEpisodesOfShow(showId);
	populateEpisodes(episodes);
	$("#modal-title").text(`${showName}`);
	$("#modal").modal("show");
}

$("#modal-close").on("click", function () {
	$("#modal").modal("hide");
});
