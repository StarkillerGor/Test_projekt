import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';

function Dashboard() {
const user = localStorage.getItem('user');// Zalogowany użytkownik (przechowywany w localStorage)
  //const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Wszystkie worki '+String(user).toUpperCase());
  const [bgColor, setBgColor] = useState('#ffffe0');
  const [hoverRow, setHoverRow] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const ipAddress = 'http://192.168.0.81:5000';
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  const [field3, setField3] = useState('');
  const [inKaucja, setInKaucja] = useState(false);
  const [storeFilter, setStoreFilter] = useState('');
  const [bagFilter, setBagFilter] = useState('');
  const [appliedStoreFilter, setAppliedStoreFilter] = useState('');
  const [appliedBagFilter, setAppliedBagFilter] = useState('');

  const currentDate = new Date().toISOString().split('T')[0];
  const last30DaysDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];


  // Table data from API
  const [tableData, setTableData] = useState([]);

  // Fetch data from API
 /* const fetchData = async () => {
    try {
      const response = await fetch(`${ipAddress}/worki`);
      const data = await response.json();
      const transformedData = data.map(item => ({
        id: item.id,
        store: item.numer_sklepu,
        bagNumber: item.numer_worka,
        metalDRS: item.metal_drs,
        plasticDRS: item.plastik_drs,
        total: item.metal_drs + item.plastik_drs,
        inKaucja: item.czy_jest_w_kaucja ? 'Tak' : 'Nie',
        dateCreated: item.data_stworzenia ? new Date(item.data_stworzenia).toISOString().split('T')[0] : '-',
        dateReturned: item.data_oddania ? new Date(item.data_oddania).toISOString().split('T')[0] : '-'
      }));
      setTableData(transformedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
*/
  // Fetch data by date range (uses SQL from line 56: SELECT * FROM worki WHERE data_stworzenia BETWEEN ? AND ?)
  const fetchData = useCallback(async (from, to) => {
  try {
    const response = await fetch(
      `${ipAddress}/worki/dates?from=${from + 'T00:00:00'}&to=${to + 'T23:59:59'}`
    );

    const data = await response.json();

    const transformedData = data.map(item => ({
      id: item.id,
      store: item.numer_sklepu,
      bagNumber: item.numer_worka,
      metalDRS: item.metal_drs,
      plasticDRS: item.plastik_drs,
      total: item.metal_drs + item.plastik_drs,
      inKaucja: item.czy_jest_w_kaucja ? 'Tak' : 'Nie',
      dateCreated: item.data_stworzenia
        ? formatDateTime(new Date(item.data_stworzenia))
        : '-',
      dateReturned: item.data_oddania
        ? formatDateTime(new Date(item.data_oddania))
        : '-'
    }));

    setTableData(transformedData);
  } catch (error) {
    console.error('Error fetching data by date range:', error);
  }
}, [ipAddress]);



  // Fetch data by date range and store number (uses SQL from line 67: SELECT * FROM worki WHERE (data_stworzenia BETWEEN ? AND ?) AND numer_sklepu = ?)
 const fetchDataByStoreAndDates = useCallback(async (from, to, sklep) => {
  try {
    const response = await fetch(
      `${ipAddress}/worki/store?from=${from + 'T00:00:00'}&to=${to + 'T23:59:59'}&sklep=${sklep}`
    );

    const data = await response.json();

    const transformedData = data.map(item => ({
      id: item.id,
      store: item.numer_sklepu,
      bagNumber: item.numer_worka,
      metalDRS: item.metal_drs,
      plasticDRS: item.plastik_drs,
      total: item.metal_drs + item.plastik_drs,
      inKaucja: item.czy_jest_w_kaucja ? 'Tak' : 'Nie',
      dateCreated: item.data_stworzenia
        ? formatDateTime(new Date(item.data_stworzenia))
        : '-',
      dateReturned: item.data_oddania
        ? formatDateTime(new Date(item.data_oddania))
        : '-'
    }));

    setTableData(transformedData);
  } catch (error) {
    console.error('Error fetching data by store and dates:', error);
  }
}, [ipAddress]);
useEffect(() => {
  if (user === 'Admin') {
    fetchData(last30DaysDate, currentDate);
  } else {
    fetchDataByStoreAndDates(last30DaysDate, currentDate, user);
  }
}, [user, last30DaysDate, currentDate, fetchData, fetchDataByStoreAndDates]);
  // Row click modal states
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField1, setEditField1] = useState('');
  const [editField2, setEditField2] = useState('');
  const [editField3, setEditField3] = useState('');
  const [editInKaucja, setEditInKaucja] = useState(false);

  // Row click handler
  const handleRowClick = (record) => {
    setSelectedRecord(record);
    setShowOptionsModal(true);
  };



