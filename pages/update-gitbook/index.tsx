import { useState } from "react";
import type { NextPage } from "next";
import styles from '../../styles/updategitbook.module.css'; 

const UpdateGitbook: NextPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    date: "",
    workgroup: "",
    meetingSummary: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    console.log("Submitted Form Data:", formData);
    setLoading(false);
  }

  return (
    <div className={styles['form-container']}>
      <h2>Update GitBook</h2>
      <form onSubmit={handleSubmit} className={styles['gitbook-form']}>
        <label className={styles['form-label']}>
          Date:
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={styles['form-input']}
        />
        <label className={styles['form-label']}>
          Workgroup:
        </label>
        <input
          type="text"
          name="workgroup"
          value={formData.workgroup}
          onChange={handleChange}
          className={styles['form-input']}
          autoComplete="off"
        />
        <label className={styles['form-label']}>
          Meeting Summary Markdown:
        </label>
        <textarea
          name="meetingSummary"
          value={formData.meetingSummary}
          onChange={handleChange}
          className={styles['form-textarea']}
          autoComplete="off"
        />
        <button type="submit" disabled={loading} className={styles['submit-button']}>
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default UpdateGitbook;
