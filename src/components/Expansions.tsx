import React from 'react';
import { Series, Expansion } from '../model/Meta'
import axios from 'axios'
import { baseURL } from '../index'

class State {
    series = new Array<Series>()
    exps = new Array<Expansion>()
}

export class Expansions extends React.Component<{}, State> {
    constructor(props: any) {
        super(props)
        this.state = new State()
        axios.get(`${baseURL}/series`).then(
            (res) => {
                this.setState({ ...this.state, series: res.data })
            },
            (err) => {
                console.log(err)
            }
        )
        axios.get(`${baseURL}/expansions`).then(
            (res) => {
                this.setState({ ...this.state, exps: res.data })
            },
            (err) => {
                console.log(err)
            }
        )
    }

    render(): React.ReactNode {
        return (
            <div className='w-full h-full'>
                {this.renderSeries()}
            </div>
        )
    }

    private revOrderDate(a : string, b:string): number{
        let aD = new Date(a)
            let bD = new Date(b)
            if(aD < bD){
                return 1
            }else if(aD > bD){
                return -1
            }else{
                return 0
            }
    }

    private getYear(dateString: string){
        let date = new Date(dateString)
        return date.getFullYear()
    }

    private renderSeries() {
        let items = []
        this.state.series.sort((a,b) => this.revOrderDate(a.releaseDate,b.releaseDate))
        for (let series of this.state.series) {
            items.push(
                <div>
                    <div className='flex w-full h-16 bg-red-600 items-center'>
                        <img className='m-2 h-12' src={`${baseURL}/seriesImg/${series.name}`}></img>
                        <div className='flex-grow'></div>
                        <span className='text-white p-4'>{this.getYear(series.releaseDate)}</span>
                    </div>
                    <div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 xl:grid-cols-15 gap-4 p-4'>
                        {this.renderExp(series.name)}
                    </div>
                </div>
            )
        }
        return items
    }
    private renderExp(series: string) {
        let filtered = this.state.exps.filter((val) => val.series === series)
        let items = []
        for(let exp of filtered){
            items.push(
                <div className='flex justify-items-center items-center h-24 hover:shadow-2xl hover:bg-red-600 border-gray-500 bg-gray-100 border-2 rounded-md '>
                    <img src={`${baseURL}/expLogo/${exp.name}`}/>
                </div>
            )
        }
        return items
    }
}