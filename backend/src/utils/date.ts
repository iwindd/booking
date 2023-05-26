export const getYMDdate = (date : Date) => {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    

    return `${year}-${month}-${day}`
}

export const isDateMinToday = (dateString : any) => {
    const today = new Date();
    const inputDate = new Date(dateString);
  
    // Set the time of both dates to 00:00:00 to compare the dates only
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);
  
    return inputDate >= today;
}

export const formatTime = (time : string) => {
    return (time).substring(0, (time).length - 3)
}

export function mergeDateAndTime(date: Date, time: string): Date {
    const [hours, minutes, seconds] = time.split(':');
    const mergedDate = new Date(date);
    mergedDate.setUTCHours(parseInt(hours, 10));
    mergedDate.setUTCMinutes(parseInt(minutes, 10));
    mergedDate.setUTCSeconds(parseInt(seconds, 10));
    return mergedDate;
}