function formatDateTime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}




  // Action handlers
  const handleMarkAsReturned = async () => {
    if (!selectedRecord) {
      return alert('Please select a record');
    }
    
    if (selectedRecord.dateReturned !== '-') {
      return alert('Ten worek już jest oddany do Kaucji.pl');
    }
     if (window.confirm('Czy na pewno oddany ten Worek?')) {
    try {
      const response = await fetch(`${ipAddress}/worki/edit-return/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          czy_jest_w_kaucja: true,
          data_oddania: formatDateTime()
        })
      });
      if (response.ok) {
       if (user === 'Admin') {
    fetchData(last30DaysDate, currentDate);
  } else {
    fetchDataByStoreAndDates(last30DaysDate, currentDate, user);
  } // Refresh data
        setShowOptionsModal(false);
        setSelectedRecord(null);
      } else {
        alert('Error updating record');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating record');
    }
  }
  };

  const handleEdit = () => {
    if (!selectedRecord) return;
    setEditField1(selectedRecord.bagNumber);
    setEditField2(String(selectedRecord.metalDRS ?? ''));
    setEditField3(String(selectedRecord.plasticDRS ?? ''));
    setEditInKaucja(selectedRecord.inKaucja === 'Tak');
    setShowOptionsModal(false);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRecord || !editField1) {
      alert('Wypełnij wszystkie pola');
      return;
    }
    try {
      const response = await fetch(`${ipAddress}/worki/edit-main/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numer_worka: editField1,
          metal_drs: parseInt(editField2),
          plastik_drs: parseInt(editField3),
          czy_jest_w_kaucja: editInKaucja
        })
      });
      if (response.ok) {
        if (user === 'Admin') {
          fetchData(last30DaysDate, currentDate);
        } else {
          fetchDataByStoreAndDates(last30DaysDate, currentDate, user);
        }
        setShowEditModal(false);
        setSelectedRecord(null);
        setEditField1('');
        setEditField2('');
        setEditField3('');
        setEditInKaucja(false);
      } else {
        alert('Error updating record');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating record');
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    if (window.confirm('Czy na pewno chcesz usunąć ten rekord?')) {
      try {
        const response = await fetch(`${ipAddress}/worki/${selectedRecord.id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          if (user === 'Admin') {
          fetchData(last30DaysDate, currentDate);
        } else {
          fetchDataByStoreAndDates(last30DaysDate, currentDate, user);
        }// Refresh data
          setShowOptionsModal(false);
          setSelectedRecord(null);
        } else {
          alert('Error deleting record');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting record');
      }
    }
  };

  const filteredData = tableData.filter((row) => {
    const storeMatch = appliedStoreFilter.trim() === '' || row.store.toLowerCase().includes(appliedStoreFilter.trim().toLowerCase());
    const bagMatch = appliedBagFilter.trim() === '' || row.bagNumber.toLowerCase().includes(appliedBagFilter.trim().toLowerCase());
    
    // Apply tab-based filtering
    let tabMatch = true;
    if (activeTab.startsWith('Worki oddane')) {
      tabMatch = row.dateReturned !== '-'; // Show only records with a return date
    } else if (activeTab.startsWith('Niema w Kaucji.pl')) {
      tabMatch = row.inKaucja === 'Nie'; // Show only records NOT in Kaucja
    } else if (activeTab.startsWith('Nie oddany kurierowi')) {
      tabMatch = row.dateReturned === '-'; // Show records not returned
    }
    // For 'Worki na stanie', show all records (tabMatch stays true)
    
    return storeMatch && bagMatch && tabMatch;
  });

  const handleApplyFilters = () => {
    const fromDate = new Date(document.querySelector('input[name="from_date_filter"]').value).toISOString().split('T')[0]+' 00:00:00';
    const toDate = new Date(document.querySelector('input[name="to_date_filter"]').value).toISOString().split('T')[0]+' 23:59:59';
    console.log('Applying filters with dates:', fromDate, toDate, 'and store:', storeFilter);
     if (user === 'Admin') {
      setAppliedStoreFilter(storeFilter);
    setAppliedBagFilter(bagFilter);
    fetchDataByStoreAndDates(fromDate, toDate, storeFilter);
    } else {
      setAppliedStoreFilter(user);
    setAppliedBagFilter(bagFilter);
    fetchDataByStoreAndDates(fromDate, toDate, user);
    }
    
  };

  const handleClearFilters = () => {
    document.querySelector('input[name="from_date_filter"]').value = last30DaysDate;
    document.querySelector('input[name="to_date_filter"]').value = currentDate;
    setStoreFilter('');
    setBagFilter('');
    setAppliedStoreFilter('');
    setAppliedBagFilter('');
    if (user === 'Admin') {
          fetchData(last30DaysDate, currentDate);
        } else {
          fetchDataByStoreAndDates(last30DaysDate, currentDate, user);
        }
  };

  const handleReloadTable = () => {
    if (user === 'Admin') {
      fetchData(last30DaysDate, currentDate);
    } else {
      fetchDataByStoreAndDates(last30DaysDate, currentDate, user);
    }
  };

  
 

  const handleSave = async () => {
    
    if (!field1 || String(field1).length < 15) {
      alert('Wypełni cały numer worka (15 znaków)');
      return;
    }else{

    try {
      const response = await fetch(`${ipAddress}/worki`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numer_sklepu: user,
          numer_worka: field1,
          metal_drs: parseInt(field2),
          plastik_drs: parseInt(field3),
          czy_jest_w_kaucja: inKaucja
        })
      });
      if (response.ok) {
        alert('Wpis dodany');
        if (user === 'Admin') {
          fetchData(last30DaysDate, currentDate);
        } else {
          fetchDataByStoreAndDates(last30DaysDate, currentDate, user);
        }
        setField1('');
        setField2('');
        setField3('');
        setInKaucja(false);
        setShowModal(false);
      } else {
        alert('Error adding record');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding record');
    }
  }
  };

  // Export table data to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tableData, {
      header: ['id', 'store', 'bagNumber', 'metalDRS', 'plasticDRS', 'total', 'inKaucja', 'dateCreated', 'dateReturned']
    });

    // Set column headers
    const headers = ['ID', 'Numer sklepu', 'Numer worka', 'Metal DRS', 'Plastik DRS', 'Ogólem', 'Czy jest w Kaucja.pl?', 'Data stworzenia', 'Data oddania'];
    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 10 },
      { wch: 18 },
      { wch: 15 },
      { wch: 15 }
    ];

    // Add headers to the first row
    for (let i = 0; i < headers.length; i++) {
      const cellRef = XLSX.utils.encode_col(i) + '1';
      worksheet[cellRef].v = headers[i];
      worksheet[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: 'C0C0C0' } }
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab);
    XLSX.writeFile(workbook, `${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };



  return (
    <div style={{...styles.page, backgroundColor: bgColor}}>
      
      <div style={styles.tabs}>
        <button style={{...styles.tabButton, backgroundColor: 'yellow'}} onClick={() => {setActiveTab('Wszystkie worki ' + String(user).toUpperCase()); setBgColor('#ffffe0');}}>Wszystkie worki </button>
        <button style={{...styles.tabButton, backgroundColor: 'lightgreen'}} onClick={() => {setActiveTab('Worki oddane ' + String(user).toUpperCase()); setBgColor('#9dc29d');}}>Worki oddane</button>
        <button style={{...styles.tabButton, backgroundColor: 'lightblue'}} onClick={() => {setActiveTab('Niema w Kaucji.pl ' + String(user).toUpperCase()); setBgColor('#c290c7');}}>Niema w Kaucji.pl</button>
        <button style={{...styles.tabButton, backgroundColor: 'lightcoral'}} onClick={() => {setActiveTab('Nie oddany kurieru ' + String(user).toUpperCase()); setBgColor('#bb6b6b');}}>Nie oddany kurieru</button>
      </div>

      <h3 style={styles.title}>{activeTab}</h3>

      <div style={styles.dateBlock}>
        <label style={styles.dateLabel}>Data od:</label>
        <input type="date" defaultValue={last30DaysDate}   name="from_date_filter" style={styles.dateInput}/>

        <label style={styles.dateLabel}>Data do:</label>
        <input type="date"  defaultValue={currentDate} name="to_date_filter" style={styles.dateInput}/>
         <div  style={{...styles.filterRow,marginLeft: '100px', display: user === 'Admin' ? 'flex' : 'none'}}>
          <label style={styles.dateLabel}>Numer sklepu</label>
          <input
            type="text"
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            placeholder="Wpisz numer sklepu"
            style={styles.dateInput}
          />
        </div>
        <div style={styles.filterRow} id="bagFilter_hide">
          <label style={styles.dateLabel}>Numer worka</label>
          <input
            type="text"
            value={bagFilter}
            onChange={(e) => setBagFilter(e.target.value)}
            placeholder="Wpisz numer worka"
            style={styles.dateInput}
          />
        </div>
        <div style={styles.filterActions}>
          <button style={styles.filterButton} onClick={handleApplyFilters}>Zastosuj filtry</button>
          <button style={{...styles.filterButton, backgroundColor: '#999'}} onClick={handleClearFilters}>Wyczyść filtry</button>
          <button style={{...styles.filterButton, backgroundColor: '#28a745'}} onClick={handleReloadTable}>🔄 Odśwież</button>
        </div>
      </div>

     
      <div style={styles.buttonContainer}>
        <button style={styles.addButton} onClick={() => setShowModal(true)}>
          Dodaj nowy worek
        </button>
        <button style={styles.exportButton} onClick={exportToExcel}>
          📥 Eksportuj do Excel
        </button>
      </div>

      <div style={styles.tableWrapper}>
        <table style={{...styles.table, position: 'relative', top: 0,overflowY: 'auto'}}>
          <thead>
            <tr>
              <th style={{...styles.tableCell, ...styles.tableHeader, position: 'sticky', top: 0}}>ID</th>
              <th style={{...styles.tableCell, ...styles.tableHeader, position: 'sticky', top: 0}}>Numer sklepu</th>
              <th style={{...styles.tableCell, ...styles.tableHeader, position: 'sticky', top: 0}}>Numer worka</th>
              <th style={{...styles.tableCell, ...styles.tableHeader, position: 'sticky', top: 0}}>Metal DRS</th>
              <th style={{...styles.tableCell, ...styles.tableHeader, position: 'sticky', top: 0}}>Plastik DRS</th>
              <th style={{...styles.tableCell, ...styles.tableHeader, position: 'sticky', top: 0}}>Ogólem</th>
              <th style={{...styles.tableCell, ...styles.tableHeader, position: 'sticky', top: 0}}>Czy jest w Kaucja.pl?</th>
              <th style={{...styles.tableCell, ...styles.tableHeader, position: 'sticky', top: 0}}>Data stworzenia</th>
              <th style={{...styles.tableCell, ...styles.tableHeader, position: 'sticky', top: 0}}>Data oddania</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr 
                key={index}
                onMouseEnter={() => setHoverRow(index)}
                onMouseLeave={() => setHoverRow(null)}
                onClick={() => handleRowClick(row)}
                style={{
                  backgroundColor: hoverRow === index ? '#cef091' : index % 2 === 0 ? '#ffffff' : '#f9fafb',
                  transition: 'background-color 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <td style={styles.tableCell}>{row.id}</td>
                <td style={styles.tableCell}>{row.store}</td>
                <td style={styles.tableCell}>{row.bagNumber}</td>
                <td style={styles.tableCell}>{row.metalDRS}</td>
                <td style={styles.tableCell}>{row.plasticDRS}</td>
                <td style={styles.tableCell}><strong>{row.total}</strong></td>
                <td style={styles.tableCell}>{row.inKaucja === 'Tak' ? '✓' : '✗'}</td>
                <td style={styles.tableCell}>{row.dateCreated}</td>
                <td style={styles.tableCell}>{row.dateReturned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{...styles.modalTitle, fontSize: '28px'}}>Dodaj nowy worek</h3>

           <div style={styles.formGroup}>
  <label style={styles.formLabel}>🎫 Numer worka</label>
  <input
    type="text"
    name="bagNumber_input"
    placeholder="Wpisz 15-cyfrowy numer"
    value={field1}
    maxLength={15}
    onChange={(e) => {
      const value = e.target.value;
      if (/^\d*$/.test(value)) {
        setField1(value);
      }
    }}
    style={styles.modalInput}
  />
</div>

<div style={styles.formGroup}>
  <label style={styles.formLabel}>🥫 Metal (liczba puszek)</label>
  <input
    type="text"
    name="metal_input"
    placeholder="Wpisz liczbę"
    value={field2}
    onChange={(e) => setField2(e.target.value)}
    style={styles.modalInput}
  />
</div>

<div style={styles.formGroup}>
  <label style={styles.formLabel}>🍾 Plastik (liczba butelek)</label>
  <input
    placeholder="Wpisz liczbę"
    value={field3}
    onChange={(e) => setField3(e.target.value)}
    style={styles.modalInput}
  />
</div>

<div style={styles.checkboxGroup}>
  <label style={styles.checkboxLabel}>
    <input
      type="checkbox"
      checked={inKaucja}
      onChange={(e) => setInKaucja(e.target.checked)}
      style={{marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer'}}
    />
    Czy jest w kaucja.pl?
  </label>
</div>

            <button onClick={handleSave} style={styles.modalButton}>Zatwierdź</button>
            <button onClick={() => setShowModal(false)} style={{...styles.modalButton, backgroundColor: '#eb7718'}}>Anuluj</button>
          </div>
        </div>
      )}

      {showOptionsModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Opcje dla worka {selectedRecord?.bagNumber}</h3>
            <button onClick={handleMarkAsReturned} style={styles.modalButton}>Worek oddany do Kaucji</button>
            <button onClick={handleEdit} style={styles.modalButton}>Edytuj dane</button>
            <button hidden={user !== 'Admin'} onClick={handleDelete} name="delete_rec_button" style={{...styles.modalButton, backgroundColor: '#dc3545'}}>Usuń record z tablicy</button>
            <button onClick={() => { setShowOptionsModal(false); setSelectedRecord(null); }} style={{...styles.modalButton, backgroundColor: '#6c757d'}}>Zamknij</button>
          </div>
        </div>
      )}

      {showEditModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Edytuj dane worka</h3>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>🎫 Numer worka</label>
              <input
                placeholder="Wpisz 15-cyfrowy numer"
                value={editField1}
                onChange={(e) => setEditField1(e.target.value)}
                style={styles.modalInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>🥫 Metal (liczba puszek)</label>
              <input
                placeholder="Wpisz liczbę"
                value={editField2}
                onChange={(e) => setEditField2(e.target.value)}
                style={styles.modalInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>🍾 Plastik (liczba butelek)</label>
              <input
                placeholder="Wpisz liczbę"
                value={editField3}
                onChange={(e) => setEditField3(e.target.value)}
                style={styles.modalInput}
              />
            </div>

            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={editInKaucja}
                  onChange={(e) => setEditInKaucja(e.target.checked)}
                  style={{marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer'}}
                />
                Czy jest w kaucja.pl?
              </label>
            </div>

            <button onClick={handleSaveEdit} style={styles.modalButton}>Zatwierdź</button>
            <button onClick={() => { setShowEditModal(false); setSelectedRecord(null); setEditField1(''); setEditField2(''); setEditField3(''); setEditInKaucja(false); }} style={{...styles.modalButton, backgroundColor: '#eb7718'}}>Anuluj</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  page: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    height: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  tabs: {
    width: '100%',
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
  },
  tabButton: {
    flex: 1,
    padding: '15px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '8px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  dateBlock: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
    justifyContent: 'space-between',
  },
  addButton: {
    padding: '12px 24px',
    marginBottom: '0px',
    flex: 1,
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  exportButton: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    flex: 1,
    transition: 'background-color 0.2s, transform 0.1s',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    marginBottom: '20px',
    border: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    minWidth: '900px',
  },
  tableWrapper: {
    width: '100%',
    flex: '1 1 auto',
    minHeight: 0,
    height: 'calc(100vh - 310px)',
    overflowY: 'auto',
    overflowX: 'auto',
    borderRadius: '12px',
    backgroundColor: 'white',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    marginBottom: '20px',
  },
  tableHeader: {
    backgroundColor: '#2c3e50',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'left',
    padding: '15px 12px',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    position: 'sticky',
    top: 0,
    zIndex: 2,
    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
  },
  tableCell: {
    padding: '14px 12px',
    border: 'none',
    borderBottom: '1px solid #ecf0f1',
    textAlign: 'left',
    fontSize: '14px',
    color: '#2c3e50',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    width: '350px',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  modalTitle: {
    color: '#2c3e50',
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '0px',
    marginBottom: '15px',
    borderBottom: '2px solid #007BFF',
    paddingBottom: '10px',
  },
  button: {
    padding: '15px 30px',
  },
  dateLabel: {
    fontWeight: 'bold',
    color: '#2c3e50',
    minWidth: '70px',
  },
  dateInput: {
    padding: '8px 12px',
    border: '1px solid #bdc3c7',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  filterBlock: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  filterRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '220px',
    flex: '1',
  },
  filterActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  filterButton: {
    padding: '10px 18px',
    backgroundColor: '#007BFF',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  modalInput: {
    padding: '12px 14px',
    border: '1px solid #bdc3c7',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  modalButton: {
    padding: '12px 20px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
    marginTop: '10px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '15px',
  },
  formLabel: {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: '14px',
    marginBottom: '5px',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '15px',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: '500',
    color: '#2c3e50',
    cursor: 'pointer',
  },
  title: {
    color: '#2c3e50',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    marginTop: '0px',
    borderBottom: '3px solid #007BFF',
    paddingBottom: '10px',
  },
};
 

export default Dashboard;