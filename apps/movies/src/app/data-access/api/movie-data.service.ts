import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, timer } from 'rxjs';
import { environment } from '@movies/env';
import {
  MovieGenreModel,
  MovieModel,
  MoviePersonModel,
} from '../../shared/model/index';
import { MovieDatabaseModel } from '../../shared/model/movie-database.model';

@Injectable({
  providedIn: 'root',
})
export class MovieDataService {
  constructor(private http: HttpClient) {}

  private apiVersion = environment.tmdbApiVersion;
  private apiNewVersion = environment.tmdbApiNewVersion;
  private baseUrl = [environment.tmdbBaseUrl, this.apiVersion].join('/');

  private URL_LISTS = [
    environment.tmdbBaseUrl,
    this.apiNewVersion,
    'list',
  ].join('/');
  private URL_SEARCH = [this.baseUrl, 'search', 'movie'].join('/');
  private URL_PERSON = [this.baseUrl, 'person'].join('/');
  private URL_GENRE_MOVIE_LIST = [this.baseUrl, 'genre', 'movie', 'list'].join(
    '/'
  );
  private URL_MOVIE_GENRE = `${this.baseUrl}/discover/movie`;
  private URL_MOVIE = (id: string) =>
    `${[this.baseUrl, 'movie', id].join('/')}?append_to_response=videos`;
  private URL_MOVIE_RECOMMENDATIONS = (id: string) =>
    [this.baseUrl, 'movie', id, 'recommendations'].join('/');
  private URL_MOVIE_CREDITS = (id: string) =>
    [this.baseUrl, 'movie', id, 'credits'].join('/');
  private URL_MOVIE_CATEGORY = (category: string) =>
    [this.baseUrl, 'movie', category].join('/');

  getMovie = (id: string): Observable<MovieModel> =>
    this.http.get<MovieModel>(this.URL_MOVIE(id));

  getCredits = (id: string): Observable<any> =>
    this.http.get<any>(this.URL_MOVIE_CREDITS(id));

  getMovieCategory = (
    category: string
  ): Observable<{ results: MovieModel[] }> =>
    this.http.get<{ results: MovieModel[] }>(this.URL_MOVIE_CATEGORY(category));

  getMovieRecomendations = (id: string): Observable<MovieModel[]> =>
    this.http.get<MovieModel[]>(this.URL_MOVIE_RECOMMENDATIONS(id));

  getGenres = (): Observable<MovieGenreModel[]> =>
    this.http
      .get<{ genres: MovieGenreModel[] }>(this.URL_GENRE_MOVIE_LIST)
      .pipe(map(({ genres }) => genres));

  getMovieGenre = (
    genreId: string,
    page: string = '1',
    sortBy: string = 'popularity.desc'
  ): Observable<{ results: MovieModel[] }> =>
    this.http.get<{ results: MovieModel[] }>(this.URL_MOVIE_GENRE, {
      params: { with_genres: genreId, page, sort_by: sortBy },
    });

  updateMovieRating = (movieId: number, rating: number): Observable<any> =>
    timer(2500);

  getPersonMovies = (page: string, sortBy: string): Observable<MovieModel> =>
    this.http.get<MovieModel>(this.URL_GENRE_MOVIE_LIST, {
      params: { page, sort_by: sortBy },
    });

  getPerson = (id: string): Observable<MoviePersonModel> =>
    this.http.get<MoviePersonModel>(this.URL_PERSON, { params: { id } });

  searchMovies = (
    query: string,
    page: string | number,
    lang?: string
  ): Observable<MovieDatabaseModel[]> =>
    this.http.get<MovieDatabaseModel[]>(this.URL_SEARCH, {
      params: { query, page, ...(lang && { lang }) },
    });

  getMoviesRecommendations = (
    id: string,
    page: string
  ): Observable<MovieModel> =>
    this.http.get<MovieModel>(
      [this.URL_MOVIE, id, 'recommendations'].join('/'),
      { params: { page } }
    );

  getLists = (): Observable<MovieDatabaseModel[]> =>
    this.http.get<MovieDatabaseModel[]>(this.URL_LISTS);

  getPager(totalPages: number, currentPage: number = 1) {
    let startPage = 0;
    let endPage = 0;
    if (totalPages >= 1000) {
      totalPages = 1000;
    }
    if (totalPages <= 10) {
      // less than 10 total pages so show all
      startPage = 1;
      endPage = totalPages;
    } else {
      // more than 10 total pages so calculate start and end pages
      if (currentPage <= 6) {
        startPage = 1;
        endPage = 10;
      } else if (currentPage + 4 >= totalPages) {
        startPage = totalPages - 9;
        endPage = totalPages;
      } else if (currentPage >= 1000) {
        startPage = currentPage - 5;
        currentPage = 1000;
        totalPages = 1000;
        endPage = 1000;
      } else {
        startPage = currentPage - 5;
        endPage = currentPage + 4;
      }
    }

    // create an array of pages to ng-repeat in the pager control
    const pages = [startPage, currentPage, endPage];

    // return object with all pager properties required by the view
    return {
      currentPage,
      totalPages,
      startPage,
      endPage,
      pages,
    };
  }
}
