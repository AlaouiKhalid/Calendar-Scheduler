import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';

export interface CelluleCalendrier {
  date: Date;
  jour: string;
}
export interface AbsenceResultat {
  id: number;
  debut: moment.Moment;
  fin: moment.Moment;
}

export interface MoisCalendrier {
  nom: string,
  index: number,
  premierJour: number,
  totalJours: number,
  weekends: number[],
  celluleDebut?: number,
  celluleFin?: number
}

@Component({
  selector: 'calendrier-absence-annee',
  templateUrl: './calendar-year-view.component.html',
  styleUrls: ['./calendar-year-view.component.scss']
})
export class CalendarYearViewComponent implements OnInit {
  joursNonTravaillesPlanning: string[] = [];
  absences: AbsenceResultat[] = [];

  intervalleAbsence?: AbsenceResultat;
  jourSelectionne?: CelluleCalendrier;
  selectionDirecteEnCours?: boolean;


  salarieId: number = 5;

  anneeCourante = new Date().getFullYear();

  datesCalendrier: CelluleCalendrier[][] = [];

  moiss: MoisCalendrier[] = [];
  jours: string[] = [];
  nomsJours: string[] = ["D", "L", "Ma", "Me", "J", "V", "S"];
  nomsMois: string[] = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre"
  ];

  maximumSemainesAnnee: number = 0;
  menuTopLeftPosition = { x: '0', y: '0' }

  ngOnInit() { this.visualiserCalendrier(this.anneeCourante) }

  ouvrirMenuContextuel(event: MouseEvent, jour: CelluleCalendrier) {

  }

  private visualiserCalendrier(anneeCourante: number): void {
    this.recupererJoursNonTravailles(anneeCourante);
    this.construireAnnee(anneeCourante);

    this.jours = [""];
    let premierJour = 1;
    let dernierJour = this.maximumSemainesAnnee + 1;
    for (let i = premierJour; i < dernierJour; i++)
      this.jours.push(this.nomsJours[i % 7])
  }

  private construireMoiss(anneeCourante: number): void {
    this.nomsMois.forEach((_, i) => {
      let premierJour = new Date(anneeCourante, i, 1);
      let totalJours = new Date(anneeCourante, i + 1, 0).getDate();
      let weekends = [];
      let index = premierJour.getDay() - 1;
      for (let jour = 1; jour <= totalJours; jour++) {
        if ((jour + index) % 7 === 0 || (jour + index) % 7 === 6) {
          weekends.push(jour);
        }
      }
      this.ajouterMoisAnnee(i, totalJours, weekends, premierJour.getDay());
    });
  }

  private ajouterMoisAnnee(indexMois: number, totalJours: number, weekends: number[], premierJour: number): void {
    this.moiss.push({
      nom: this.nomsMois[indexMois],
      index: indexMois,
      premierJour: premierJour,
      totalJours: totalJours,
      weekends: weekends
    });
  }

  private construireJourSemaine(anneeCourante: number, premierJourSemaine: number): void {
    this.moiss.forEach(mois => {
      mois.celluleDebut = (mois.premierJour - premierJourSemaine + 7) % 7;
      mois.celluleFin = mois.celluleDebut + mois.totalJours - 1;
      let joursMois = this.construireJoursMois(mois.index, anneeCourante);
      this.datesCalendrier.push(joursMois);
    })
  }

  private construireAnnee(anneeCourante: number): void {
    this.moiss = [];
    this.datesCalendrier = [];
    this.maximumSemainesAnnee = 0;

    this.construireMoiss(anneeCourante);

    let premierJourSemaine = this.recupererPremierJourSemaine();

    this.construireJourSemaine(anneeCourante, premierJourSemaine);
  }

  private recupererPremierJourSemaine(): number {
    let premierJourSemaine = this.moiss.reduce((resultat, index) => {
      if (index.premierJour === 0) {
        return resultat;
      }
      return index.premierJour < resultat ? index.premierJour : resultat;
    }, 6);

    this.calculerMaximumJoursMois(premierJourSemaine);
    return premierJourSemaine;
  }

  private calculerMaximumJoursMois(premierJourSemaine: number): void {
    this.maximumSemainesAnnee = this.moiss.reduce((resultat, index) => {
      let celluleAvantPremierJour = index.premierJour === 0
        ? 6
        : index.premierJour - premierJourSemaine;
      let totalSemaine = celluleAvantPremierJour + index.totalJours;
      return totalSemaine > resultat ? totalSemaine : resultat;
    }, 0);
  }

  private recupererJoursNonTravailles(anneeCourante: number): void {

  }

  private celluleCalendrierParDefaut(i: number, mois: MoisCalendrier, anneeCourante: number, indexJour: number, joursDuMois: CelluleCalendrier[]): number {
    let celluleJour = {} as CelluleCalendrier;
    celluleJour.jour = "";

    if (i >= mois.celluleDebut! && i <= mois.celluleFin!) {
      celluleJour.date = new Date(anneeCourante, mois.index, indexJour, 4);
      celluleJour.jour = "" + indexJour + "";
      indexJour++;
    }
    joursDuMois.push(celluleJour);
    return indexJour;
  }

  chargerAnneePrecedente(event: Event): void {
    this.permettreSelectionSurPlusieursAnnees(event);
    this.visualiserCalendrier(--this.anneeCourante);
  }

  chargerAnneeSuivante(event: Event): void {
    this.permettreSelectionSurPlusieursAnnees(event);
    this.visualiserCalendrier(++this.anneeCourante);
  };

  permettreSelectionSurPlusieursAnnees(event: Event): void {
    if (this.intervalleAbsence?.debut && !this.intervalleAbsence.fin)
      event.stopPropagation();
  }

  construireJoursMois(moisId: number, anneeCourante: number): CelluleCalendrier[] {
    let joursDuMois: CelluleCalendrier[] = [];

    let indexJour = 1;
    let mois = this.moiss[moisId];

    for (let i = 0; i < this.maximumSemainesAnnee; i++) {
      indexJour = this.celluleCalendrierParDefaut(i, mois, anneeCourante, indexJour, joursDuMois);
    }
    return joursDuMois;
  }

  selectionnerIntervalleAbsence(jour: CelluleCalendrier, event?: MouseEvent): void {

  }

  private estAbsence(jourCalendrier: Date): boolean {
    let resultat = false;
    this.absences.forEach(a => {
      if (moment(jourCalendrier) >= a.debut && moment(jourCalendrier) <= a.fin) {
        resultat = true;
      }
    });
    return resultat;
  }

  public annulerSelectionIndirecte(): void {
    if (!this.selectionDirecteEnCours) {
      this.reinitialiserSelectionAbsence();
    }
  }

  public reinitialiserSelectionAbsence(): void {

  }

  private contientAbsence(selection: AbsenceResultat): boolean {
    let resultat = false;
    this.absences.forEach((absence) => {
      if ((absence.debut >= selection.debut && absence.debut <= selection.fin) ||
        (absence.fin >= selection.debut && absence.fin <= selection.fin)) {
        resultat = true;
      }
    });
    return resultat;
  }

  selectionnerJour(jourSelectionne: CelluleCalendrier): void {
    if (jourSelectionne.jour != "")
      this.jourSelectionne = jourSelectionne;
  }

  deselectionnerJour(): void {
    this.jourSelectionne = undefined;
  }

  traiterSelection(event: MouseEvent, jour?: CelluleCalendrier): void {
    if (this.intervalleAbsence && (event.button === 0)) {
      if (!jour || jour.jour === "") {
        this.reinitialiserSelectionAbsence();
      } else if (this.selectionDirecteEnCours && !this.intervalleAbsence.debut.isSame(moment(jour.date))) {
        this.selectionnerIntervalleAbsence(jour, event);
      }
    }
    this.selectionDirecteEnCours = false;
  }

  private enregisterAbsence(periodeAbsence: AbsenceResultat): void {

  }


  private arreterConfirmation(): void {

  }

  private poserAbsence(debut: moment.Moment, fin: moment.Moment): void {

  }


  private modifierAbsence(absenceId: number, debut: Date, fin: Date): void {

  }


  modifier(jour: CelluleCalendrier) {

  }

  supprimer(jour: CelluleCalendrier) {

  }

}
