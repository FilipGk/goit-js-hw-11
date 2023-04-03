import NewsApiService from './js/api';
import { lightbox } from './js/slb';
import notiflix from 'notiflix/build/notiflix-notify-aio';

const refs = {
  searchForm: document.querySelector('.search-form'),
  galleryContainer: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};
let isShown = 0;
const newsApiService = new NewsApiService();

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function onSearch(event) {
  event.preventDefault();

  refs.galleryContainer.innerHTML = '';
  newsApiService.query = event.currentTarget.elements.searchQuery.value.trim();
  newsApiService.resetPage();

  if (newsApiService.query === '') {
    notiflix.Notify.warning('Please, fill the search field');
    return;
  }

  isShown = 0;
  fetchGallery();
  onRenderGallery(hits);
}

function onLoadMore() {
  newsApiService.incrementPage();
  fetchGallery();
}

async function fetchGallery() {
  refs.loadMoreBtn.classList.add('is-hidden');

  const r = await newsApiService.fetchGallery();
  const { hits, total } = r;
  isShown += hits.length;

  if (!hits.length) {
    notiflix.Notify.failure(
      `Sorry, there are no images matching your search query. Please try again.`
    );
    refs.loadMoreBtn.classList.add('is-hidden');
    return;
  }

  onRenderGallery(hits);
  isShown += hits.length;

  if (isShown < total) {
    notiflix.Notify.success(`Hooray! We found ${total} images !!!`);
    refs.loadMoreBtn.classList.remove('is-hidden');
  }

  if (isShown >= total) {
    notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

function onRenderGallery(elements) {
  const markup = elements
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
    <a href="${largeImageURL}">
      <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
        ${downloads}
      </p>
    </div>
    </div>`;
      }
    )
    .join('');
  refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}
