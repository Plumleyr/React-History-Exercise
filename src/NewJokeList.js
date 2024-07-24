import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import NewJoke from "./NewJoke";
import "./JokeList.css";

/** List of jokes. */

const NewJokeList = ({ jokesToGet = 5 }) => {
  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* retrieve jokes from API */

  const getJokes = useCallback(async () => {
    try {
      // load jokes one at a time, adding not-yet-seen jokes
      let jokes = [];
      let seenJokes = new Set();

      while (jokes.length < jokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" },
        });

        let joke = res.data;

        if (!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id);
          jokes.push({ ...joke, votes: 0 });
        } else {
          console.log("dupe found!");
        }
      }

      setJokes(jokes);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
    }
  }, [jokesToGet]);

  /* at mount, get jokes */

  useEffect(() => {
    getJokes();
  }, [getJokes]);

  /* empty joke list, set to loading state, and then call getJokes */

  const genNewJokes = () => {
    setIsLoading((isLoading) => !isLoading);
    getJokes();
  };

  /* change vote for this id by delta (+1 or -1) */

  const vote = (id, delta) => {
    setJokes((jokes) =>
      jokes.map((j) => (j.id === id ? { ...j, votes: j.votes + delta } : j))
    );
  };

  const sortedJokes = jokes.sort((a, b) => b.votes - a.votes);

  /* render: either loading spinner or list of sorted jokes. */

  return (
    <>
      {isLoading ? (
        <div className="loading">
          <i className="fas fa-4x fa-spinner fa-spin" />
        </div>
      ) : (
        <div className="JokeList">
          <button className="JokeList-getmore" onClick={() => genNewJokes()}>
            Get New Jokes
          </button>

          {sortedJokes.map((j) => (
            <NewJoke
              text={j.joke}
              key={j.id}
              id={j.id}
              votes={j.votes}
              vote={vote}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default NewJokeList;
