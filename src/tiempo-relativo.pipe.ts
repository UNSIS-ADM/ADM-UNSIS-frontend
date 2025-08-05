import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoRelativo',
  standalone: true
})
export class TiempoRelativoPipe implements PipeTransform {

  transform(value: string | Date): string {
    if (!value) return '';

    const fecha = new Date(value.toString().replace(' ', 'T'));
    const ahora = new Date();

    const diffMs = ahora.getTime() - fecha.getTime();

    const segs = Math.floor(diffMs / 1000);
    const mins = Math.floor(segs / 60);
    const horas = Math.floor(mins / 60);
    const dias = Math.floor(horas / 24);

    if (segs < 60) {
      return `hace unos segundos`;
    }
    if (mins < 60) {
      return `hace ${mins} ${mins === 1 ? 'minuto' : 'minutos'}`;
    }
    if (horas < 24) {
      return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    }
    return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
  }
}
