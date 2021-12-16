import {forkJoin, from, Observable} from 'rxjs';
import axios from 'axios';
import {map, pluck, switchMap} from 'rxjs/operators';

const query = 'ndse-homeworks';

interface Repos {
  items: [];
}

interface Repo {
  id: number,
  name: string,
  url: string
}

const task1 = from(axios.get(`https://api.github.com/search/repositories?q=${query}`))
  .pipe(
    pluck('data'),
    map(
      (response: Repos) => response.items.map((repo: Repo) => {
        return {
          id: repo.id,
          name: repo.name,
          url: repo.url
        };
      })
    ),
  );

task1.subscribe({
  next: (value: Repo[]) => console.log(value),
  complete: () => console.log('Complete!'),
  error: (error) => console.log('Error!', error)
});


interface User {
  id: number;
}

interface Todo {
  id: number;
}

function getTodos(user): Observable<Todo[]> {
  return from(
    axios.get(`https://jsonplaceholder.typicode.com/users/${user.id}/todos`)
  ).pipe(
    pluck('data')
  );
}


const task2 = new Observable(
  observer => {
    axios.get('https://jsonplaceholder.typicode.com/users').then((response) => {
      observer.next(response);
    }).catch((error) => observer.error(error.message));
    return () => {
      console.log('unsubscribe');
    };
  }
)
  .pipe(
    pluck('data'),
    switchMap(
      (users: User[]) =>
        forkJoin(
          users.map(
            (user) =>
              getTodos(user).pipe(
                map((todos) => ({
                  ...user,
                  todos
                }))
          )
        )
      ),
    )
  );

task2.subscribe({
  next: (value: any) => console.log(value),
  complete: () => console.log('Complete!'),
  error: (error) => console.log('Error!', error)
});
