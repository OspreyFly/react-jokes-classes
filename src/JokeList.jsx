import React, { Component } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

class JokeList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jokes: [],
        };
    }

    componentDidMount() {
        this.fetchJokes();
    }

    componentDidUpdate(prevProps) {
        if (this.props.numJokesToGet !== prevProps.numJokesToGet && !this.state.jokes.length) {
            this.fetchJokes();
        }
    }

    fetchJokes = async () => {
        let j = [...this.state.jokes];
        const maxAttempts = 10;
        let attempts = 0;

        try {
            while (attempts < maxAttempts) {
                let res = await axios.get("https://icanhazdadjoke.com/", {
                    headers: { Accept: "application/json" },
                });
                let { status, ...jokeObj } = res.data;

                if (j.some(joke => joke.id === jokeObj.id)) {
                    console.error("duplicate found!");
                    attempts++;
                    continue;
                }

                j.push({ ...jokeObj, votes: 0 });
                attempts++;

                if (j.length >= this.props.numJokesToGet) break;
            }
            this.setState({ jokes: j });
        } catch (e) {
            console.log(e);
        }
    };

    generateNewJokes = () => {
        this.setState({ jokes: [] });
    };

    vote = (id, delta) => {
        this.setState(allJokes =>
            allJokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j))
        );
    };

    render() {
        const { jokes } = this.state;
        if (jokes.length) {
            let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);

            return (
                <div className="JokeList">
                    <button className="JokeList-getmore" onClick={this.generateNewJokes.bind(this)}>
                        Get New Jokes
                    </button>

                    {sortedJokes.map(j => (
                        <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={this.vote.bind(this)} />
                    ))}
                </div>
            );
        }

        return null;
    }
}

export default JokeList;
